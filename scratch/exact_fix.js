
const fs = require('fs');
const execSync = require('child_process').execSync;
execSync('git checkout apps/api-gateway/src/modules/hrm/tasks.controller.ts', {cwd: 'c:/Users/Admin/Desktop/daklak-workspace'});

let c = fs.readFileSync('c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts', 'utf8');

c = c.replace(/ParseIntPipe,\n/g, '');
c = c.replace(/ParseIntPipe/g, '');

[{"old":"  @Put(':id')\n  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {","new":"  @Put(':id')\n  async update(@Param('id') id: string, @Body() body: any) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Put(':id/status')\n  async updateStatus(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: any,\n  ) {","new":"  @Put(':id/status')\n  async updateStatus(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: any,\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Put(':id/assign')\n  async assignTask(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: any,\n  ) {","new":"  @Put(':id/assign')\n  async assignTask(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: any,\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Post(':id/breakdown')\n  async breakdownTask(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: any,\n  ) {","new":"  @Post(':id/breakdown')\n  async breakdownTask(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: any,\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Get(':id/comments')\n  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {","new":"  @Get(':id/comments')\n  async getComments(@Req() req: any, @Param('id') id: string) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Post(':id/comments')\n  async addComment(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: { content: string; isSystemMessage?: boolean },\n  ) {","new":"  @Post(':id/comments')\n  async addComment(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: { content: string; isSystemMessage?: boolean },\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Post(':id/request-coordination')\n  async requestCoordination(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: any,\n  ) {","new":"  @Post(':id/request-coordination')\n  async requestCoordination(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: any,\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Put(':id/progress')\n  async updateTaskProgress(\n    @Req() req: any,\n    @Param('id', ParseIntPipe) id: number,\n    @Body() body: { progress: number },\n  ) {","new":"  @Put(':id/progress')\n  async updateTaskProgress(\n    @Req() req: any,\n    @Param('id') id: string,\n    @Body() body: { progress: number },\n  ) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"},{"old":"  @Get(':id/subtasks')\n  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {","new":"  @Get(':id/subtasks')\n  async getSubTasks(@Req() req: any, @Param('id') id: string) {\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };"}].forEach(r => {
  c = c.replace(r.old, r.new);
});

// Now replace usages of 'id' with 'parsedId' in the payload
// e.g. this.taskService.GetTask({ id }) -> { id: parsedId }
c = c.replace(/\bid\b/g, (match, offset) => {
  // We only want to replace 'id' when it is inside taskService calls
  // This is hard to regex perfectly.
  // Instead, let's just globally replace 'taskId: id,' with 'taskId: parsedId,'
  return match;
});

c = c.replace(/taskId: id,/g, 'taskId: parsedId,');
c = c.replace(/id: id/g, 'id: parsedId');
c = c.replace(/\{ id \}/g, '{ id: parsedId }');
c = c.replace(/id,/g, 'id: parsedId,');

// Wait, replacing 'id,' globally is very dangerous! 
// Let's explicitly replace the ones we know:
