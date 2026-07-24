export class ConversationResponseDto {
  id: string;
  type: string;
  title?: string | null;
  createdAt: string;

  // Tùy theo yêu cầu có thể thêm participantIds, v.v.
  constructor(partial: Partial<ConversationResponseDto>) {
    Object.assign(this, partial);
  }
}
