import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient;

  onModuleInit() {
    const url = process.env.QDRANT_URL || 'http://localhost:6333';
    this.client = new QdrantClient({ url });
    this.logger.log(`QdrantClient initialized with url: ${url}`);
  }

  async createCollectionIfNotExists(
    collectionName: string,
    vectorSize: number = 1536,
  ) {
    try {
      const exists = await this.client.collectionExists(collectionName);
      if (!exists.exists) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize, // e.g. 1536 for OpenAI ada-002, 768 for Gemini
            distance: 'Cosine',
          },
        });
        this.logger.log(`Created collection: ${collectionName}`);
      }
    } catch (e: any) {
      this.logger.error(`Failed to create collection: ${e.message}`, e.stack);
      throw e;
    }
  }

  async upsertPoints(collectionName: string, points: any[]) {
    try {
      await this.client.upsert(collectionName, {
        wait: true,
        points: points,
      });
    } catch (e: any) {
      this.logger.error(`Failed to upsert points: ${e.message}`, e.stack);
      throw e;
    }
  }

  async search(collectionName: string, vector: number[], limit: number = 5) {
    try {
      return await (this.client as any).search(collectionName, {
        vector: vector,
        limit: limit,
        with_payload: true,
      });
    } catch (e: any) {
      this.logger.error(`Failed to search points: ${e.message}`, e.stack);
      throw e;
    }
  }
}
