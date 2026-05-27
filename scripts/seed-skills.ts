import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const skillsDir = path.join(__dirname, '..', 'skills');
  const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));

  console.log(`Found ${files.length} skill files.`);

  // Department mapping based on filename
  const deptMap: Record<string, string> = {
    'employment-act-1955': 'HR',
    'epf-socso-eis-contributions': 'HR',
    'overtime-calculations': 'HR',
    'leave-management': 'HR',
    'foreign-worker-compliance': 'HR',
    'claims-mileage-expenses': 'Field Services',
    'recruitment-ats': 'Recruitment',
    'performance-management': 'HR',
    'payroll-processing': 'Finance',
    'training-development': 'HR',
    'document-management': 'HR',
    'employee-self-service': 'General',
    'org-chart-hierarchy': 'General',
    'approval-workflow': 'General',
    'announcements-communication': 'General',
    'calendar-events-scheduling': 'General',
  };

  for (const file of files) {
    const content = fs.readFileSync(path.join(skillsDir, file), 'utf-8');
    const title = file.replace(/\.md$/, '').replace(/-/g, ' ');
    const deptKey = file.replace(/\.md$/, '');
    const department = deptMap[deptKey] || 'General';

    // Use the filename without extension as the unique identifier
    const existing = await prisma.skill.findFirst({ where: { filename: file } });
    if (existing) {
      console.log(`Updating: ${title}`);
      await prisma.skill.update({
        where: { id: existing.id },
        data: { title, department, content },
      });
    } else {
      console.log(`Creating: ${title}`);
      await prisma.skill.create({
        data: { title, department, content, filename: file },
      });
    }
  }

  console.log('Done! All skills seeded.');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
