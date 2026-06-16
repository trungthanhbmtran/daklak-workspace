const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

const getCommentsReplacement = `@Get(':id/comments')
  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.GetComments({
        taskId: id,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      }),
    );
  }`;

code = code.replace(/@Get\(':id\/comments'\)[\s\S]*?this\.taskService\.GetComments\([\s\S]*?\}\),\n    \);\n  \}/, getCommentsReplacement);


const getSubTasksReplacement = `@Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: id,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      }),
    );
  }`;

code = code.replace(/@Get\(':id\/subtasks'\)[\s\S]*?this\.taskService\.GetSubTasks\([\s\S]*?\}\),\n    \);\n  \}/, getSubTasksReplacement);

const addCommentReplacement = `@Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.AddComment({
        taskId: id,
        authorCode: req.user?.employeeCode || '',
        content: body.content,
        isSystemMessage: body.isSystemMessage || false,
        currentUserCode: user?.employeeCode,
        isAdmin,
        isLeader,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      }),
    );
  }`;

code = code.replace(/@Post\(':id\/comments'\)[\s\S]*?this\.taskService\.AddComment\([\s\S]*?\}\),\n    \);\n  \}/, addCommentReplacement);

fs.writeFileSync(path, code);
console.log('Fixed api gateway getComments and getSubTasks');
