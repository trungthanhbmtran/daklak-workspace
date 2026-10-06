const fs = require('fs');
let u = fs.readFileSync('../apps/user-service/prisma/schema/user.prisma', 'utf8');
u = u.replace(/policies\s+Policy\[\]\s+@relation\("PolicyToUser"\)/, 'policies        UserPolicy[]');
u = u.replace(/policies\s+Policy\[\]\s+@relation\("PolicyToUserGroup"\)/, 'policies        UserGroupPolicy[]');
fs.writeFileSync('../apps/user-service/prisma/schema/user.prisma', u);

let c = fs.readFileSync('../apps/user-service/prisma/schema/pbac.prisma', 'utf8');
c = c.replace(/users\s+User\[\]\s+@relation\("PolicyToUser"\)/, 'users      UserPolicy[]');
c = c.replace(/userGroups\s+UserGroup\[\]\s+@relation\("PolicyToUserGroup"\)/, 'userGroups UserGroupPolicy[]');
c += `
model UserPolicy {
  userId Int
  policyId Int
  user User @relation(fields: [userId, organizationId], references: [id, organizationId], onDelete: Cascade)
  policy Policy @relation(fields: [policyId, organizationId], references: [id, organizationId], onDelete: Cascade)
  organizationId String @default("DEFAULT") @map("organization_id")
  @@id([userId, policyId, organizationId])
  @@map("user_policies")
}

model UserGroupPolicy {
  groupId Int
  policyId Int
  group UserGroup @relation(fields: [groupId, organizationId], references: [id, organizationId], onDelete: Cascade)
  policy Policy @relation(fields: [policyId, organizationId], references: [id, organizationId], onDelete: Cascade)
  organizationId String @default("DEFAULT") @map("organization_id")
  @@id([groupId, policyId, organizationId])
  @@map("user_group_policies")
}
`;
fs.writeFileSync('../apps/user-service/prisma/schema/pbac.prisma', c);
