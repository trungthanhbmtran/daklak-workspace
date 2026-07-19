import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  // --- Comments ---
  async createComment(data: any) {
    return this.prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        parentId: data.parentId || null,
        authorId: data.authorId,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorIp: data.authorIp,
        status: 'PENDING',
      },
    });
  }

  async listComments(query: any) {
    const { postId, status } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    
    const where = {
      ...(postId && { postId }),
      ...(status && { status }),
    };
    
    let paginationArgs: any = { take: limit };
    if (query.cursor) {
      paginationArgs.cursor = { id: query.cursor };
      paginationArgs.skip = 1;
    } else {
      paginationArgs.skip = (page - 1) * limit;
    }

    const [total, items] = await Promise.all([
      query.cursor ? Promise.resolve(0) : this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { replies: true },
        ...paginationArgs,
      })
    ]);

    return { items, total };
  }

  async updateCommentStatus(id: string, status: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }

  async deleteComment(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return { success: true };
  }

  // --- Questions ---
  async createQuestion(data: any) {
    return this.prisma.citizenQuestion.create({
      data: {
        title: data.title,
        content: data.content,
        askedByName: data.askedByName,
        askedByEmail: data.askedByEmail,
        askedByPhone: data.askedByPhone,
        address: data.address,
        categoryId: data.categoryId,
        status: 'PENDING',
      },
    });
  }

  async listQuestions(query: any) {
    const { status, onlyPublic, categoryId } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    
    const where = {
      ...(status && { status }),
      ...(onlyPublic && { isPublic: true }),
      ...(categoryId && { categoryId }),
    };
    
    let paginationArgs: any = { take: limit };
    if (query.cursor) {
      paginationArgs.cursor = { id: query.cursor };
      paginationArgs.skip = 1;
    } else {
      paginationArgs.skip = (page - 1) * limit;
    }

    const [total, items] = await Promise.all([
      query.cursor ? Promise.resolve(0) : this.prisma.citizenQuestion.count({ where }),
      this.prisma.citizenQuestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginationArgs,
      })
    ]);

    return { items, total };
  }

  async answerQuestion(data: any) {
    const { id, answerContent, answeredById, isPublic } = data;
    return this.prisma.citizenQuestion.update({
      where: { id },
      data: {
        answerContent,
        answeredById,
        isPublic,
        answeredAt: new Date(),
        status: 'ANSWERED',
      },
    });
  }

  async getQuestion(id: string) {
    return this.prisma.citizenQuestion.findUnique({ where: { id } });
  }

  // --- Feedbacks ---
  async createFeedback(data: any) {
    return this.prisma.citizenFeedback.create({
      data: {
        title: data.title,
        content: data.content,
        feedbackType: data.feedbackType || 'GENERAL',
        referenceId: data.referenceId,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        status: 'NEW',
      },
    });
  }

  async listFeedbacks(query: any) {
    const { feedbackType, status } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    
    const where = {
      ...(feedbackType && { feedbackType }),
      ...(status && { status }),
    };

    let paginationArgs: any = { take: limit };
    if (query.cursor) {
      paginationArgs.cursor = { id: query.cursor };
      paginationArgs.skip = 1;
    } else {
      paginationArgs.skip = (page - 1) * limit;
    }

    const [total, items] = await Promise.all([
      query.cursor ? Promise.resolve(0) : this.prisma.citizenFeedback.count({ where }),
      this.prisma.citizenFeedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...paginationArgs,
      })
    ]);

    return { items, total };
  }

  async updateFeedbackStatus(id: string, status: string) {
    return this.prisma.citizenFeedback.update({
      where: { id },
      data: { status },
    });
  }
}
