import os
import logging
import re
import json
from PyPDF2 import PdfReader
from docx import Document
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline
import spacy

# Initialize NLP Models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer("all-MiniLM-L6-v2")
classifier = pipeline("text-classification", model="distilbert-base-uncased")

# Logging Configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Default Clause Synonyms
DEFAULT_CLAUSE_SYNONYMS = {
    "effective_date": ["effective date", "start date", "commencement"],
    "termination_conditions": ["termination", "end clause", "exit terms", "contract duration"],
    "scope_of_work": ["scope of work", "work description", "deliverables"],
    "payment_terms": ["payment", "pricing", "financial terms", "total cost", "payment schedule"],
    "confidentiality": ["confidentiality", "non-disclosure", "NDA"],
    "dispute_resolution": ["dispute resolution", "arbitration", "conflict resolution", "legal action"],
    "intellectual_property": ["intellectual property", "ownership", "IP rights", "patents"],
    "governing_law": ["governing law", "jurisdiction", "applicable law", "legal jurisdiction"],
    "indemnity": ["indemnity", "compensation", "damages", "losses"],
    "warranties_and_representations": ["warranties", "representations", "guarantees"],
    "force_majeure": ["force majeure", "unforeseen circumstances", "act of god"],
    "conflicts_of_interest": ["conflicts of interest", "conflict of interest", "neutrality"],
    "amendments_and_modifications": ["amendments", "modifications", "changes"],
    "non_compete": ["non-compete", "restrictive covenant", "competition clause"],
    "non_solicitation": ["non-solicitation", "no solicitation", "client solicitation"],
    "assignment": ["assignment", "transfer of rights", "transfer of obligations"],
    "severability": ["severability", "invalidity", "severability clause"],
    "entire_agreement": ["entire agreement", "complete agreement", "full agreement"],
    "termination_rights": ["termination rights", "termination clause", "contract termination"],
    "audit_rights": ["audit rights", "audit clause", "inspection rights"],
    "payment_schedule": ["payment schedule", "installments", "payment terms"],
}

# Flexible Synonym Builder
def build_synonyms(custom_synonyms=None):
    global DEFAULT_CLAUSE_SYNONYMS
    if custom_synonyms:
        for clause, synonyms in custom_synonyms.items():
            if clause in DEFAULT_CLAUSE_SYNONYMS:
                DEFAULT_CLAUSE_SYNONYMS[clause].extend(synonyms)
            else:
                DEFAULT_CLAUSE_SYNONYMS[clause] = synonyms
    return DEFAULT_CLAUSE_SYNONYMS

# Extract Text from File
def extract_text_from_file(file_path):
    try:
        text = ""
        if file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            raise ValueError("Unsupported file format")
        return text.strip()
    except Exception as e:
        logging.error(f"Error extracting text from file {file_path}: {e}")
        return ""

# Preprocess Text
def preprocess_text(text):
    text = re.sub(r"\s+", " ", text.lower())
    doc = nlp(text)
    return [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]

# Extract Clauses
def extract_clauses(text, synonyms=None):
    clauses = {}
    entities = {}
    clause_synonyms = build_synonyms(synonyms)

    for clause, keywords in clause_synonyms.items():
        synonyms_regex = "|".join(re.escape(keyword) for keyword in keywords)
        clause_pattern = r"(\b(?:{synonyms})[:\s]+.*?)(?=\n{{2,}}|\Z)"
        full_pattern = clause_pattern.format(synonyms=synonyms_regex)
        matches = re.findall(full_pattern, text, re.IGNORECASE | re.DOTALL)
        clauses[clause] = matches[0].strip() if matches else ""
        if matches:
            logging.info(f"Clause '{clause}' matched successfully.")
        else:
            logging.warning(f"Clause '{clause}' not found.")

    doc = nlp(text)
    entities = {ent.label_: ent.text for ent in doc.ents}
    return clauses, entities

# Match Clauses
def match_clauses(expected_clauses, uploaded_clauses):
    matched_clauses = {}
    for expected_name, expected_content in expected_clauses.items():
        best_match, highest_similarity = None, 0
        for uploaded_name, uploaded_content in uploaded_clauses.items():
            similarity = util.pytorch_cos_sim(
                model.encode(expected_content), model.encode(uploaded_content)
            ).item()
            if similarity > highest_similarity:
                highest_similarity = similarity
                best_match = uploaded_name
        status = (
            "exact"
            if highest_similarity >= 0.9
            else "partial"
            if highest_similarity >= 0.75
            else "mismatch"
        )
        matched_clauses[expected_name] = {
            "match": best_match,
            "similarity": highest_similarity,
            "status": status,
        }
    return matched_clauses

# Generate Comparison Table
def generate_comparison_table(matched_clauses, expected_clauses, uploaded_clauses):
    comparison_table = []
    for clause, match_info in matched_clauses.items():
        comparison_table.append({
            "Clause Name": clause,
            "Expected Terms": expected_clauses.get(clause, "Not Found"),
            "Uploaded Contract": uploaded_clauses.get(match_info["match"], "Not Found"),
            "Status": "✅ Match" if match_info["status"] == "exact" else "🚩 Mismatch",
            "Remarks": "" if match_info["status"] == "exact" else f"Discrepancy in {clause}",
        })
    return comparison_table

# Generate Summary
def generate_summary(matched_clauses, *args):
    exact_matches = sum(1 for match in matched_clauses.values() if match['status'] == 'exact')
    mismatches = len(matched_clauses) - exact_matches
    
    if args:
        total_clauses = args[0]
    else:
        total_clauses = len(matched_clauses)
    
    conformity_percentage = (exact_matches / total_clauses) * 100 if total_clauses > 0 else 0
    
    return {
        'Exact Matches': exact_matches,
        'Mismatches': mismatches,
        'Conformity Percentage': conformity_percentage
    }

# Generate Recommendations
def generate_recommendations(comparison_table):
    recommendations = []
    for entry in comparison_table:
        if entry["Status"] == "🚩 Mismatch":
            recommendations.append({
                "Clause Name": entry["Clause Name"],
                "Recommendation": f"Align the '{entry['Clause Name']}' with expected terms."
            })
    return recommendations

# Export Feedback Report to JSON
def export_report_to_json(comparison_table, summary, recommendations):
    return json.dumps({
        "Comparison Table": comparison_table,
        "Summary": summary,
        "Recommendations": recommendations,
    }, indent=4)
