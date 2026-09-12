/**
 * One-off data migration, run once as part of splitting `Project` into `Project` + `System`.
 *
 * At this point the schema has *both* the old Project-owned fields/child tables (name,
 * scope, ports, modules, ...) and the new, empty `System`/`System*` tables plus
 * `Project.systemId` - all purely additive (see migration `20260910083203_add_system_entity`).
 * This script copies every project's system-shaped data into a new System row, re-points
 * its child rows (ports/modules/subSystems/externalInterfaces/people/documents) at that new
 * System, and sets `project.systemId`. Nothing is deleted here - the old Project-owned
 * columns/tables are dropped in a later, separate migration only after this has been
 * verified.
 *
 * Idempotent: a project that already has `systemId` set is skipped, so re-running after a
 * partial failure is safe.
 *
 * Run with: npx tsx prisma/copy-projects-to-systems.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: { systemId: null },
    orderBy: { id: 'asc' },
  });

  console.log(`Found ${projects.length} project(s) without a systemId to migrate.`);

  let migrated = 0;
  for (const project of projects) {
    await prisma.$transaction(
      async (tx) => {
        const system = await tx.system.create({
          data: {
            name: project.name,
            scope: project.scope,
            projectType: project.projectType,
            products: project.products,
            description: project.description,
            customerDetails: project.customerDetails,
            endUserDetails: project.endUserDetails,
            countryId: project.countryId,
            systemUnlocodeId: project.systemUnlocodeId,
            pocName: project.pocName,
            pocEmail: project.pocEmail,
            pocPhone: project.pocPhone,
            systemUrl: project.projectUrl,
            isSensitive: project.isSensitive,
            canBeUsedAsReference: project.canBeUsedAsReference,
            showOnMap: project.showOnMap,
            systemDecommissioned: project.systemDecommissioned,
            deleted: project.deleted,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
        });

        await tx.project.update({ where: { id: project.id }, data: { systemId: system.id } });

        const [ports, modules, subSystems, externalInterfaces, people, documents] =
          await Promise.all([
            tx.projectPort.findMany({ where: { projectId: project.id } }),
            tx.projectModule.findMany({ where: { projectId: project.id } }),
            tx.projectSubSystem.findMany({ where: { projectId: project.id } }),
            tx.projectExternalInterface.findMany({ where: { projectId: project.id } }),
            tx.projectPerson.findMany({ where: { projectId: project.id } }),
            tx.projectDocument.findMany({ where: { projectId: project.id } }),
          ]);

        if (ports.length > 0) {
          await tx.systemPort.createMany({
            data: ports.map((row) => ({ systemId: system.id, unlocodeId: row.unlocodeId })),
          });
        }
        if (modules.length > 0) {
          await tx.systemModule.createMany({
            data: modules.map((row) => ({ systemId: system.id, name: row.name })),
          });
        }
        if (subSystems.length > 0) {
          await tx.systemSubSystem.createMany({
            data: subSystems.map((row) => ({ systemId: system.id, name: row.name })),
          });
        }
        if (externalInterfaces.length > 0) {
          await tx.systemExternalInterface.createMany({
            data: externalInterfaces.map((row) => ({
              systemId: system.id,
              name: row.name,
              description: row.description,
            })),
          });
        }
        if (people.length > 0) {
          await tx.systemPerson.createMany({
            data: people.map((row) => ({
              systemId: system.id,
              name: row.name,
              role: row.role,
              email: row.email,
            })),
          });
        }
        if (documents.length > 0) {
          await tx.systemDocument.createMany({
            data: documents.map((row) => ({
              systemId: system.id,
              documentTypeId: row.documentTypeId,
              fileName: row.fileName,
              filePath: row.filePath,
              fileSize: row.fileSize,
              mimeType: row.mimeType,
              uploadedAt: row.uploadedAt,
              uploadedBy: row.uploadedBy,
            })),
          });
        }

        migrated += 1;
      },
      { timeout: 30_000 },
    );
  }

  console.log(`Migrated ${migrated} project(s) into new System rows.`);

  const counts = await prisma.$transaction([
    prisma.project.count(),
    prisma.system.count(),
    prisma.projectPort.count(),
    prisma.systemPort.count(),
    prisma.projectModule.count(),
    prisma.systemModule.count(),
    prisma.projectSubSystem.count(),
    prisma.systemSubSystem.count(),
    prisma.projectExternalInterface.count(),
    prisma.systemExternalInterface.count(),
    prisma.projectPerson.count(),
    prisma.systemPerson.count(),
    prisma.projectDocument.count(),
    prisma.systemDocument.count(),
  ]);

  const [
    projectCount,
    systemCount,
    projectPortCount,
    systemPortCount,
    projectModuleCount,
    systemModuleCount,
    projectSubSystemCount,
    systemSubSystemCount,
    projectExternalInterfaceCount,
    systemExternalInterfaceCount,
    projectPersonCount,
    systemPersonCount,
    projectDocumentCount,
    systemDocumentCount,
  ] = counts;

  console.table({
    projects: { old: projectCount, new: systemCount },
    ports: { old: projectPortCount, new: systemPortCount },
    modules: { old: projectModuleCount, new: systemModuleCount },
    subSystems: { old: projectSubSystemCount, new: systemSubSystemCount },
    externalInterfaces: { old: projectExternalInterfaceCount, new: systemExternalInterfaceCount },
    people: { old: projectPersonCount, new: systemPersonCount },
    documents: { old: projectDocumentCount, new: systemDocumentCount },
  });

  const projectsWithoutSystem = await prisma.project.count({ where: { systemId: null } });
  if (projectsWithoutSystem > 0) {
    throw new Error(`${projectsWithoutSystem} project(s) still have no systemId after migration`);
  }
  if (projectCount !== systemCount) {
    throw new Error(`Row count mismatch: ${projectCount} projects vs ${systemCount} systems`);
  }
  if (
    projectPortCount !== systemPortCount ||
    projectModuleCount !== systemModuleCount ||
    projectSubSystemCount !== systemSubSystemCount ||
    projectExternalInterfaceCount !== systemExternalInterfaceCount ||
    projectPersonCount !== systemPersonCount ||
    projectDocumentCount !== systemDocumentCount
  ) {
    throw new Error('Child row count mismatch between old Project* and new System* tables');
  }

  console.log('Verification passed: every project has a systemId and all child counts match.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
