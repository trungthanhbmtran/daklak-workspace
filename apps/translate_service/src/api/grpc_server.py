import grpc
from concurrent import futures
import translation_pb2
import translation_pb2_grpc
from core.translator import SmartTranslator

class TranslationServicer(translation_pb2_grpc.TranslationServiceServicer):
    def __init__(self):
        self.translator = SmartTranslator()

    def TranslateSync(self, request, context):
        res = self.translator.translate(request.text, request.target_lang)
        return translation_pb2.TranslateResponse(translated_text=res)

    def HealthCheck(self, request, context):
        return translation_pb2.HealthResponse(status=True)

def run_grpc_server():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    translation_pb2_grpc.add_TranslationServiceServicer_to_server(TranslationServicer(), server)
    server.add_insecure_port('[::]:50051')
    print("🚀 gRPC Server đang chạy tại port 50051...")
    server.start()
    server.wait_for_termination()