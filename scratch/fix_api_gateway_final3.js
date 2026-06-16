const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace getComments manually
const startComments = code.indexOf("@Get(':id/comments')");
const endComments = code.indexOf("@Post(':id/comments')");
const newComments = `@Get(':id/comments')
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
  }

  `;

code = code.substring(0, startComments) + newComments + code.substring(endComments);

// Replace getSubTasks manually
const startSubTasks = code.indexOf("@Get(':id/subtasks')");
const endSubTasks = code.lastIndexOf("}"); // End of class
const newSubTasks = `@Get(':id/subtasks')
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
  }
`;

code = code.substring(0, startSubTasks) + newSubTasks + "\n}";

fs.writeFileSync(path, code);
console.log('Surgically fixed getComments and getSubTasks');
