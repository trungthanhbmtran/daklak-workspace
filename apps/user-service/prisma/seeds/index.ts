import { PrismaClient } from '../../src/generated/prisma/client';

import { seedResources } from './01-resources.seed';
import { seedCommonCategoriesEGovStandard } from './02-common-categories-e-gov-standard.seed';
import { seed1UnitTypesNewModel } from './03-1-unit-types-new-model.seed';
import { seedRoles } from './04-roles.seed';
import { seedUsers } from './05-users.seed';
import { seedJobTitles } from './06-job-titles.seed';
import { seedOrganizationsDakLakProvince } from './07-organizations-dak-lak-province.seed';
import { seedJobPositions } from './08-job-positions.seed';
import { seedCategoriesDanhMCDNgChung } from './09-categories-danh-m-c-d-ng-chung.seed';

export async function runSeeds(prisma: PrismaClient) {
  console.log('Running seedResources...');
  await seedResources(prisma);
  console.log('Running seedCommonCategoriesEGovStandard...');
  await seedCommonCategoriesEGovStandard(prisma);
  console.log('Running seed1UnitTypesNewModel...');
  await seed1UnitTypesNewModel(prisma);
  console.log('Running seedRoles...');
  await seedRoles(prisma);
  console.log('Running seedUsers...');
  await seedUsers(prisma);
  console.log('Running seedJobTitles...');
  await seedJobTitles(prisma);
  console.log('Running seedOrganizationsDakLakProvince...');
  await seedOrganizationsDakLakProvince(prisma);
  console.log('Running seedJobPositions...');
  await seedJobPositions(prisma);
  console.log('Running seedCategoriesDanhMCDNgChung...');
  await seedCategoriesDanhMCDNgChung(prisma);
}
