import { status } from "@grpc/grpc-js";
import { RpcException } from "@nestjs/microservices";
import { MessageService } from "./message.service";

describe("MessageService participant access", () => {
  const messageRepository = {
    create: jest.fn(),
    findByConversationId: jest.fn(),
    findConversationIdById: jest.fn(),
  };
  const rabbitmqService = { publishEvent: jest.fn() };
  const participantService = { isParticipant: jest.fn() };
  let service: MessageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MessageService(
      messageRepository as any,
      rabbitmqService as any,
      participantService as any,
    );
  });

  async function expectNoParticipantError(action: Promise<unknown>) {
    let caught: unknown;

    try {
      await action;
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(RpcException);
    expect((caught as RpcException).getError()).toEqual({
      code: status.NOT_FOUND,
      message: "Bạn không có quyền tham gia đoạn chat này.",
    });
  }

  it("returns the permission message when a non-participant reads messages", async () => {
    participantService.isParticipant.mockResolvedValue(false);

    await expectNoParticipantError(
      service.getMessages("conversation-1", 20, 0, { employeeCode: "E001" }),
    );
    expect(messageRepository.findByConversationId).not.toHaveBeenCalled();
  });

  it("returns the permission message when a non-participant sends a message", async () => {
    participantService.isParticipant.mockResolvedValue(false);

    await expectNoParticipantError(
      service.saveMessage(
        {
          conversationId: "conversation-1",
          senderId: "spoofed",
          content: "Hello",
        },
        { employeeCode: "E001" },
      ),
    );
    expect(messageRepository.create).not.toHaveBeenCalled();
  });

  it("returns the permission message when a non-participant marks a message read", async () => {
    messageRepository.findConversationIdById.mockResolvedValue(
      "conversation-1",
    );
    participantService.isParticipant.mockResolvedValue(false);

    await expectNoParticipantError(
      service.markRead("message-1", "spoofed", { employeeCode: "E001" }),
    );
  });

  it("still allows a participant to read and send messages", async () => {
    participantService.isParticipant.mockResolvedValue(true);
    messageRepository.findByConversationId.mockResolvedValue([]);
    messageRepository.create.mockResolvedValue({
      id: "message-1",
      conversationId: "conversation-1",
      senderId: "E001",
      type: "TEXT",
      content: "Hello",
      createdAt: new Date("2026-10-17T00:00:00.000Z"),
    });

    await expect(
      service.getMessages("conversation-1", 20, 0, { employeeCode: "E001" }),
    ).resolves.toEqual([]);
    await expect(
      service.saveMessage(
        {
          conversationId: "conversation-1",
          senderId: "spoofed",
          content: "Hello",
        },
        { employeeCode: "E001" },
      ),
    ).resolves.toMatchObject({ senderId: "E001", content: "Hello" });
    expect(rabbitmqService.publishEvent).toHaveBeenCalledWith(
      "message.created",
      expect.objectContaining({ senderId: "E001" }),
    );
  });

  it("continues to allow system actors without participant lookup", async () => {
    messageRepository.findByConversationId.mockResolvedValue([]);

    await expect(
      service.getMessages("conversation-1", 20, 0, { isSystem: true }),
    ).resolves.toEqual([]);
    expect(participantService.isParticipant).not.toHaveBeenCalled();
  });
});
