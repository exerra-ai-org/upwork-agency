import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const bidderRole = await prisma.role.upsert({
    where: { name: 'bidder' },
    update: {},
    create: { name: 'bidder' },
  });

  const closerRole = await prisma.role.upsert({
    where: { name: 'closer' },
    update: {},
    create: { name: 'closer' },
  });

  const developerRole = await prisma.role.upsert({
    where: { name: 'developer' },
    update: {},
    create: { name: 'developer' },
  });

  const qaRole = await prisma.role.upsert({
    where: { name: 'qa' },
    update: {},
    create: { name: 'qa' },
  });

  const scriptWriterRole = await prisma.role.upsert({
    where: { name: 'script_writer' },
    update: {},
    create: { name: 'script_writer' },
  });

  const leadershipRole = await prisma.role.upsert({
    where: { name: 'leadership' },
    update: {},
    create: { name: 'leadership' },
  });

  // Create teams
  const salesTeam = await prisma.team.upsert({
    where: { id: 'team-sales' },
    update: {},
    create: { id: 'team-sales', name: 'Sales' },
  });

  const devTeam = await prisma.team.upsert({
    where: { id: 'team-dev' },
    update: {},
    create: { id: 'team-dev', name: 'Development' },
  });

  const qaTeam = await prisma.team.upsert({
    where: { id: 'team-qa' },
    update: {},
    create: { id: 'team-qa', name: 'QA' },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aop.local' },
    update: {},
    create: {
      email: 'admin@aop.local',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
      teamId: salesTeam.id,
    },
  });

  console.log('Seed completed:', {
    roles: [
      adminRole.name,
      bidderRole.name,
      closerRole.name,
      developerRole.name,
      qaRole.name,
      scriptWriterRole.name,
      leadershipRole.name,
    ],
    teams: [salesTeam.name, devTeam.name, qaTeam.name],
    adminUser: adminUser.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
