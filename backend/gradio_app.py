import gradio as gr
from flask_app import app, process_file, store_file
import tempfile
import os
import shutil
from utils.nlp import (
    match_clauses,
    generate_comparison_table,
    generate_summary,
    generate_recommendations,
)

def process_documents(contract_file, expected_file):
    try:
        if not (contract_file and expected_file):
            return "Please upload both contract and expected terms documents."

        # Create temporary directory for file storage
        with tempfile.TemporaryDirectory() as temp_dir:
            # Process contract file
            contract_path = os.path.join(temp_dir, "contract.pdf")
            with open(contract_path, 'wb') as f:
                f.write(contract_file)
            
            # Process expected terms file
            expected_path = os.path.join(temp_dir, "expected.pdf")
            with open(expected_path, 'wb') as f:
                f.write(expected_file)

            # Process the files
            contract_id = process_file(contract_path, 'contract', user_id=1)
            expected_id = process_file(expected_path, 'expected', user_id=1)

            # Compare documents
            with app.app_context():
                # Get the processed clauses from database
                from models import UploadedDocument, ExtractedClause
                contract_doc = UploadedDocument.query.get(contract_id)
                expected_doc = UploadedDocument.query.get(expected_id)
                
                contract_clauses = {clause.name: clause.content for clause in contract_doc.clauses}
                expected_clauses = {clause.name: clause.content for clause in expected_doc.clauses}

                # Generate comparison results
                matches = match_clauses(contract_clauses, expected_clauses)
                comparison_table = generate_comparison_table(matches)
                summary = generate_summary(matches)
                recommendations = generate_recommendations(matches)

                # Format output
                output = f"""
## Document Comparison Results

### Summary
{summary}

### Detailed Comparison
{comparison_table}

### Recommendations
{recommendations}
"""
                return output
    except Exception as e:
        return f"Error processing documents: {str(e)}"

# Create Gradio interface
iface = gr.Interface(
    fn=process_documents,
    inputs=[
        gr.File(label="Upload Contract Document (PDF only)", file_types=[".pdf"], type="binary"),
        gr.File(label="Upload Expected Terms Document (PDF only)", file_types=[".pdf"], type="binary")
    ],
    outputs=gr.Markdown(),
    title="Insurance Contract Review System",
    description="Upload your PDF contract documents to compare and analyze them.",
    theme="default"
)

if __name__ == "__main__":
    # Launch the interface
    iface.launch(server_name="0.0.0.0", server_port=7860)