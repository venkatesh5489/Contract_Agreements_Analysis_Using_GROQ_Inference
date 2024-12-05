from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import logging
import os
import json
from utils.nlp import (
    extract_text_from_file,
    preprocess_text,
    extract_clauses,
    match_clauses,
    generate_comparison_table,
    generate_summary,
    generate_recommendations,
    export_report_to_json,
)
from utils.db import insert_raw_text, insert_extracted_clauses
from utils.db_init import db
from models import UploadedDocument, ExtractedClause
from tabulate import tabulate

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize Flask App
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user_1:0123456@localhost:5433/Project_00'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Utility Function to Store Uploaded Files
def store_file(user_id, document_type, file):
    try:
        filename = f'{user_id}_{document_type}_{file.filename}'
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        logging.info(f'Saving file to: {file_path}')
        file.save(file_path)
        logging.info('File saved successfully')
        return file_path
    except Exception as e:
        logging.error(f'Error saving file: {e}')
        return None

# Core Processing Function
def process_file(file_path, document_type, user_id):
    raw_text = extract_text_from_file(file_path)
    if not raw_text:
        logging.error(f'Failed to extract text from {file_path}')
        return None

    # Preprocess text and extract clauses
    processed_text = preprocess_text(raw_text)
    processed_text_str = ' '.join(processed_text)
    clauses, entities = extract_clauses(processed_text_str)

    # Structure clauses with 'content'
    structured_clauses = {clause_name: {'content': clause_content} for clause_name, clause_content in clauses.items()}

    # Insert into database
    document_id = insert_raw_text(user_id, os.path.basename(file_path), document_type, raw_text, file_path)
    insert_extracted_clauses(document_id, structured_clauses)

    logging.info(f'{document_type.capitalize()} terms processed successfully for user {user_id}')
    return document_id

# API Endpoints

@app.route('/upload/contract', methods=['POST'])
def upload_contract_terms():
    """
    Upload and process contract terms document.
    """
    user_id = 1  # Simulating user ID for now
    logging.info(f'Processing contract terms for user_id: {user_id}')
    file = request.files['file']

    file_path = store_file(user_id, 'contract', file)
    if not file_path:
        return jsonify({'error': 'Failed to save contract file'}), 500

    document_id = process_file(file_path, 'contract', user_id)
    if document_id:
        return jsonify({'message': 'Contract terms processed successfully', 'document_id': document_id})
    else:
        return jsonify({'error': 'Failed to process contract terms'}), 500

@app.route('/upload/expected', methods=['POST'])
def upload_expected_terms():
    """
    Upload and process expected terms document.
    """
    user_id = 1  # Simulating user ID for now
    logging.info(f'Processing expected terms for user_id: {user_id}')
    file = request.files['file']

    file_path = store_file(user_id, 'expected', file)
    if not file_path:
        return jsonify({'error': 'Failed to save expected terms file'}), 500

    document_id = process_file(file_path, 'expected', user_id)
    if document_id:
        return jsonify({'message': 'Expected terms processed successfully', 'document_id': document_id})
    else:
        return jsonify({'error': 'Failed to process expected terms'}), 500

@app.route('/generate_report', methods=['GET'])
def generate_feedback_report():
    """
    Generate feedback report by comparing the latest uploaded contract and expected terms.
    """
    try:
        # Retrieve latest expected terms
        expected_doc = UploadedDocument.query.filter_by(document_type='expected').order_by(UploadedDocument.id.desc()).first()
        if not expected_doc:
            return jsonify({'error': 'No expected terms found'}), 404
        expected_clauses = {clause.clause_name: clause.clause_content for clause in ExtractedClause.query.filter_by(document_id=expected_doc.id).all()}

        # Retrieve latest contract terms
        contract_doc = UploadedDocument.query.filter_by(document_type='contract').order_by(UploadedDocument.id.desc()).first()
        if not contract_doc:
            return jsonify({'error': 'No contract terms found'}), 404
        contract_clauses = {clause.clause_name: clause.clause_content for clause in ExtractedClause.query.filter_by(document_id=contract_doc.id).all()}

        # Compare clauses and generate report
        matched_clauses = match_clauses(expected_clauses, contract_clauses)
        comparison_table = generate_comparison_table(matched_clauses, expected_clauses, contract_clauses)
        summary = generate_summary(matched_clauses, len(expected_clauses))
        recommendations = generate_recommendations(comparison_table)

        # Generate and log the report
        report_json = export_report_to_json(comparison_table, summary, recommendations)
        logging.info('Feedback report generated successfully')

        # Print report to terminal
        print_human_readable_report(report_json)

        return jsonify({'report': report_json})

    except Exception as e:
        logging.error(f'Error generating feedback report: {e}')
        return jsonify({'error': 'Failed to generate feedback report'}), 500


from tabulate import tabulate

def print_human_readable_report(report_json):
    """
    Print the feedback report in a human-readable format to the terminal.
    
    Args:
        report_json (str): The JSON report generated by the application.
    """
    # Convert JSON string to a Python dictionary
    report_data = json.loads(report_json)

    # Print Header Section
    print("\n=== Feedback Report (User-Specific) ===")
    print("Header Section")
    print(f"  Contract Name       : {report_data.get('Contract Name', 'N/A')}")
    print(f"  Expected Terms Name : {report_data.get('Expected Terms Name', 'N/A')}")
    print(f"  Conformity Percentage: {report_data['Summary'].get('Conformity Percentage', 'N/A'):.2f}%")
    print(f"  Date Processed      : {report_data.get('Date Processed', 'N/A')}\n")

    # Print the Comparison Table
    print("=== Comparison Table ===")
    table_data = [
        [
            entry['Clause Name'],
            entry['Expected Terms'][:50] + '...' if len(entry['Expected Terms']) > 50 else entry['Expected Terms'],
            entry['Uploaded Contract'][:50] + '...' if len(entry['Uploaded Contract']) > 50 else entry['Uploaded Contract'],
            entry['Status'],
            entry['Remarks']
        ]
        for entry in report_data['Comparison Table']
    ]
    print(tabulate(table_data, headers=["Clause", "Expected Terms", "Uploaded Contract", "Status", "Remarks"], tablefmt="grid"))

    # Print the Summary
    print("\n=== Summary ===")
    summary = report_data['Summary']
    print(f"  Matches:    {summary.get('Matches', 0)} ({summary.get('Conformity Percentage', 0):.2f}%)")
    print(f"  Mismatches: {summary.get('Mismatches', 0)} ({100 - summary.get('Conformity Percentage', 0):.2f}%)\n")

    # Print Recommendations
    print("=== Recommendations ===")
    if report_data['Recommendations']:
        for recommendation in report_data['Recommendations']:
            print(f"  Clause Name       : {recommendation['Clause Name']}")
            print(f"  Recommendation    : {recommendation['Recommendation']}\n")
    else:
        print("  No recommendations available. All clauses match the expected terms.")


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    """
    return jsonify({'status': 'success', 'message': 'Server is running smoothly'})

# Error Handlers

@app.errorhandler(404)
def not_found_error(error):
    logging.error(f'404 Error: {error}')
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logging.error(f'500 Error: {error}')
    return jsonify({'error': 'Internal server error'}), 500



# Endpoint to fetch previous comparisons
@app.route('/dashboard/previous_comparisons', methods=['GET'])
def get_previous_comparisons():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    status = request.args.get('status')
    query = Comparison.query
    if start_date:
        query = query.filter(Comparison.date_of_comparison >= start_date)
    if end_date:
        query = query.filter(Comparison.date_of_comparison <= end_date)
    if status:
        query = query.filter_by(status=status)
    comparisons = query.all()
    results = [{
        "id": comp.id,
        "contract_document_name": comp.contract_document_name,
        "expected_terms_document_name": comp.expected_terms_document_name,
        "date_of_comparison": comp.date_of_comparison.isoformat(),
        "status": comp.status
    } for comp in comparisons]
    return jsonify(results)

# Endpoint to re-run a comparison
@app.route('/dashboard/recompare', methods=['POST'])
def recompare():
    data = request.json
    comparison_id = data.get('comparison_id')
    comparison = Comparison.query.get(comparison_id)
    if not comparison:
        return jsonify({"error": "Comparison not found"}), 404
    comparison.status = "In Progress"
    db.session.commit()
    return jsonify({"message": "Re-comparison initiated successfully.", "status": "In Progress"})

# Endpoint to get comparison details
@app.route('/dashboard/comparison_details/<int:comparison_id>', methods=['GET'])
def get_comparison_details(comparison_id):
    comparison = Comparison.query.get(comparison_id)
    if not comparison:
        return jsonify({"error": "Comparison not found"}), 404
    details = {  # Example data
        "matched_terms": ["term1", "term2"],
        "unmatched_terms": ["term3"],
        "discrepancies": ["term4 is missing in the contract."]
    }
    result = {
        "id": comparison.id,
        "contract_document_name": comparison.contract_document_name,
        "expected_terms_document_name": comparison.expected_terms_document_name,
        "date_of_comparison": comparison.date_of_comparison.isoformat(),
        "status": comparison.status,
        "details": details
    }
    return jsonify(result)

# Endpoint to download a report
@app.route('/dashboard/report_download', methods=['POST'])
def report_download():
    data = request.json
    comparison_id = data.get('comparison_id')
    comparison = Comparison.query.get(comparison_id)
    if not comparison or not comparison.result_path:
        return jsonify({"error": "Report not found"}), 404
    return send_file(comparison.result_path, as_attachment=True, 
                     attachment_filename=f"comparison_report_{comparison_id}.pdf")

# Endpoint to delete a comparison
@app.route('/dashboard/delete_comparison/<int:comparison_id>', methods=['DELETE'])
def delete_comparison(comparison_id):
    comparison = Comparison.query.get(comparison_id)
    if not comparison:
        return jsonify({"error": "Comparison not found"}), 404
    if comparison.result_path and os.path.exists(comparison.result_path):
        os.remove(comparison.result_path)
    db.session.delete(comparison)
    db.session.commit()
    return jsonify({"message": "Comparison deleted successfully."})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        logging.info('Database tables created and initialized')
    app.run(debug=True)
