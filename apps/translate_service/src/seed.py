import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Glossary, Base
from database.session import SQLALCHEMY_DATABASE_URL

# Khởi tạo kết nối
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_glossary():
    db = SessionLocal()
    try:
        # Danh sách thuật ngữ chuẩn Chính phủ Việt Nam (VI -> EN)
        glossary_items = [
            # 1. Cơ quan Nhà nước (State Agencies)
            {"term": "Ủy ban nhân dân", "translation": "People's Committee", "lang_code": "en", "description": "Chuẩn hành chính"},
            {"term": "UBND", "translation": "People's Committee", "lang_code": "en", "description": "Viết tắt chuẩn"},
            {"term": "Hội đồng nhân dân", "translation": "People's Council", "lang_code": "en"},
            {"term": "HĐND", "translation": "People's Council", "lang_code": "en"},
            {"term": "Sở Kế hoạch và Đầu tư", "translation": "Department of Planning and Investment", "lang_code": "en"},
            {"term": "Sở Công Thương", "translation": "Department of Industry and Trade", "lang_code": "en"},
            {"term": "Sở Tài chính", "translation": "Department of Finance", "lang_code": "en"},
            {"term": "Sở Nội vụ", "translation": "Department of Home Affairs", "lang_code": "en"},
            {"term": "Sở Thông tin và Truyền thông", "translation": "Department of Information and Communications", "lang_code": "en"},
            {"term": "Sở Khoa học và Công nghệ", "translation": "Department of Science and Technology", "lang_code": "en"},
            {"term": "Sở Tư pháp", "translation": "Department of Justice", "lang_code": "en"},
            {"term": "Sở Tài nguyên và Môi trường", "translation": "Department of Natural Resources and Environment", "lang_code": "en"},
            
            # 2. Loại văn bản (Document Types)
            {"term": "Nghị định", "translation": "Decree", "lang_code": "en"},
            {"term": "Thông tư", "translation": "Circular", "lang_code": "en"},
            {"term": "Quyết định", "translation": "Decision", "lang_code": "en"},
            {"term": "Công văn", "translation": "Official Dispatch", "lang_code": "en"},
            {"term": "Nghị quyết", "translation": "Resolution", "lang_code": "en"},
            {"term": "Chỉ thị", "translation": "Directive", "lang_code": "en"},
            {"term": "Luật", "translation": "Law", "lang_code": "en"},
            {"term": "Hiến pháp", "translation": "Constitution", "lang_code": "en"},
            
            # 3. Chức danh (Titles)
            {"term": "Chủ tịch", "translation": "Chairperson", "lang_code": "en"},
            {"term": "Phó Chủ tịch", "translation": "Vice Chairperson", "lang_code": "en"},
            {"term": "Giám đốc", "translation": "Director", "lang_code": "en"},
            {"term": "Phó Giám đốc", "translation": "Deputy Director", "lang_code": "en"},
            {"term": "Thủ tướng Chính phủ", "translation": "Prime Minister", "lang_code": "en"},
            
            # 4. Thuật ngữ chung (General Terms)
            {"term": "Cổng thông tin điện tử", "translation": "E-Portal", "lang_code": "en"},
            {"term": "Chuyển đổi số", "translation": "Digital Transformation", "lang_code": "en"},
            {"term": "Cải cách hành chính", "translation": "Administrative Reform", "lang_code": "en"},
            {"term": "Dịch vụ công trực tuyến", "translation": "Online Public Services", "lang_code": "en"},
            {"term": "Một cửa liên thông", "translation": "One-stop-shop mechanism", "lang_code": "en"},
            {"term": "Kinh tế - Xã hội", "translation": "Socio-Economic", "lang_code": "en"},
            {"term": "Khoa học công nghệ và Đổi mới sáng tạo", "translation": "Science, Technology and Innovation", "lang_code": "en"},
            
            # 5. Tiếng Ê-đê (Ede/Rade)
            {"term": "Ủy ban nhân dân", "translation": "Ủy ban nhân dân [EDE]", "lang_code": "ede"},
            {"term": "UBND", "translation": "UBND [EDE]", "lang_code": "ede"},
            {"term": "Hội đồng nhân dân", "translation": "Hội đồng nhân dân [EDE]", "lang_code": "ede"},
            {"term": "Quyết định", "translation": "Quyết định [EDE]", "lang_code": "ede"},
            {"term": "Thông báo", "translation": "Thông báo [EDE]", "lang_code": "ede"},
            {"term": "Cổng thông tin điện tử", "translation": "Cổng thông tin điện tử [EDE]", "lang_code": "ede"},
        ]

        print(f"Bắt đầu nạp {len(glossary_items)} thuật ngữ chuẩn...")
        
        count = 0
        for item in glossary_items:
            # Kiểm tra xem đã tồn tại chưa để tránh trùng lặp
            exists = db.query(Glossary).filter_by(term=item["term"], lang_code=item["lang_code"]).first()
            if not exists:
                new_glossary = Glossary(
                    id=str(uuid.uuid4()),
                    term=item["term"],
                    translation=item["translation"],
                    lang_code=item["lang_code"],
                    description=item.get("description", "Dữ liệu Seed chuẩn")
                )
                db.add(new_glossary)
                count += 1
        
        db.commit()
        print(f"Thành công! Đã thêm mới {count} thuật ngữ vào từ điển.")
        
    except Exception as e:
        print(f"Lỗi khi seed dữ liệu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Đảm bảo các bảng đã được tạo
    Base.metadata.create_all(bind=engine)
    seed_glossary()
