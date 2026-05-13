import hashlib
import json
import re
import concurrent.futures
from googletrans import Translator
from sqlalchemy.orm import Session
from database.models import TranslationDictionary, Glossary
from database.session import SessionLocal

class SmartTranslator:
    def __init__(self):
        # Tăng timeout lên 20 giây để xử lý các đoạn
        self.ai = Translator()
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
            
        # Lấy danh sách từ điển cho ngôn ngữ đích từ DB
        if not db:
            return text
            
        try:
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
        except Exception as e:
            print(f"Lỗi khi áp dụng Glossary: {e}")
            return text

    def _translate_batch(self, texts: list, target_lang: str, db, is_unsupported: bool) -> dict:
        if not texts:
            return {}
            
        # Loại bỏ trùng lặp và khoảng trắng thừa
        unique_texts = list(set(t for t in texts if t and t.strip()))
        if not unique_texts:
            return {}
            
        result_map = {}
        
        # Tạo danh sách hash để tra cứu một lần duy nhất từ DB
        hashes = []
        hash_to_text = {}
        for t in unique_texts:
            h = self._get_hash(t, target_lang)
            hashes.append(h)
            hash_to_text[h] = t
            
        cached_map = {}
        uncached_texts = []
        
        if db:
            try:
                # Tra cứu tất cả hash cùng lúc (Cực kỳ nhanh, giảm từ N câu xuống 1 câu query)
                records = db.query(TranslationDictionary).filter(TranslationDictionary.hash.in_(hashes)).all()
                for record in records:
                    original_text = hash_to_text.get(record.hash)
                    if original_text:
                        if record.translated_text == original_text and not is_unsupported:
                            # Nếu cache lưu lỗi giống văn bản gốc, bỏ qua để dịch lại
                            continue
                        cached_map[original_text] = record.translated_text
                        record.usage_count += 1
                if cached_map:
                    db.commit()
            except Exception as db_err:
                print(f"Error querying DB cache in batch: {db_err}")
                
        # Phân loại văn bản nào đã có cache, văn bản nào cần dịch mới
        for t in unique_texts:
            if t in cached_map:
                result_map[t] = cached_map[t]
            else:
                uncached_texts.append(t)
                
        if not uncached_texts:
            return result_map
            
        # Bắt đầu dịch các văn bản chưa có cache
        translations_to_save = []
        
        # Áp dụng Glossary trước khi dịch
        processed_texts = []
        for t in uncached_texts:
            processed_texts.append(self._apply_glossary(t, target_lang, db))
            
        if is_unsupported:
            # Ngôn ngữ không hỗ trợ AI (ví dụ: ede)
            for idx, orig_text in enumerate(uncached_texts):
                processed = processed_texts[idx]
                if processed == orig_text:
                    translated = f"[Chưa có bản dịch Ê-đê] {orig_text}"
                else:
                    translated = processed
                result_map[orig_text] = translated
                translations_to_save.append((orig_text, translated))
        else:
            # Dịch bằng Google Translate hỗ trợ danh sách (Bulk Translation)
            ai_dest_lang = self.lang_mapping.get(target_lang, target_lang)
            
            # Chia nhỏ lô thành 25 cụm từ để tránh quá tải payload API
            batch_size = 25
            batches = []
            for i in range(0, len(uncached_texts), batch_size):
                batches.append((
                    uncached_texts[i:i+batch_size],
                    processed_texts[i:i+batch_size]
                ))
                
            def process_batch(sub_orig, sub_processed):
                translated_results = []
                try:
                    # Gửi danh sách 25 từ trong duy nhất 1 yêu cầu mạng (Giảm 25 lần kết nối mạng)
                    results = self.ai.translate(sub_processed, dest=ai_dest_lang)
                    if isinstance(results, list):
                        translated_results = [r.text for r in results]
                    else:
                        translated_results = [results.text]
                except Exception as e:
                    print(f"Error in batch translation call: {e}")
                    # Nếu lỗi luồng batch, thử lại từng từ nhỏ lẻ
                    for p in sub_processed:
                        try:
                            translated_results.append(self.ai.translate(p, dest=ai_dest_lang).text)
                        except Exception:
                            translated_results.append(f"[Lỗi dịch AI] {p}")
                return sub_orig, translated_results

            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(process_batch, b[0], b[1]) for b in batches]
                
                for future in concurrent.futures.as_completed(futures):
                    try:
                        sub_orig, translated_results = future.result()
                        # Áp kết quả dịch vào bản đồ trả về
                        for idx, orig_text in enumerate(sub_orig):
                            translated = translated_results[idx] if idx < len(translated_results) else f"[AI chưa dịch] {orig_text}"
                            result_map[orig_text] = translated
                            translations_to_save.append((orig_text, translated))
                    except Exception as e:
                        print(f"Error processing a translation batch: {e}")
                    
                    
        # Lưu đống bản dịch mới vào DB một lần để học máy tự động
        if db and translations_to_save:
            try:
                for orig, trans in translations_to_save:
                    h = self._get_hash(orig, target_lang)
                    existing = db.query(TranslationDictionary).filter_by(hash=h).first()
                    if not existing:
                        new_entry = TranslationDictionary(
                            source_text=orig,
                            translated_text=trans,
                            target_lang=target_lang,
                            hash=h
                        )
                        db.add(new_entry)
                db.commit()
            except Exception as db_save_err:
                print(f"Error saving batch translations to DB: {db_save_err}")
                
        return result_map

    def translate_only_text_tags(self, text: str, target_lang: str, db, is_unsupported: bool) -> str:
        if not text:
            return text
            
        pattern = re.compile(r'(<text\b[^>]*>)(.*?)(</text>)', re.DOTALL)
        matches = pattern.findall(text)
        
        if not matches:
            # Fallback dịch toàn bộ văn bản nếu không tìm thấy thẻ <text>
            res_map = self._translate_batch([text], target_lang, db, is_unsupported)
            return res_map.get(text, text)

        # Thu thập các văn bản độc nhất trong các thẻ <text>
        unique_contents = list(set(match[1] for match in matches if match[1].strip()))
        
        # Dịch hàng loạt các thẻ văn bản trong duy nhất 1 lần truy vấn
        translation_map = self._translate_batch(unique_contents, target_lang, db, is_unsupported)
        
        def replace_match(match):
            open_tag = match.group(1)
            content = match.group(2)
            close_tag = match.group(3)
            
            if content.strip():
                translated_content = translation_map.get(content, content)
                return f"{open_tag}{translated_content}{close_tag}"
            return match.group(0)
            
        return pattern.sub(replace_match, text)

    def _collect_lexical_texts(self, data, texts_set):
        """Thu thập đệ quy tất cả các chuỗi văn bản cần dịch từ cây JSON Lexical"""
        if isinstance(data, dict):
            if data.get('type') == 'text' and 'text' in data:
                original_text = data['text']
                if original_text and original_text.strip():
                    texts_set.add(original_text)
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    self._collect_lexical_texts(value, texts_set)
        elif isinstance(data, list):
            for item in data:
                self._collect_lexical_texts(item, texts_set)

    def _replace_lexical_texts(self, data, translation_map):
        """Thay thế đệ quy các chuỗi văn bản dịch vào cây JSON Lexical"""
        if isinstance(data, dict):
            if data.get('type') == 'text' and 'text' in data:
                original_text = data['text']
                if original_text and original_text.strip():
                    data['text'] = translation_map.get(original_text, original_text)
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    self._replace_lexical_texts(value, translation_map)
        elif isinstance(data, list):
            for item in data:
                self._replace_lexical_texts(item, translation_map)

    def translate(self, text: str, target_lang: str):
        if not text: return ""
        if not target_lang: return text
        
        # Giữ nguyên mã gốc để lưu DB
        original_lang = target_lang.strip().lower()
        
        # Kiểm tra xem ngôn ngữ có được AI hỗ trợ không
        unsupported_langs = ['ede']
        is_unsupported = original_lang in unsupported_langs
        
        db = None
        text_hash = self._get_hash(text, original_lang)
        
        # 1. Tra cứu từ điển toàn bộ đoạn trước (Exact Match)
        try:
            db = SessionLocal()
            record = db.query(TranslationDictionary).filter_by(hash=text_hash).first()
            if record:
                if record.translated_text == text and not is_unsupported:
                    db.delete(record)
                    db.commit()
                else:
                    record.usage_count += 1
                    db.commit()
                    return record.translated_text
        except Exception as db_err:
            print(f"Lỗi kết nối/truy vấn DB khi tra từ điển: {db_err}")

        try:
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
                        
                        # Tối ưu hóa cực đại:
                        # Bước 1: Thu thập tất cả các text node cần dịch
                        texts_set = set()
                        self._collect_lexical_texts(json_data, texts_set)
                        
                        # Bước 2: Dịch hàng loạt toàn bộ danh sách text node chỉ bằng 1 hoặc vài lô gộp
                        translation_map = self._translate_batch(list(texts_set), original_lang, db, is_unsupported)
                        
                        # Bước 3: Áp lại các bản dịch vào cây JSON
                        self._replace_lexical_texts(json_data, translation_map)
                        
                        translated_text = json.dumps(json_data, ensure_ascii=False)
            except Exception as le_err:
                print(f"Error parsing/translating lexical: {le_err}")
                is_lexical = False

            if not is_lexical:
                translated_text = self.translate_only_text_tags(text, original_lang, db, is_unsupported)

            # 3. Lưu vào database làm bộ nhớ đệm cho toàn bộ block
            if db:
                try:
                    # Để phòng tránh lỗi trùng khóa do tác vụ song song
                    existing = db.query(TranslationDictionary).filter_by(hash=text_hash).first()
                    if not existing:
                        new_entry = TranslationDictionary(
                            source_text=text,
                            translated_text=translated_text,
                            target_lang=original_lang,
                            hash=text_hash
                        )
                        db.add(new_entry)
                        db.commit()
                except Exception as db_save_err:
                    print(f"Lỗi lưu bản dịch vào DB: {db_save_err}")
            
            return translated_text

        except Exception as e:
            print(f"Lỗi Translator: {e}")
            return f"[Lỗi hệ thống] {text}"
        finally:
            if db:
                try:
                    db.close()
                except Exception:
                    pass