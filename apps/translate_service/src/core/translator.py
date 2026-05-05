import hashlib
import json
import re
from googletrans import Translator
from sqlalchemy.orm import Session
from database.models import TranslationDictionary, Glossary
from database.session import SessionLocal

class SmartTranslator:
    def __init__(self):
        self.ai = Translator()
        self.lang_mapping = {
            'en-us': 'en',
            'en-gb': 'en',
            'vi-vn': 'vi',
            'zh-cn': 'zh-cn',
            'zh-tw': 'zh-tw'
        }

    def _get_hash(self, text: str, lang: str):
        # Chuẩn hóa văn bản trước khi băm
        normalized = text.strip().lower()
        return hashlib.md5(f"{normalized}_{lang}".encode()).hexdigest()

    def _apply_glossary(self, text: str, lang: str, db):
        """Tìm và thay thế các thuật ngữ ưu tiên từ từ điển (Glossary)"""
        if not text or not isinstance(text, str):
            return text
            
        # Lấy danh sách từ điển cho ngôn ngữ đích
        glossaries = db.query(Glossary).filter_by(lang_code=lang, is_active=True).all()
        if not glossaries:
            return text
            
        # Sắp xếp theo độ dài cụm từ giảm dần để tránh thay thế sai các cụm từ con
        glossaries.sort(key=lambda x: len(x.term), reverse=True)
        
        result_text = text
        for item in glossaries:
            # Thay thế không phân biệt hoa thường
            pattern = re.compile(re.escape(item.term), re.IGNORECASE)
            result_text = pattern.sub(item.translation, result_text)
            
        return result_text

    def _translate_lexical_recursive(self, data, dest, db):
        """Duyệt cây JSON của Lexical và chỉ dịch các node text"""
        if isinstance(data, dict):
            # Nếu là node văn bản của Lexical
            if data.get('type') == 'text' and 'text' in data:
                original_text = data['text']
                if original_text and original_text.strip():
                    try:
                        # 1. Áp dụng Glossary trước khi dịch
                        processed_text = self._apply_glossary(original_text, dest, db)
                        
                        # 2. Nếu sau khi áp dụng glossary mà text vẫn chứa ký tự cần dịch (hoặc nếu muốn AI xử lý tiếp)
                        # Ở đây chúng ta gửi đoạn đã xử lý sang AI
                        translated = self.ai.translate(processed_text, dest=dest).text
                        data['text'] = translated
                    except Exception as e:
                        print(f"Error translating lexical text node: {e}")
            
            # Duyệt tiếp các thuộc tính khác (đặc biệt là 'children')
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    self._translate_lexical_recursive(value, dest, db)
                    
        elif isinstance(data, list):
            for item in data:
                self._translate_lexical_recursive(item, dest, db)
        
        return data

    def translate(self, text: str, target_lang: str):
        if not text: return ""
        if not target_lang: return text
        
        # 1. Giữ nguyên mã gốc để lưu DB và băm Hash nhằm đảm bảo tính toàn vẹn
        original_lang = target_lang
        
        # 2. Chỉ chuẩn hóa "nội bộ" để AI hiểu (không làm thay đổi dữ liệu gốc)
        ai_dest_lang = original_lang.strip().lower()
        ai_dest_lang = self.lang_mapping.get(ai_dest_lang, ai_dest_lang)
        
        db = SessionLocal()
        text_hash = self._get_hash(text, original_lang)

        try:
            # 1. Tra cứu từ điển (exact match) trước
            record = db.query(TranslationDictionary).filter_by(hash=text_hash).first()
            if record:
                record.usage_count += 1
                db.commit()
                return record.translated_text

            # 2. Xử lý dịch thuật
            translated_text = ""
            
            # Kiểm tra xem có phải cấu trúc JSON của Lexical Editor không
            is_lexical = False
            try:
                stripped_text = text.strip()
                if (stripped_text.startswith('{') and stripped_text.endswith('}')) or \
                   (stripped_text.startswith('[') and stripped_text.endswith(']')):
                    json_data = json.loads(stripped_text)
                    # Đặc trưng của Lexical là có thuộc tính 'root'
                    if isinstance(json_data, dict) and 'root' in json_data:
                        is_lexical = True
                        print(f"[SmartTranslator] Detecting Lexical JSON with Glossary support. Translating nodes...")
                        translated_obj = self._translate_lexical_recursive(json_data, ai_dest_lang, db)
                        translated_text = json.dumps(translated_obj, ensure_ascii=False)
            except Exception as e:
                is_lexical = False

            if not is_lexical:
                # 1. Áp dụng Glossary trước (ví dụ: thay thế UBND -> People's Committee)
                processed_text = self._apply_glossary(text, ai_dest_lang, db)
                
                # 2. Gửi sang AI dịch phần còn lại
                result = self.ai.translate(processed_text, dest=ai_dest_lang)
                translated_text = result.text

            # 3. Tự học: Lưu vào database với mã ngôn ngữ GỐC
            new_entry = TranslationDictionary(
                source_text=text,
                translated_text=translated_text,
                target_lang=original_lang,
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