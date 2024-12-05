# Define ExtractedClauses model
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from utils.db_init import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Define relationships if needed

class UploadedDocument(db.Model):
    __tablename__ = 'uploaded_documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)
    upload_path = db.Column(db.Text, nullable=False)
    raw_text = db.Column(db.Text, nullable=True)  # New column for raw text
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    extracted_clauses = db.relationship('ExtractedClause', backref='uploaded_document', lazy=True)

class ExtractedClause(db.Model):
    __tablename__ = 'extracted_clauses'
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    clause_name = db.Column(db.String(255), nullable=False)
    clause_content = db.Column(db.Text, nullable=False)
    entities = db.Column(db.JSON, nullable=True)

class Comparison(db.Model):
    __tablename__ = 'comparisons'
    id = db.Column(db.Integer, primary_key=True)
    contract_document_name = db.Column(db.String(255), nullable=False)
    expected_terms_document_name = db.Column(db.String(255), nullable=False)
    date_of_comparison = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    result_path = db.Column(db.String(255), nullable=True)

class ComparisonResults(db.Model):
    __tablename__ = 'comparison_results'
    id = db.Column(db.Integer, primary_key=True)
    expected_document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    real_document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    clause_name = db.Column(db.String(255), nullable=False)
    expected_content = db.Column(db.Text, nullable=False)
    real_content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    remarks = db.Column(db.Text)

class DashboardStats(db.Model):
    __tablename__ = 'dashboard_stats'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    total_contracts = db.Column(db.Integer, default=0)
    conforming_contracts = db.Column(db.Integer, default=0)
    non_conforming_contracts = db.Column(db.Integer, default=0)

class AuditLogs(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class FeedbackReport(db.Model):
    __tablename__ = 'feedback_reports'
    id = db.Column(db.Integer, primary_key=True)
    contract_document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    expected_document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    comparison_table = db.Column(db.JSON, nullable=False)
    summary = db.Column(db.JSON, nullable=False)
    recommendations = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ComparisonHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    expected_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id'), nullable=False)
    comparison_results = db.Column(db.JSON)  # Store comparison results or a reference to it
    comparison_date = db.Column(db.DateTime, default=datetime.utcnow)

    contract = db.relationship('UploadedDocument', foreign_keys=[contract_id])
    expected = db.relationship('UploadedDocument', foreign_keys=[expected_id])
