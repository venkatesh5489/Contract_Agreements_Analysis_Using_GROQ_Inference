import logging
from datetime import datetime
from models.schema import db, UploadedDocument, ExtractedClause

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Function to insert raw text into the UploadedDocument table
def insert_raw_text(user_id, document_name, document_type, raw_text, upload_path):
    document = UploadedDocument(
        user_id=user_id,
        document_name=document_name,
        document_type=document_type,
        raw_text=raw_text,
        upload_path=upload_path
    )
    db.session.add(document)
    db.session.commit()
    return document.id

# Function to calculate conformity scores
def calculate_conformity_score(matched_clauses, total_expected_clauses):
    matches = len(matched_clauses)
    mismatches = total_expected_clauses - matches
    match_percentage = (matches / total_expected_clauses) * 100 if total_expected_clauses else 0
    return {
        'Matches': matches,
        'Mismatches': mismatches,
        'Conformity Percentage': match_percentage
    }

# Function to insert extracted clauses into the ExtractedClauses table
def insert_extracted_clauses(document_id, clauses):
    batch = []
    for clause_name, content in clauses.items():
        clause = ExtractedClause(
            document_id=document_id,
            clause_name=clause_name,
            clause_content=content['content'],
            entities=content.get('entities')
        )
        batch.append(clause)
    db.session.bulk_save_objects(batch)
    db.session.commit()
