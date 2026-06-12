const fs = require('fs');
let content = fs.readFileSync('apps/user-service/prisma/seed.ts', 'utf8');

const pbacMarkerStart = '// PBAC SEED: SCOPES, POLICIES, ROLES & MAPPINGS';
const pbacMarkerEnd = 'console.log(\'✅ Hoàn tất Seed PBAC Engine.\');';
const jobPosMarker = '// 9. JOB POSITIONS';

const pbacIdxStart = content.lastIndexOf('// ==', content.indexOf(pbacMarkerStart));
const pbacIdxEnd = content.indexOf(pbacMarkerEnd) + pbacMarkerEnd.length;
const jobPosIdxStart = content.lastIndexOf('// ==', content.indexOf(jobPosMarker));

if (pbacIdxStart === -1 || pbacIdxEnd === -1 || jobPosIdxStart === -1) {
  console.log('Markers not found!');
  process.exit(1);
}

const pbacBlock = content.substring(pbacIdxStart, pbacIdxEnd);
content = content.substring(0, pbacIdxStart) + content.substring(pbacIdxEnd);

const newJobPosIdxStart = content.lastIndexOf('// ==', content.indexOf(jobPosMarker));

content = content.substring(0, newJobPosIdxStart) + pbacBlock + '\n\n  ' + content.substring(newJobPosIdxStart);

fs.writeFileSync('apps/user-service/prisma/seed.ts', content);
console.log('Success');
