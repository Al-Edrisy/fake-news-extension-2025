from sqlalchemy import Column, String, Text, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class Source(Base):
    __tablename__ = 'sources'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(Text, nullable=False, unique=True)
    domain = Column(String(255), nullable=False)
    title = Column(Text)
    snippet = Column(Text)
    content = Column(Text)
    published_date = Column(DateTime(timezone=True))
    source_name = Column(String(100), nullable=False)
    credibility_score = Column(Float, default=1.0)
    last_scraped_at = Column(DateTime(timezone=True))

    def to_dict(self):
        return {
            "id": str(self.id),
            "url": self.url,
            "domain": self.domain,
            "title": self.title,
            "snippet": self.snippet,
            "content": self.content,
            "published_date": self.published_date.isoformat() if self.published_date else None,
            "source_name": self.source_name,
            "credibility_score": self.credibility_score,
            "last_scraped_at": self.last_scraped_at.isoformat() if self.last_scraped_at else None
        }
