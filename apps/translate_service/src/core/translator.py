import hashlib
from googletrans import Translator
from sqlalchemy.orm import Session
from database.models import TranslationDictionary
from database.session import SessionLocal

class SmartTranslator:
    def __init__(self):
        self.ai = Translator()

    def _get_hash(self, text: str, lang: str):
        # Chuẩn hóa văn bản trước khi băm
        normalized = text.strip().lower()
        return hashlib.md5(f"{normalized}_{lang}".encode()).hexdigest()

    def translate(self, text: str, target_lang: str):
        if not text: return ""
        
        db = SessionLocal()
        text_hash = self._get_hash(text, target_lang)

        try:
            # 1. Tra cứu từ điển trước
            record = db.query(TranslationDictionary).filter_by(hash=text_hash).first()
            if record:
                record.usage_count += 1
                db.commit()
                return record.translated_text

            # 2. Nếu không có, gọi AI (Google/LLM)
            result = self.ai.translate(text, dest=target_lang)
            translated_text = result.text

            # 3. Tự học: Lưu vào database cho lần sau
            new_entry = TranslationDictionary(
                source_text=text,
                translated_text=translated_text,
                target_lang=target_lang,
                hash=text_hash
            )
            db.add(new_entry)
            db.commit()
            return translated_text

        except Exception as e:
            print(f"Lỗi AI: {e}")
            return text # Trả về text gốc nếu lỗi
        finally:
            db.close()