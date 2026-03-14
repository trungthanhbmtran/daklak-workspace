import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TranslationService } from './translations.service';
import { TranslationsController } from './translations.controller';
import { TranslationsWorker } from './translations.worker';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                    queue: 'translation_request',
                    queueOptions: {
                        durable: false,
                    },
                },
            },
        ]),
    ],
    controllers: [TranslationsController, TranslationsWorker],
    providers: [TranslationService],
    exports: [TranslationService],
})
export class TranslationsModule { }
