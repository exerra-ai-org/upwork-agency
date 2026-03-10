import 'dotenv/config';
import {
  PrismaClient,
  ProjectStage,
  PricingType,
  MeetingType,
  MeetingStatus,
  TaskStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const roles = await seedRoles();
  const teams = await seedTeams();
  const orgs = await seedOrganizations();
  const users = await seedUsers(roles, teams);
  await seedUserOrganizations(users, orgs);
  const niches = await seedNiches(orgs);
  await seedProjects(users, orgs, niches, teams);

  console.log('Seed completed successfully.');
}

// -------------------------------------------------------
// Roles
// -------------------------------------------------------
async function seedRoles() {
  const roleNames = ['admin', 'bidder', 'closer', 'operator', 'qa', 'lead', 'project_manager'];
  const roles: Record<string, { id: string; name: string }> = {};

  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('  Roles seeded:', roleNames.join(', '));
  return roles;
}

// -------------------------------------------------------
// Teams
// -------------------------------------------------------
async function seedTeams() {
  const teamDefs = [
    { id: 'team-alpha', name: 'Alpha Sales' },
    { id: 'team-beta', name: 'Beta Sales' },
    { id: 'team-ops', name: 'Operations' },
    { id: 'team-qa', name: 'QA' },
  ];

  const teams: Record<string, { id: string; name: string }> = {};

  for (const t of teamDefs) {
    teams[t.id] = await prisma.team.upsert({
      where: { id: t.id },
      update: { name: t.name },
      create: t,
    });
  }

  console.log('  Teams seeded:', teamDefs.map((t) => t.name).join(', '));
  return teams;
}

// -------------------------------------------------------
// Organizations
// -------------------------------------------------------
async function seedOrganizations() {
  const orgDefs = [
    {
      id: 'org-dev',
      name: 'Development Services',
      slug: 'development-services',
      description: 'Full-stack web & app development, AI automation, DevOps',
      isActive: true,
    },
    {
      id: 'org-accounting',
      name: 'Accounting Services',
      slug: 'accounting-services',
      description: 'Bookkeeping, tax preparation, financial reporting',
      isActive: true,
    },
    {
      id: 'org-paralegal',
      name: 'Paralegal Services',
      slug: 'paralegal-services',
      description: 'Legal research, document drafting, case management',
      isActive: true,
    },
  ];

  const orgs: Record<string, { id: string; name: string; slug: string }> = {};

  for (const o of orgDefs) {
    orgs[o.id] = await prisma.organization.upsert({
      where: { slug: o.slug },
      update: { name: o.name, description: o.description, isActive: o.isActive },
      create: o,
    });
  }

  console.log('  Organizations seeded:', orgDefs.map((o) => o.name).join(', '));
  return orgs;
}

// -------------------------------------------------------
// Users
// -------------------------------------------------------
async function seedUsers(
  roles: Record<string, { id: string }>,
  teams: Record<string, { id: string }>,
) {
  const password = await bcrypt.hash('password123', 10);

  const userDefs = [
    {
      id: 'user-admin',
      email: 'admin@aop.local',
      firstName: 'Admin',
      lastName: 'User',
      roleId: roles.admin.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-lead',
      email: 'lead@aop.local',
      firstName: 'Morgan',
      lastName: 'Davis',
      roleId: roles.lead.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-bidder',
      email: 'bidder@aop.local',
      firstName: 'Sarah',
      lastName: 'Chen',
      roleId: roles.bidder.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-bidder2',
      email: 'bidder2@aop.local',
      firstName: 'Ryan',
      lastName: 'Park',
      roleId: roles.bidder.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-closer',
      email: 'closer@aop.local',
      firstName: 'James',
      lastName: 'Wilson',
      roleId: roles.closer.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-closer2',
      email: 'closer2@aop.local',
      firstName: 'Maria',
      lastName: 'Garcia',
      roleId: roles.closer.id,
      teamId: teams['team-alpha'].id,
    },
    {
      id: 'user-pm',
      email: 'pm@aop.local',
      firstName: 'Taylor',
      lastName: 'Brooks',
      roleId: roles.project_manager.id,
      teamId: teams['team-ops'].id,
    },
    {
      id: 'user-operator',
      email: 'operator@aop.local',
      firstName: 'Alex',
      lastName: 'Kim',
      roleId: roles.operator.id,
      teamId: teams['team-ops'].id,
    },
    {
      id: 'user-operator2',
      email: 'operator2@aop.local',
      firstName: 'Casey',
      lastName: 'Rivera',
      roleId: roles.operator.id,
      teamId: teams['team-ops'].id,
    },
    {
      id: 'user-qa',
      email: 'qa@aop.local',
      firstName: 'Pat',
      lastName: 'Taylor',
      roleId: roles.qa.id,
      teamId: teams['team-qa'].id,
    },
  ];

  const users: Record<string, { id: string; email: string }> = {};

  for (const u of userDefs) {
    users[u.id] = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: u.roleId,
        teamId: u.teamId,
        passwordHash: password,
        isActive: true,
      },
      create: {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: u.roleId,
        teamId: u.teamId,
        passwordHash: password,
        isActive: true,
      },
    });
  }

  console.log('  Users seeded:', userDefs.map((u) => u.email).join(', '));
  return users;
}

// -------------------------------------------------------
// User <-> Organization memberships
// -------------------------------------------------------
async function seedUserOrganizations(
  users: Record<string, { id: string }>,
  orgs: Record<string, { id: string }>,
) {
  // All users belong to Development Services
  // Some also belong to Accounting/Paralegal for demo purposes
  const assignments = [
    // Everyone in dev org
    ...Object.values(users).map((u) => ({ userId: u.id, organizationId: orgs['org-dev'].id })),
    // Lead and admin also in accounting
    { userId: users['user-admin'].id, organizationId: orgs['org-accounting'].id },
    { userId: users['user-lead'].id, organizationId: orgs['org-accounting'].id },
    { userId: users['user-bidder'].id, organizationId: orgs['org-accounting'].id },
    { userId: users['user-closer'].id, organizationId: orgs['org-accounting'].id },
    // Admin and lead also in paralegal
    { userId: users['user-admin'].id, organizationId: orgs['org-paralegal'].id },
    { userId: users['user-lead'].id, organizationId: orgs['org-paralegal'].id },
  ];

  for (const a of assignments) {
    await prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: a.userId, organizationId: a.organizationId } },
      update: {},
      create: a,
    });
  }

  console.log('  User-organization memberships seeded.');
}

// -------------------------------------------------------
// Niches (org-scoped)
// -------------------------------------------------------
async function seedNiches(orgs: Record<string, { id: string }>) {
  const nicheDefs = [
    // Development Services niches
    {
      id: 'niche-ai',
      name: 'AI Automation',
      slug: 'ai-automation',
      description: 'AI agents, chatbots, workflow automation',
      organizationId: orgs['org-dev'].id,
    },
    {
      id: 'niche-web',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Full-stack web applications and websites',
      organizationId: orgs['org-dev'].id,
    },
    {
      id: 'niche-app',
      name: 'App Development',
      slug: 'app-development',
      description: 'Mobile and desktop applications',
      organizationId: orgs['org-dev'].id,
    },
    {
      id: 'niche-devops',
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'Infrastructure, CI/CD, cloud architecture',
      organizationId: orgs['org-dev'].id,
    },
    // Accounting Services niches
    {
      id: 'niche-bookkeeping',
      name: 'Bookkeeping',
      slug: 'bookkeeping',
      description: 'Day-to-day financial record keeping',
      organizationId: orgs['org-accounting'].id,
    },
    {
      id: 'niche-tax',
      name: 'Tax Preparation',
      slug: 'tax-preparation',
      description: 'Individual and business tax filing',
      organizationId: orgs['org-accounting'].id,
    },
    // Paralegal Services niches
    {
      id: 'niche-legal-research',
      name: 'Legal Research',
      slug: 'legal-research',
      description: 'Case law research and memoranda',
      organizationId: orgs['org-paralegal'].id,
    },
  ];

  const niches: Record<string, { id: string; name: string }> = {};

  for (const n of nicheDefs) {
    niches[n.id] = await prisma.niche.upsert({
      where: { slug_organizationId: { slug: n.slug, organizationId: n.organizationId } },
      update: { name: n.name, description: n.description },
      create: n,
    });
  }

  console.log('  Niches seeded:', nicheDefs.map((n) => n.name).join(', '));
  return niches;
}

// -------------------------------------------------------
// Projects — full pipeline coverage
// -------------------------------------------------------
async function seedProjects(
  users: Record<string, { id: string }>,
  orgs: Record<string, { id: string }>,
  niches: Record<string, { id: string }>,
  teams: Record<string, { id: string }>,
) {
  const orgId = orgs['org-dev'].id;
  const teamId = teams['team-alpha'].id;

  const projectDefs = [
    // Stage: DISCOVERED
    {
      id: 'proj-1',
      title: 'Build AI Customer Support Chatbot',
      jobUrl: 'https://www.upwork.com/jobs/~01abc123',
      jobDescription:
        'We need an intelligent chatbot integrated with our CRM. Must handle 500+ concurrent users. Budget is flexible for the right team.',
      pricingType: PricingType.FIXED,
      fixedPrice: 8000,
      stage: ProjectStage.DISCOVERED,
      organizationId: orgId,
      nicheId: niches['niche-ai'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
    },
    // Stage: SCRIPTED
    {
      id: 'proj-2',
      title: 'React Dashboard for SaaS Analytics Platform',
      jobUrl: 'https://www.upwork.com/jobs/~01def456',
      jobDescription:
        'Looking for a senior React developer to build a comprehensive analytics dashboard. Charts, filters, real-time data updates.',
      pricingType: PricingType.HOURLY,
      hourlyRateMin: 50,
      hourlyRateMax: 75,
      stage: ProjectStage.SCRIPTED,
      coverLetter:
        "Hi! We specialize in building beautiful, high-performance React dashboards. Our team has delivered 20+ analytics platforms for SaaS companies, and we'd love to bring that expertise to your project. We use Recharts/Victory for visualizations and TanStack Query for real-time data management.",
      videoScript:
        'Open with: Show our portfolio dashboard. Key points: 1) Team expertise in React/TypeScript 2) Examples of analytics dashboards we built 3) Our process: discovery → wireframe → build → iterate. Close with: Offer a free 30min consultation call.',
      organizationId: orgId,
      nicheId: niches['niche-web'].id,
      teamId,
      discoveredById: users['user-bidder2'].id,
      lastEditedById: users['user-bidder'].id,
    },
    // Stage: UNDER_REVIEW
    {
      id: 'proj-3',
      title: 'Flutter Mobile App for Fitness Tracking',
      jobUrl: 'https://www.upwork.com/jobs/~01ghi789',
      jobDescription:
        'Need a cross-platform mobile app for iOS and Android. Features: workout logging, nutrition tracking, progress charts, social sharing.',
      pricingType: PricingType.FIXED,
      fixedPrice: 12000,
      stage: ProjectStage.UNDER_REVIEW,
      coverLetter:
        "Your fitness app concept is exactly the kind of project we excel at. We've built 8 Flutter apps in the health/fitness space, including [App Name] which hit 10k downloads in its first month. We'll deliver a polished, performant app on time.",
      videoScript:
        'Demo our existing Flutter fitness app. Highlight: smooth animations, offline mode, BLE device integration. Show our development timeline approach.',
      organizationId: orgId,
      nicheId: niches['niche-app'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
      lastEditedById: users['user-bidder'].id,
    },
    // Stage: ASSIGNED
    {
      id: 'proj-4',
      title: 'AWS Infrastructure Setup & CI/CD Pipeline',
      jobUrl: 'https://www.upwork.com/jobs/~01jkl012',
      jobDescription:
        'Startup needs AWS infrastructure from scratch: ECS, RDS, S3, CloudFront. Must include GitHub Actions CI/CD, monitoring with Datadog.',
      pricingType: PricingType.FIXED,
      fixedPrice: 5500,
      stage: ProjectStage.ASSIGNED,
      coverLetter:
        "We're AWS-certified architects who have set up infrastructure for 30+ startups. We'll have your full stack deployed, monitored, and auto-scaling within 2 weeks. We include thorough documentation and a handover call.",
      videoScript:
        'Walk through our AWS architecture diagram. Show a live deployment pipeline. Emphasize: security best practices, cost optimization, disaster recovery.',
      organizationId: orgId,
      nicheId: niches['niche-devops'].id,
      teamId,
      discoveredById: users['user-bidder2'].id,
      lastEditedById: users['user-bidder2'].id,
      assignedCloserId: users['user-closer'].id,
    },
    // Stage: BID_SUBMITTED
    {
      id: 'proj-5',
      title: 'N8N Automation Workflow for Lead Generation',
      jobUrl: 'https://www.upwork.com/jobs/~01mno345',
      jobDescription:
        'We want to automate our entire lead gen funnel using N8N: LinkedIn scraping, email enrichment, CRM sync, follow-up sequences.',
      pricingType: PricingType.HOURLY,
      hourlyRateMin: 45,
      hourlyRateMax: 60,
      stage: ProjectStage.BID_SUBMITTED,
      coverLetter:
        "N8N automation is our bread and butter. We've built over 50 automation workflows for agencies and SaaS companies. Your lead gen funnel will be fully automated within 1 week, saving your team 20+ hours per week.",
      videoScript:
        "Show live N8N workflow demo. Demonstrate LinkedIn → Email enrichment → CRM sync flow. Show the client's specific use case scenario.",
      upworkAccount: 'AOP Agency Pro',
      bidAmount: 2400,
      bidSubmittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-ai'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
      lastEditedById: users['user-bidder'].id,
      assignedCloserId: users['user-closer2'].id,
    },
    // Stage: VIEWED
    {
      id: 'proj-6',
      title: 'Next.js E-Commerce Platform with Shopify Integration',
      jobUrl: 'https://www.upwork.com/jobs/~01pqr678',
      jobDescription:
        'Custom Next.js storefront with headless Shopify backend. Need SSR, fast checkout, custom product configurator.',
      pricingType: PricingType.FIXED,
      fixedPrice: 9500,
      stage: ProjectStage.VIEWED,
      coverLetter:
        'We build headless Shopify storefronts that convert. Our last e-commerce project increased conversion rate by 34%. We use Next.js 14 with App Router, Tailwind, and Shopify Storefront API.',
      upworkAccount: 'AOP Agency Pro',
      bidAmount: 9500,
      bidSubmittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-web'].id,
      teamId,
      discoveredById: users['user-bidder2'].id,
      lastEditedById: users['user-bidder2'].id,
      assignedCloserId: users['user-closer'].id,
    },
    // Stage: MESSAGED
    {
      id: 'proj-7',
      title: 'Python Data Pipeline & BI Dashboard',
      jobUrl: 'https://www.upwork.com/jobs/~01stu901',
      jobDescription:
        'Need a data engineer to build ETL pipelines from 5 data sources into a central warehouse (Snowflake). Plus a Metabase/Superset dashboard.',
      pricingType: PricingType.HOURLY,
      hourlyRateMin: 55,
      hourlyRateMax: 80,
      stage: ProjectStage.MESSAGED,
      upworkAccount: 'AOP Data Team',
      bidAmount: 6000,
      bidSubmittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-web'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
      assignedCloserId: users['user-closer2'].id,
    },
    // Stage: INTERVIEW
    {
      id: 'proj-8',
      title: 'OpenAI-Powered Document Processing System',
      jobUrl: 'https://www.upwork.com/jobs/~01vwx234',
      jobDescription:
        'Legal tech startup needs AI system to extract structured data from contracts, invoices, court filings. Must handle PDFs, images, handwriting.',
      pricingType: PricingType.FIXED,
      fixedPrice: 15000,
      stage: ProjectStage.INTERVIEW,
      upworkAccount: 'AOP Agency Pro',
      bidAmount: 14500,
      bidSubmittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-ai'].id,
      teamId,
      discoveredById: users['user-bidder2'].id,
      assignedCloserId: users['user-closer'].id,
    },
    // Stage: WON
    {
      id: 'proj-9',
      title: 'SaaS Subscription Management Platform',
      jobUrl: 'https://www.upwork.com/jobs/~01yza567',
      jobDescription:
        'Build full subscription management system: billing (Stripe), usage tracking, plan upgrades/downgrades, customer portal.',
      pricingType: PricingType.FIXED,
      fixedPrice: 18000,
      stage: ProjectStage.WON,
      upworkAccount: 'AOP Agency Pro',
      bidAmount: 17500,
      bidSubmittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      clientName: 'TechScale Inc.',
      clientNotes:
        'Very responsive client. Prefers async communication via Slack. Has existing codebase in Next.js + NestJS. Weekly check-in calls on Fridays.',
      contractValue: 18000,
      organizationId: orgId,
      nicheId: niches['niche-web'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
      assignedCloserId: users['user-closer'].id,
      assignedPMId: users['user-pm'].id,
    },
    // Stage: IN_PROGRESS
    {
      id: 'proj-10',
      title: 'Kubernetes Migration for Monolith App',
      jobUrl: 'https://www.upwork.com/jobs/~01bcd890',
      jobDescription:
        'Migrate legacy Node.js monolith to microservices on Kubernetes (EKS). 8 services total, zero-downtime migration required.',
      pricingType: PricingType.HOURLY,
      hourlyRateMin: 70,
      hourlyRateMax: 90,
      stage: ProjectStage.IN_PROGRESS,
      upworkAccount: 'AOP DevOps',
      bidAmount: 22000,
      bidSubmittedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      clientName: 'CloudFirst Systems',
      clientNotes:
        'Enterprise client — requires SOC2 compliance, all code to be reviewed by their security team. PM is their CTO directly.',
      contractValue: 22000,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-devops'].id,
      teamId,
      discoveredById: users['user-bidder2'].id,
      assignedCloserId: users['user-closer2'].id,
      assignedPMId: users['user-pm'].id,
    },
    // Stage: COMPLETED
    {
      id: 'proj-11',
      title: 'WhatsApp Business API Integration',
      pricingType: PricingType.FIXED,
      fixedPrice: 3500,
      stage: ProjectStage.COMPLETED,
      clientName: 'RetailMax Ltd.',
      contractValue: 3500,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      organizationId: orgId,
      nicheId: niches['niche-ai'].id,
      teamId,
      discoveredById: users['user-bidder'].id,
      assignedCloserId: users['user-closer'].id,
      assignedPMId: users['user-pm'].id,
    },
    // Stage: LOST
    {
      id: 'proj-12',
      title: 'Unity Game Development — Casual Mobile Game',
      jobUrl: 'https://www.upwork.com/jobs/~01efg123',
      pricingType: PricingType.FIXED,
      fixedPrice: 25000,
      stage: ProjectStage.LOST,
      upworkAccount: 'AOP Agency Pro',
      bidAmount: 24000,
      organizationId: orgId,
      teamId,
      discoveredById: users['user-bidder2'].id,
      assignedCloserId: users['user-closer2'].id,
    },
    // Stage: CANCELLED
    {
      id: 'proj-13',
      title: 'Blockchain NFT Marketplace',
      jobUrl: 'https://www.upwork.com/jobs/~01hij456',
      pricingType: PricingType.FIXED,
      fixedPrice: 35000,
      stage: ProjectStage.CANCELLED,
      organizationId: orgId,
      teamId,
      discoveredById: users['user-bidder'].id,
    },
  ];

  for (const p of projectDefs) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  console.log(`  Projects seeded: ${projectDefs.length} across all pipeline stages.`);

  // Seed meetings for interview-stage and beyond
  await seedMeetings(users, orgs);

  // Seed tasks for in-progress projects
  await seedTasks(users);

  // Seed milestones for won/in-progress projects
  await seedMilestones();
}

// -------------------------------------------------------
// Meetings
// -------------------------------------------------------
async function seedMeetings(
  users: Record<string, { id: string }>,
  _orgs: Record<string, { id: string }>,
) {
  const meetingDefs = [
    {
      id: 'meet-1',
      projectId: 'proj-8', // INTERVIEW stage
      closerId: users['user-closer'].id,
      type: MeetingType.INTERVIEW,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: MeetingStatus.SCHEDULED,
      notes:
        'Client wants to see a live demo of our document processing. Prepare 3 example contracts.',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 'meet-2',
      projectId: 'proj-10', // IN_PROGRESS
      closerId: users['user-closer2'].id,
      type: MeetingType.CLIENT_CHECKIN,
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: MeetingStatus.COMPLETED,
      notes:
        'Sprint 1 review. Client happy with service decomposition progress. Requested adding rate limiting to API gateway.',
      meetingUrl: 'https://zoom.us/j/123456789',
      fathomUrl: 'https://fathom.video/share/abc123',
      loomUrl: 'https://loom.com/share/def456',
    },
    {
      id: 'meet-3',
      projectId: 'proj-10', // IN_PROGRESS — upcoming
      closerId: users['user-closer2'].id,
      type: MeetingType.CLIENT_CHECKIN,
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: MeetingStatus.SCHEDULED,
      notes: 'Sprint 2 review. Need to demo the auth service and user service migration.',
      meetingUrl: 'https://zoom.us/j/987654321',
    },
    {
      id: 'meet-4',
      projectId: 'proj-9', // WON — kickoff
      closerId: users['user-closer'].id,
      type: MeetingType.CLIENT_CHECKIN,
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: MeetingStatus.SCHEDULED,
      notes: 'Project kickoff call. Go over requirements, timeline, Slack channel setup.',
      meetingUrl: 'https://meet.google.com/xyz-uvwx-yz',
    },
  ];

  for (const m of meetingDefs) {
    await prisma.meeting.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }

  console.log('  Meetings seeded:', meetingDefs.length);
}

// -------------------------------------------------------
// Tasks (PM creates for operators)
// -------------------------------------------------------
async function seedTasks(users: Record<string, { id: string }>) {
  const taskDefs = [
    // proj-10 (IN_PROGRESS — K8s migration)
    {
      id: 'task-1',
      projectId: 'proj-10',
      assigneeId: users['user-operator'].id,
      title: 'Containerize auth service with Docker',
      description:
        'Create Dockerfile, docker-compose for local dev, and push to ECR. Follow the monorepo structure.',
      status: TaskStatus.DONE,
      priority: 1,
      estimatedHours: 8,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'task-2',
      projectId: 'proj-10',
      assigneeId: users['user-operator'].id,
      title: 'Containerize user service with Docker',
      description:
        'Create Dockerfile for user service. Ensure DB connection pooling config works in container env.',
      status: TaskStatus.IN_REVIEW,
      priority: 1,
      estimatedHours: 6,
    },
    {
      id: 'task-3',
      projectId: 'proj-10',
      assigneeId: users['user-operator2'].id,
      title: 'Write K8s manifests for auth + user services',
      description: 'Deployments, Services, ConfigMaps, Secrets (sealed). Include HPA configs.',
      status: TaskStatus.IN_PROGRESS,
      priority: 2,
      estimatedHours: 10,
    },
    {
      id: 'task-4',
      projectId: 'proj-10',
      assigneeId: users['user-operator2'].id,
      title: 'Set up GitHub Actions CI/CD pipeline',
      description:
        'Build + test + deploy pipeline. Trigger on PR merge to main. Deploy to staging first, then prod with manual approval.',
      status: TaskStatus.TODO,
      priority: 2,
      estimatedHours: 12,
    },
    {
      id: 'task-5',
      projectId: 'proj-10',
      assigneeId: users['user-operator'].id,
      title: 'Configure Datadog APM for all services',
      description:
        'Install dd-trace in each service, set up dashboards, create alerts for p99 latency > 500ms.',
      status: TaskStatus.TODO,
      priority: 3,
      estimatedHours: 8,
    },
    // proj-9 (WON — just starting)
    {
      id: 'task-6',
      projectId: 'proj-9',
      assigneeId: users['user-operator'].id,
      title: 'Set up Next.js project with Stripe integration',
      description:
        'Initialize project, install Stripe SDK, set up webhooks endpoint, configure products/prices in Stripe dashboard.',
      status: TaskStatus.TODO,
      priority: 1,
      estimatedHours: 8,
    },
    {
      id: 'task-7',
      projectId: 'proj-9',
      assigneeId: users['user-operator2'].id,
      title: 'Build subscription management backend',
      description:
        'NestJS service for subscription CRUD, plan changes, usage tracking. Integrate with Stripe Customer Portal.',
      status: TaskStatus.TODO,
      priority: 1,
      estimatedHours: 16,
    },
  ];

  for (const t of taskDefs) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  console.log('  Tasks seeded:', taskDefs.length);

  // QA review for the completed task
  await prisma.qAReview.upsert({
    where: { taskId: 'task-1' },
    update: {},
    create: {
      taskId: 'task-1',
      reviewerId: users['user-qa'].id,
      status: 'APPROVED',
      score: 9,
      comments:
        'Clean Dockerfile, proper multi-stage build. Image size is optimal. Security scan passed.',
    },
  });

  console.log('  QA reviews seeded.');
}

// -------------------------------------------------------
// Milestones
// -------------------------------------------------------
async function seedMilestones() {
  const milestoneDefs = [
    // proj-10 milestones
    {
      id: 'ms-1',
      projectId: 'proj-10',
      name: 'Phase 1: Service Containerization',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      amount: 7333,
      completed: false,
    },
    {
      id: 'ms-2',
      projectId: 'proj-10',
      name: 'Phase 2: K8s Deployment & CI/CD',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      amount: 7333,
      completed: false,
    },
    {
      id: 'ms-3',
      projectId: 'proj-10',
      name: 'Phase 3: Monitoring & Cutover',
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      amount: 7334,
      completed: false,
    },
    // proj-9 milestones
    {
      id: 'ms-4',
      projectId: 'proj-9',
      name: 'Billing & Subscription Core',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      amount: 9000,
      completed: false,
    },
    {
      id: 'ms-5',
      projectId: 'proj-9',
      name: 'Customer Portal & Final Delivery',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: 9000,
      completed: false,
    },
    // proj-11 (completed)
    {
      id: 'ms-6',
      projectId: 'proj-11',
      name: 'WhatsApp API Integration Delivery',
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      amount: 3500,
      completed: true,
    },
  ];

  for (const m of milestoneDefs) {
    await prisma.milestone.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }

  console.log('  Milestones seeded:', milestoneDefs.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
