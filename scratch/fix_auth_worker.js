const fs = require('fs');

const path = 'C:/Users/Admin/Desktop/daklak-workspace/apps/user-service/src/modules/users/auth-state-sync.worker.ts';
let code = fs.readFileSync(path, 'utf8');

const regex1 = /for\s*\(const\s+job\s+of\s+jobs\)\s*\{[\s\S]*?await\s+this\.prisma\.authStateSync\.updateMany\(\{[\s\S]*?\}\);[\s\S]*?\}/;
const replace1 = `if (jobs.length > 0) {
        await Promise.all(jobs.map(job => this.sessions.revokeAllForUser(job.userId, job.authVersion)));
        await this.prisma.authStateSync.updateMany({
          where: { userId: { in: jobs.map(j => j.userId) }, status: 'PENDING' },
          data: { status: 'PROCESSED' }
        });
      }`;

const regex2 = /for\s*\(const\s+session\s+of\s+revoked\)\s*\{[\s\S]*?await\s+this\.prisma\.authDeviceSession\.updateMany\(\{[\s\S]*?\}\);[\s\S]*?\}/;
const replace2 = `if (revoked.length > 0) {
        await Promise.all(revoked.map(session => this.sessions.revokeSession(session.id)));
        await this.prisma.authDeviceSession.updateMany({
          where: { id: { in: revoked.map(s => s.id) }, revokedAt: { not: null } },
          data: { redisCleaned: true }
        });
      }`;

if (regex1.test(code) && regex2.test(code)) {
  code = code.replace(regex1, replace1).replace(regex2, replace2);
  fs.writeFileSync(path, code);
  console.log("Fixed N+1 loops in auth-state-sync.worker.ts");
} else {
  console.log("Could not match the regex.");
}
