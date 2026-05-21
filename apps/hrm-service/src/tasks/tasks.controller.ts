import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @GrpcMethod('TaskService', 'CreateTask')
  async createTask(data: { title: string; description?: string; assigneeId: number; assignerId: number; dueDate?: string }) {
    const task = await this.tasksService.create({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    return {
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('TaskService', 'ListTasks')
  async listTasks(data: { assigneeId?: number }) {
    let tasks;
    if (data.assigneeId) {
      tasks = await this.tasksService.findByAssignee(data.assigneeId);
    } else {
      tasks = await this.tasksService.findAll();
    }
    return {
      tasks: tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate?.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  }

  @GrpcMethod('TaskService', 'UpdateTaskStatus')
  async updateTaskStatus(data: { id: number; status: string }) {
    const task = await this.tasksService.updateStatus(data.id, data.status);
    return {
      ...task,
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
