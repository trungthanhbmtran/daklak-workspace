import pika
import json
import os
from core.translator import SmartTranslator

translator = SmartTranslator()

def start_mq_worker():
    # Lấy RabbitMQ URL từ env, fallback localhost nếu thiếu
    amqp_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
    
    # Kết nối RabbitMQ
    params = pika.URLParameters(amqp_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    
    # Sử dụng 'translation_request' để khớp với posts_service
    queue_name = 'translation_request'
    channel.queue_declare(queue=queue_name, durable=False)

    def callback(ch, method, properties, body):
        payload = json.loads(body)
        # NestJS gửi dữ liệu bọc trong 'data' nếu dùng ClientProxy
        data = payload.get("data") if isinstance(payload, dict) and "data" in payload else payload
        
        post_id = data.get("postId")
        target_lang = data.get("targetLang", "en")
        
        # Các trường cần dịch
        fields_to_translate = ["title", "description", "content"]
        
        print(f"[*] Đang dịch bài viết: {post_id} sang {target_lang}")
        
        for field in fields_to_translate:
            text_to_translate = data.get(field)
            if not text_to_translate or not str(text_to_translate).strip():
                continue
                
            print(f"  - Đang dịch trường '{field}'...")
            
            # Dịch nội dung
            translated = translator.translate(str(text_to_translate), target_lang)
            
            # Gửi kết quả ngược lại cho posts_service qua queue 'translation_response'
            response_data = {
                "postId": post_id,
                "targetLang": target_lang,
                "translatedText": translated,
                "field": field
            }
            
            # Publish tới queue phản hồi
            channel.queue_declare(queue='translation_response', durable=False)
            channel.basic_publish(
                exchange='',
                routing_key='translation_response',
                body=json.dumps({
                    "pattern": "translation_response",
                    "data": response_data
                })
            )
            print(f"  [v] Đã dịch xong trường '{field}'")

        print(f"[v] Hoàn thành dịch toàn bộ bài viết: {post_id}")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    print(" [*] Worker đang đợi tin nhắn từ RabbitMQ...")
    channel.start_consuming()