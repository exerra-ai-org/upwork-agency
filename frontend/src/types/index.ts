// ─── Enums (matching Prisma schema) ──────────────────────────────────────────

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  REPLIED = 'REPLIED',
  INTERVIEW = 'INTERVIEW',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum DealStatus {
  NEGOTIATING = 'NEGOTIATING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
}

export enum QAStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_CHANGES = 'NEEDS_CHANGES',
}

export enum AccountPlatform {
  UPWORK = 'UPWORK',
  FREELANCER = 'FREELANCER',
  TOPTAL = 'TOPTAL',
  OTHER = 'OTHER',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roleId: string;
  role?: Role;
  teamId?: string;
  team?: Team;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Freelance / Agent ────────────────────────────────────────────────────────

export interface FreelanceAccount {
  id: string;
  platform: AccountPlatform;
  accountName: string;
  profileUrl?: string;
  status: AccountStatus;
  agents?: Agent[];
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  userId: string;
  user?: User;
  freelanceAccountId: string;
  freelanceAccount?: FreelanceAccount;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  marketplaceId?: string;
  name: string;
  company?: string;
  platform?: AccountPlatform;
  profileUrl?: string;
  country?: string;
  totalSpent?: number;
  hireRate?: number;
  jobsPosted?: number;
  proposals?: Proposal[];
  createdAt: string;
  updatedAt: string;
}

// ─── Scripts ──────────────────────────────────────────────────────────────────

export interface Script {
  id: string;
  name: string;
  category?: string;
  createdById: string;
  createdBy?: User;
  versions?: ScriptVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  content: string;
  version: number;
  createdAt: string;
}

// ─── Proposals ────────────────────────────────────────────────────────────────

export interface Proposal {
  id: string;
  agentId: string;
  agent?: Agent;
  clientId: string;
  client?: Client;
  scriptVersionId?: string;
  scriptVersion?: ScriptVersion;
  jobTitle?: string;
  jobUrl?: string;
  coverLetter?: string;
  bidAmount?: number;
  status: ProposalStatus;
  sentAt?: string;
  replyAt?: string;
  videoProposal?: VideoProposal;
  meeting?: Meeting;
  deal?: Deal;
  createdAt: string;
  updatedAt: string;
}

export interface VideoProposal {
  id: string;
  proposalId: string;
  proposal?: Proposal;
  videoUrl: string;
  storageKey: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export interface Meeting {
  id: string;
  proposalId: string;
  proposal?: Proposal;
  closerId?: string;
  closer?: User;
  scheduledAt: string;
  completedAt?: string;
  status: MeetingStatus;
  notes?: string;
  meetingUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export interface Deal {
  id: string;
  proposalId: string;
  proposal?: Proposal;
  value: number;
  currency: string;
  status: DealStatus;
  closedAt?: string;
  notes?: string;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

// ─── Projects / Milestones ────────────────────────────────────────────────────

export interface Project {
  id: string;
  dealId: string;
  deal?: Deal;
  name?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  milestones?: Milestone[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate?: string;
  amount?: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  projectId: string;
  project?: Project;
  assigneeId?: string;
  assignee?: User;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  estimatedHours?: number;
  completedAt?: string;
  qaReview?: QAReview;
  createdAt: string;
  updatedAt: string;
}

// ─── QA Reviews ───────────────────────────────────────────────────────────────

export interface QAReview {
  id: string;
  taskId: string;
  task?: Task;
  reviewerId: string;
  reviewer?: User;
  status: QAStatus;
  score?: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actor?: User;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Experiments ──────────────────────────────────────────────────────────────

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  hypothesis?: string;
  status: ExperimentStatus;
  targetEntity: string;
  variants: unknown[];
  startDate?: string;
  endDate?: string;
  assignments?: ExperimentAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentAssignment {
  id: string;
  experimentId: string;
  experiment?: Experiment;
  agentId?: string;
  agent?: Agent;
  proposalId?: string;
  proposal?: Proposal;
  variant: string;
  assignedAt: string;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DailyAgentMetric {
  id: string;
  agentId: string;
  date: string;
  proposalsSent: number;
  proposalsViewed: number;
  proposalsReplied: number;
  meetingsBooked: number;
  dealsClosed: number;
  totalDealValue: number;
  videosRecorded: number;
}

export interface DailyAccountMetric {
  id: string;
  accountId: string;
  date: string;
  proposalsSent: number;
  proposalsViewed: number;
  proposalsReplied: number;
  meetingsBooked: number;
  dealsClosed: number;
  totalDealValue: number;
  conversionRate: number;
}

// ─── Generic Response ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
