const fs = require('fs');

const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';

// Restore the original file from git again to start fresh
const execSync = require('child_process').execSync;
execSync('git checkout apps/api-gateway/src/modules/hrm/tasks.controller.ts', {cwd: 'c:/Users/Admin/Desktop/daklak-workspace'});

let code = fs.readFileSync(path, 'utf8');

// Replace ParseIntPipe imports
code = code.replace(/ParseIntPipe,\n/g, '');
code = code.replace(/ParseIntPipe/g, '');

const replacements = [
  {
    old: `  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const user = (req as any).user;
    return firstValueFrom(
      this.taskService.UpdateTask({
        id,`,
    new: `  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = (req as any).user;
    return firstValueFrom(
      this.taskService.UpdateTask({
        id: parsedId,`
  },
  {
    old: `  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;

    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id,`,
    new: `  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = req.user;
    const assignerCode = user?.employeeCode;

    return firstValueFrom(
      this.taskService.UpdateTaskStatus({
        id: parsedId,`
  },
  {
    old: `  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const assigneeCode = body.assigneeCode;
    const coassigneeCodes = body.coassigneeCodes || body.coAssigneeCodes || [];
    const departmentId = body.departmentId;

    const user = req.user;
    const assignerCode = user?.employeeCode;
    

    return firstValueFrom(
      this.taskService.AssignTask({
        id,`,
    new: `  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const assigneeCode = body.assigneeCode;
    const coassigneeCodes = body.coassigneeCodes || body.coAssigneeCodes || [];
    const departmentId = body.departmentId;

    const user = req.user;
    const assignerCode = user?.employeeCode;
    

    return firstValueFrom(
      this.taskService.AssignTask({
        id: parsedId,`
  },
  {
    old: `  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    
    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask({ id: id }),
    );
    const taskData = taskResponse?.data;
    if (!taskData) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    // Chỉ owner (người được giao hiện tại) hoặc admin mới được tạo task con
    if (!isAdmin && taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền phân rã nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.BreakdownTask({
        ...body,
        parentId: id,`,
    new: `  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    
    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask({ id: parsedId }),
    );
    const taskData = taskResponse?.data;
    if (!taskData) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    // Chỉ owner (người được giao hiện tại) hoặc admin mới được tạo task con
    if (!isAdmin && taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền phân rã nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.BreakdownTask({
        ...body,
        parentId: parsedId,`
  },
  {
    old: `  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.GetComments({
        taskId: id,`,
    new: `  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: [] };
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    return firstValueFrom(
      this.taskService.GetComments({
        taskId: parsedId,`
  },
  {
    old: `  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Người dùng chưa đăng nhập');

    return firstValueFrom(
      this.taskService.AddComment({
        taskId: id,`,
    new: `  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = req.user;
    if (!user) throw new UnauthorizedException('Người dùng chưa đăng nhập');

    return firstValueFrom(
      this.taskService.AddComment({
        taskId: parsedId,`
  },
  {
    old: `  @Post(':id/request-coordination')
  async requestCoordination(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    const user = req.user;
    const assignerCode = user?.employeeCode;

    // Lấy thông tin task để kiểm tra quyền
    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask({ id: id }),
    );
    const taskData = taskResponse?.data;

    if (!taskData) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    if (taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền yêu cầu phối hợp cho nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.RequestCoordination({
        id,`,
    new: `  @Post(':id/request-coordination')
  async requestCoordination(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = req.user;
    const assignerCode = user?.employeeCode;

    // Lấy thông tin task để kiểm tra quyền
    const taskResponse: any = await firstValueFrom(
      this.taskService.GetTask({ id: parsedId }),
    );
    const taskData = taskResponse?.data;

    if (!taskData) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    if (taskData.assigneeCode !== assignerCode) {
      throw new Error(
        'Bạn không có quyền yêu cầu phối hợp cho nhiệm vụ này (Không phải người đang xử lý).',
      );
    }

    return firstValueFrom(
      this.taskService.RequestCoordination({
        id: parsedId,`
  },
  {
    old: `  @Put(':id/progress')
  async updateTaskProgress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { progress: number },
  ) {
    const user = req.user;

    return firstValueFrom(
      this.taskService.UpdateTaskProgress({
        taskId: id,`,
    new: `  @Put(':id/progress')
  async updateTaskProgress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { progress: number },
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };
    const user = req.user;

    return firstValueFrom(
      this.taskService.UpdateTaskProgress({
        taskId: parsedId,`
  },
  {
    old: `  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: id,`,
    new: `  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: [] };
    return firstValueFrom(
      this.taskService.GetSubTasks({
        taskId: parsedId,`
  }
];

replacements.forEach(r => {
  code = code.replace(r.old, r.new);
});

fs.writeFileSync(path, code);
console.log('Successfully reverted ParseIntPipe properly!');
