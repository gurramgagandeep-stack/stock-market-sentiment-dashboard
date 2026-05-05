from sqlalchemy import Column, String, Float, DateTime, Integer, Boolean, Text, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class SentimentEvent(Base):
    __tablename__ = "sentiment_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, index=True)
    source = Column(String(20), nullable=False)  # twitter/reddit/news
    raw_text = Column(Text, nullable=False)
    sentiment_label = Column(String(10), nullable=False)  # positive/neutral/negative
    sentiment_score = Column(Float, nullable=False)
    model_used = Column(String(20), default="vader")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class PriceSnapshot(Base):
    __tablename__ = "price_snapshots"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float, nullable=False)
    volume = Column(Float)
    change_pct = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class SentimentAggregate(Base):
    __tablename__ = "sentiment_aggregates"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, index=True)
    window = Column(String(5), nullable=False)
    avg_score = Column(Float, nullable=False)
    positive_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    total_volume = Column(Integer, default=0)
    window_start = Column(DateTime(timezone=True), index=True)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, index=True)
    rule_type = Column(String(30), nullable=False)
    threshold_value = Column(Float, nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    score_at_trigger = Column(Float)
    message = Column(String(255))
    acknowledged = Column(Boolean, default=False)

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), nullable=False, unique=True)
    company_name = Column(String(100))
    alert_low = Column(Float, default=-0.5)
    alert_high = Column(Float, default=0.5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
