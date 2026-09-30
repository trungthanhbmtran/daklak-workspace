import { Module, Global } from '@nestjs/common';
import { TransactionalOutboxService } from './services/transactional-outbox.service';
import { InboxIdempotencyService } from './services/inbox-idempotency.service';

@Global()
@Module({
  providers: [TransactionalOutboxService, InboxIdempotencyService],
  exports: [TransactionalOutboxService, InboxIdempotencyService],
})
export class WorkflowClientModule {}
