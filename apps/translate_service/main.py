import threading
from api.grpc_server import run_grpc_server
from worker.mq_consumer import start_mq_worker
from database.session import engine, Base

def main():
    # 1. Tạo bảng MySQL nếu chưa có
    print("--- Khởi tạo Database ---")
    Base.metadata.create_all(bind=engine)

    # 2. Chạy RabbitMQ Worker ở thread riêng
    mq_thread = threading.Thread(target=start_mq_worker, daemon=True)
    mq_thread.start()

    # 3. Chạy gRPC Server ở thread chính
    run_grpc_server()

if __name__ == "__main__":
    main()