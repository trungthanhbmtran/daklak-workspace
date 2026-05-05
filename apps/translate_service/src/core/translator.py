import hashlib
import json
import re
from googletrans import Translator
from sqlalchemy.orm import Session
from database.models import TranslationDictionary, Glossary
from database.session import SessionLocal

class SmartTranslator:
    def __init__(self):
        # Tăng timeout lên 20 giây để xử lý các đoạn         self.ai = Translator(timeout=20.0)
        self.lang_mapping = {
            'en-us': 'en',
            'en-gb': 'en',
            'vi-vn': 'vi',
            'zh-cn': 'zh-cn',
            'zh-tw': 'zh-tw',
            'ede': 'en' # Fallback to English for AI if Ede is requested, but we will rely on Glossary
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

    def _translate_lexical_recursive(self, data, dest, db, is_unsupported=False):
        """Duyệt cây JSON của Lexical và chỉ dịch các node text"""
        if isinstance(data, dict):
            # Nếu là node văn bản của Lexical
            if data.get('type') == 'text' and 'text' in data:
                original_text = data['text']
                if original_text and original_text.strip():
                    try:
                        # 1. Áp dụng Glossary trước khi dịch (Cực kỳ quan trọng cho Ede)
                        processed_text = self._apply_glossary(original_text, dest, db)
                        
                        if is_unsupported:
                            # Nếu ngôn ngữ không hỗ trợ AI, chỉ dùng Glossary hoặc đánh dấu
                            if processed_text == original_text:
                                data['text'] = f"[Chưa có bản dịch Ê-đê] {original_text}"
                            else:
                                data['text'] = processed_text
                        else:
                            # 2. Gửi sang AI với cơ chế thử lại
                            translated = ""
                            for attempt in range(2):
                                try:
                                    translated = self.ai.translate(processed_text, dest=dest).text
                                    break
                                except Exception:
                                    if attempt == 1: 
                                        translated = f"[Lỗi dịch AI] {processed_text}"
                            data['text'] = translated
                    except Exception as e:
                        print(f"Error translating lexical text node: {e}")
            
            # Duyệt tiếp các thuộc tính khác (đặc biệt là 'children')
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    self._translate_lexical_recursive(value, dest, db, is_unsupported)
                    
        elif isinstance(data, list):
            for item in data:
                self._translate_lexical_recursive(item, dest, db, is_unsupported)
        
        return data

    def translate(self, text: str, target_lang: str):
        if not text: return ""
        if not target_lang: return text
        
        # 1. Giữ nguyên mã gốc để lưu DB
        original_lang = target_lang.strip().lower()
        
        # Kiểm tra xem ngôn ngữ có được AI hỗ trợ không
        unsupported_langs = ['ede']
        is_unsupported = original_lang in unsupported_langs
        
        # 2. Chỉ chuẩn hóa "nội bộ" để AI hiểu (không làm thay đổi dữ liệu gốc)
        ai_dest_lang = self.lang_mapping.get(original_lang, original_lang)
        
        db = SessionLocal()
        text_hash = self._get_hash(text, original_lang)

        try:
            # 1. Tra cứu từ điển (exact match) trước
            record = db.query(TranslationDictionary).filter_by(hash=text_hash).first()
            if record:
                # Nếu cache là bản dịch lỗi (vẫn còn tiếng Việt), thì xóa để dịch lại
                if record.translated_text == text and not is_unsupported:
                    db.delete(record)
                    db.commit()
                else:
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
                    if isinstance(json_data, dict) and 'root' in json_data:
                        is_lexical = True
                        translated_obj = self._translate_lexical_recursive(json_data, original_lang, db, is_unsupported)
                        translated_text = json.dumps(translated_obj, ensure_ascii=False)
            except Exception:
                is_lexical = False

            if not is_lexical:
                # 1. Áp dụng Glossary trước
                processed_text = self._apply_glossary(text, original_lang, db)
                
                if is_unsupported:
                    if processed_text == text:
                        translated_text = f"[Dịch {original_lang}] {text}"
                    else:
                        translated_text = processed_text
                else:
                    # 2. Gửi sang AI
                    try:
                        result = self.ai.translate(processed_text, dest=ai_dest_lang)
                        translated_text = result.text
                        if translated_text == text:
                             translated_text = f"[AI chưa dịch] {text}"
                    except Exception as e:
                        print(f"Lỗi AI: {e}")
                        translated_text = f"[Lỗi kết nối AI] {text}"

            # 3. Tự học: Lưu vào database
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
            print(f"Lỗi Translator: {e}")
            return f"[Lỗi hệ thống] {text}"
        finally:
            db.close()