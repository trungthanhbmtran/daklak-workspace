export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  type?: string | null;
  content?: string | null;
  createdAt: string;

  constructor(partial: Partial<MessageResponseDto>) {
    Object.assign(this, partial);
  }
}
