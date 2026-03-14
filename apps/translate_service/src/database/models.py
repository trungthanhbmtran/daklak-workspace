import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, func
from .session import Base

class TranslationDictionary(Base):
    __tablename__ = "translation_dictionary"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    source_lang = Column(String(10), default="vi")
    target_lang = Column(String(10), nullable=False)
    # Lưu MD5 Hash để tra cứu cực nhanh
    hash = Column(String(32), unique=True, index=True, nullable=False)
    usage_count = Column(Integer, default=1)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())