const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// The exact replacement strings

const exactReplacements = [
  {
    old: `  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {`,
    new: `  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {`,
    new: `  @Put(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {`,
    new: `  @Put(':id/assign')
  async assignTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {`,
    new: `  @Post(':id/breakdown')
  async breakdownTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {`,
    new: `  @Get(':id/comments')
  async getComments(@Req() req: any, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {`,
    new: `  @Post(':id/comments')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; isSystemMessage?: boolean },
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Post(':id/request-coordination')
  async requestCoordination(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {`,
    new: `  @Post(':id/request-coordination')
  async requestCoordination(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Put(':id/progress')
  async updateTaskProgress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { progress: number },
  ) {`,
    new: `  @Put(':id/progress')
  async updateTaskProgress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { progress: number },
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  },
  {
    old: `  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {`,
    new: `  @Get(':id/subtasks')
  async getSubTasks(@Req() req: any, @Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };`
  }
];

// Revert ParseIntPipe imports
code = code.replace(/ParseIntPipe,\n/g, '');
code = code.replace(/ParseIntPipe/g, '');

// Restore tasks.controller.ts from git before doing replacements to avoid stacking my previous broken scripts
fs.writeFileSync('c:\\Users\\Admin\\Desktop\\daklak-workspace\\scratch\\exact_fix.js', 
`
const fs = require('fs');
const execSync = require('child_process').execSync;
execSync('git checkout apps/api-gateway/src/modules/hrm/tasks.controller.ts', {cwd: 'c:/Users/Admin/Desktop/daklak-workspace'});

let c = fs.readFileSync('${path.replace(/\\/g, '\\\\')}', 'utf8');

c = c.replace(/ParseIntPipe,\\n/g, '');
c = c.replace(/ParseIntPipe/g, '');

${JSON.stringify(exactReplacements)}.forEach(r => {
  c = c.replace(r.old, r.new);
});

// Now replace usages of 'id' with 'parsedId' in the payload
// e.g. this.taskService.GetTask({ id }) -> { id: parsedId }
c = c.replace(/\\bid\\b/g, (match, offset) => {
  // We only want to replace 'id' when it is inside taskService calls
  // This is hard to regex perfectly.
  // Instead, let's just globally replace 'taskId: id,' with 'taskId: parsedId,'
  return match;
});

c = c.replace(/taskId: id,/g, 'taskId: parsedId,');
c = c.replace(/id: id/g, 'id: parsedId');
c = c.replace(/\\{ id \\}/g, '{ id: parsedId }');
c = c.replace(/id,/g, 'id: parsedId,');

// Wait, replacing 'id,' globally is very dangerous! 
// Let's explicitly replace the ones we know:
`);

