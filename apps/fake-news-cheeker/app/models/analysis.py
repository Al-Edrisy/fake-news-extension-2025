from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from ..database import Base
from typing import List, Dict

class Analysis(Base):
    __tablename__ = 'analyses'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    claim_id = Column(UUID(as_uuid=True), ForeignKey('claims.id'), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey('sources.id'), nullable=False)
    support = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    analysis_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    claim = relationship("Claim", backref="analyses")
    source = relationship("Source", backref="analyses")

    def to_dict(self):
        return {
            "id": str(self.id),
            "claim_id": str(self.claim_id),
            "source_id": str(self.source_id),
            "support": self.support,
            "confidence": self.confidence,
            "reason": self.reason,
            "analysis_text": self.analysis_text,
            "created_at": self.created_at.isoformat()
        }

    def _classify_category(self, claim: str, articles: List[Dict] = []) -> str:
        if articles is None:
            articles = []
        categories = {
    "health": ["covid", "vaccine", "health", "disease", "medical", "hospital", "doctor", "virus", "pandemic"],
    "politics": ["election", "government", "president", "senate", "law", "minister", "parliament", "vote", "policy"],
    "technology": ["ai", "robot", "tech", "innovation", "computer", "software", "hardware", "internet", "app"],
    "science": ["mars", "space", "nasa", "discovery", "research", "astronomy", "physics", "biology", "chemistry"],
    "finance": ["stock", "market", "economy", "dollar", "bank", "crypto", "bitcoin", "investment", "inflation"],
    "sports": ["football", "soccer", "basketball", "olympics", "athlete", "tournament", "match", "goal", "score"],
    "entertainment": ["movie", "music", "celebrity", "tv", "film", "actor", "singer", "show", "award"],
    "environment": ["climate", "environment", "pollution", "global warming", "recycle", "carbon", "emission", "wildlife"]
}

        text = claim.lower()
        if articles:
            for article in articles:
                text += " " + article.get("title", "").lower()
                text += " " + article.get("content", "").lower()

        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
        return "general"
