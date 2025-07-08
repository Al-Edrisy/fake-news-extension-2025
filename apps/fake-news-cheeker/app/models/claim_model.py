from ..database import Base
from sqlalchemy import Column, String, Float, Text, DateTime
from sqlalchemy.sql import func
import uuid

class Claim(Base):
    __tablename__ = 'claims'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = Column(Text, nullable=False)
    verdict = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    conclusion = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Claim {self.id}: {self.text[:50]}...>"