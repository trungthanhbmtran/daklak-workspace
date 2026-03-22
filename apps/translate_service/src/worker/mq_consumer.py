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
        data = json.loads(body)
        post_id = data.get("postId")
        content = data.get("content")
        target_lang = data.get("targetLang", "en")

        print(f"[*] Đang dịch bài viết dài: {post_id}")
        
        # Dịch nội dung (tự động lưu vào MySQL dictionary)
        translated = translator.translate(content, target_lang)
        
        # Ghi chú: Ở đây Mạnh nên gọi ngược lại API của NestJS để update bản dịch vào PostTranslation table
        print(f"[v] Đã dịch xong bài viết: {post_id}")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    print(" [*] Worker đang đợi tin nhắn từ RabbitMQ...")
    channel.start_consuming()