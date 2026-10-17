import pika
import json
import os
import concurrent.futures
import logging

from core.translator import SmartTranslator

logger = logging.getLogger(__name__)

translator = SmartTranslator()


def start_mq_worker():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [mq_consumer] %(message)s",
    )
    # Fail-fast: thiếu RABBITMQ_URL → dừng worker ngay, không fallback về credential hardcode.
    # Worker chạy trong daemon thread nên SystemExit chỉ kết thúc thread này;
    # log rõ nguyên nhân để khi kiểm tra process vẫn nhận ra worker MQ đã tắt.
    amqp_url = os.getenv("RABBITMQ_URL")
    if not amqp_url:
        logger.error(
            "Thiếu biến môi trường RABBITMQ_URL (vd: amqp://user:pass@host:5672) — "
            "dừng worker MQ. Không dùng giá trị mặc định."
        )
        raise SystemExit(1)

    # Kết nối RabbitMQ
    params = pika.URLParameters(amqp_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # Sử dụng 'translation_request' để khớp với posts_service
    queue_name = 'translation_request'
    channel.queue_declare(queue=queue_name, durable=False)

    def callback(ch, method, properties, body):
        try:
            payload = json.loads(body)
        except (json.JSONDecodeError, UnicodeDecodeError, TypeError) as exc:
            # Ledger #26: payload không phải JSON hợp lệ → reject (không requeue)
            # để tránh poison-message loop, log rõ và KHÔNG crash worker.
            logger.error("Payload không phải JSON hợp lệ, reject message: %s (raw=%r)", exc, body[:200])
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        # NestJS gửi dữ liệu bọc trong 'data' nếu dùng ClientProxy
        data = payload.get("data") if isinstance(payload, dict) and "data" in payload else payload

        if not isinstance(data, dict):
            logger.error("Payload dịch không đúng cấu trúc dữ liệu mong đợi, reject message: %r", payload)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        try:
            post_id = data.get("postId")
            target_lang = data.get("targetLang", "en")

            # Các trường cần dịch
            fields_to_translate = ["title", "description", "content"]

            logger.info("Đang dịch bài viết %s sang %s", post_id, target_lang)

            def translate_field(field):
                text_to_translate = data.get(field)
                if not text_to_translate or not str(text_to_translate).strip():
                    return None

                logger.info("  - Đang dịch trường '%s'...", field)

                # Dịch nội dung
                translated = translator.translate(str(text_to_translate), target_lang)
                return field, translated

            # Sử dụng ThreadPoolExecutor để dịch song song các trường
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                future_to_field = {
                    executor.submit(translate_field, field): field
                    for field in fields_to_translate
                }

                for future in concurrent.futures.as_completed(future_to_field):
                    field = future_to_field[future]
                    try:
                        result = future.result()
                        if result is None:
                            continue

                        _, translated = result

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
                        logger.info("  [v] Đã dịch xong trường '%s'", field)
                    except Exception as exc:
                        logger.error("  [x] Lỗi khi dịch trường '%s': %s", field, exc)

            logger.info("[v] Hoàn thành dịch toàn bộ bài viết %s", post_id)

            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as exc:
            # Ledger #26: mọi lỗi xử lý khác → reject rõ ràng, không để exception
            # văng lên BlockingConnection làm chết worker.
            logger.error("Lỗi xử lý message queue (reject): %s", exc)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    logger.info("[*] Worker đang đợi tin nhắn từ RabbitMQ...")
    channel.start_consuming()
