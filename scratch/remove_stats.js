const fs = require('fs');
const path = require('path');

const workspace = 'C:/Users/Admin/Desktop/daklak-workspace';

// 1. Remove GetTaskStats and GetAttendanceStats from hrm-service
const hrmTaskControllerPath = path.join(workspace, 'apps/hrm-service/src/modules/tasks/tasks.controller.ts');
let hrmTaskCtrl = fs.readFileSync(hrmTaskControllerPath, 'utf8');
hrmTaskCtrl = hrmTaskCtrl.replace(/@GrpcMethod\('TaskService',\s*'GetTaskStats'\)[\s\S]*?getTaskStats\(data:\s*any\)\s*\{\s*return\s*this\.tasksService\.getTaskStats\(data\);\s*\}/, '');
hrmTaskCtrl = hrmTaskCtrl.replace(/@GrpcMethod\('TaskService',\s*'GetAttendanceStats'\)[\s\S]*?getAttendanceStats\(data:\s*any\)\s*\{\s*return\s*this\.tasksService\.getAttendanceStats\(data\.taskId\);\s*\}/, '');
fs.writeFileSync(hrmTaskControllerPath, hrmTaskCtrl);

const hrmTaskServicePath = path.join(workspace, 'apps/hrm-service/src/modules/tasks/tasks.service.ts');
let hrmTaskSvc = fs.readFileSync(hrmTaskServicePath, 'utf8');
hrmTaskSvc = hrmTaskSvc.replace(/private buildIndividualAndDeptStats[\s\S]*?async getTaskStats\(query:\s*any\)\s*\{[\s\S]*?return\s*\{\s*success:\s*true,\s*message:\s*'Lấy thống kê nhiệm vụ thành công',\s*data:\s*stats\s*\};\s*\}/, '');
fs.writeFileSync(hrmTaskServicePath, hrmTaskSvc);

// 2. Remove GetPostStats from posts-service
const postsControllerPath = path.join(workspace, 'apps/posts-service/src/modules/posts/posts.controller.ts');
let postsCtrl = fs.readFileSync(postsControllerPath, 'utf8');
postsCtrl = postsCtrl.replace(/@GrpcMethod\('PostService',\s*'GetPostStats'\)[\s\S]*?getPostStats\(@Payload\(\)\s*data:\s*GetPostStatsGrpcDto\)\s*\{\s*return\s*this\.postsService\.getStats\(data\);\s*\}/, '');
fs.writeFileSync(postsControllerPath, postsCtrl);

const postsServicePath = path.join(workspace, 'apps/posts-service/src/modules/posts/posts.service.ts');
let postsSvc = fs.readFileSync(postsServicePath, 'utf8');
postsSvc = postsSvc.replace(/async getStats\(query:[\s\S]*?return\s*\{\s*total,[\s\S]*?\}\s*\];\s*\}/, '');
fs.writeFileSync(postsServicePath, postsSvc);

// 3. Remove GetEvaluationStats from task-kpi (kpi-evaluations)
const kpiEvalControllerPath = path.join(workspace, 'apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.controller.ts');
let kpiEvalCtrl = fs.readFileSync(kpiEvalControllerPath, 'utf8');
kpiEvalCtrl = kpiEvalCtrl.replace(/@GrpcMethod\('KpiService',\s*'GetEvaluationStats'\)[\s\S]*?getEvaluationStats\(data:\s*any\)\s*\{\s*return\s*this\.kpiEvaluationsService\.getEvaluationStats\(data\);\s*\}/, '');
fs.writeFileSync(kpiEvalControllerPath, kpiEvalCtrl);

const kpiEvalServicePath = path.join(workspace, 'apps/hrm-service/src/modules/kpi-evaluations/kpi-evaluations.service.ts');
let kpiEvalSvc = fs.readFileSync(kpiEvalServicePath, 'utf8');
kpiEvalSvc = kpiEvalSvc.replace(/async getEvaluationStats\(query:\s*any\)\s*\{[\s\S]*?return\s*\{\s*success:\s*true,[\s\S]*?\}\s*\};\s*\}/, '');
fs.writeFileSync(kpiEvalServicePath, kpiEvalSvc);

// 4. Remove GetStatistics from document-service
const docControllerPath = path.join(workspace, 'apps/document-service/src/modules/document/document.controller.ts');
let docCtrl = fs.readFileSync(docControllerPath, 'utf8');
docCtrl = docCtrl.replace(/@GrpcMethod\('DocumentService',\s*'GetStatistics'\)[\s\S]*?getStatistics\(@Payload\(\)\s*data:\s*AnyGrpcDto\)\s*\{\s*return\s*this\.documentService\.getStatistics\(\);\s*\}/, '');
fs.writeFileSync(docControllerPath, docCtrl);

const docServicePath = path.join(workspace, 'apps/document-service/src/modules/document/document.service.ts');
let docSvc = fs.readFileSync(docServicePath, 'utf8');
docSvc = docSvc.replace(/async getStatistics\(\)\s*\{[\s\S]*?return\s*\{[\s\S]*?\}\s*;/g, '');
// Wait, the regex might overmatch, let's just do a simpler replace for docService
let ds = docSvc.split('async getStatistics() {');
if(ds.length > 1) {
  let end = ds[1].indexOf('async getLogs');
  if(end > -1) {
    fs.writeFileSync(docServicePath, ds[0] + ds[1].substring(end));
  }
}

console.log("Deleted old stats endpoints successfully");
