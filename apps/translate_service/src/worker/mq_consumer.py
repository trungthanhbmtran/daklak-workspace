import pika
import json
from core.translator import SmartTranslator

translator = SmartTranslator()

def start_mq_worker():
    # Kết nối RabbitMQ của Sở
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='translation_tasks', durable=True)

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

    channel.basic_consume(queue='translation_tasks', on_message_callback=callback)
    print(" [*] Worker đang đợi tin nhắn từ RabbitMQ...")
    channel.start_consuming()