'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useProject,
  useUpdateProject,
  useProjectLinks,
  useCreateProjectLink,
  useDeleteProjectLink,
  useMilestones,
  useCreateMilestone,
  useCompleteMilestone,
} from '@/hooks/use-projects';
import { useProjectTasks, useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useMeetings, useCreateMeeting } from '@/hooks/use-meetings';
import { useUsers } from '@/hooks/use-users';
import { useAuthContext } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  Globe,
  Github,
  Link2,
  Trash2,
  Save,
  ListTodo,
  Video,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Target,
  BookOpen,
  Server,
  FileCode,
  LinkIcon,
} from 'lucide-react';
import type { Project, Task, Meeting, ProjectLink, Milestone } from '@/types';
import {
  ProjectStage,
  PricingType,
  TaskStatus,
  ProjectLinkType,
  MeetingStatus,
  MeetingType,
  ChatSenderType,
} from '@/types';

// ── Stage display helpers ────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  [ProjectStage.DISCOVERED]: 'Discovered',
  [ProjectStage.SCRIPTED]: 'Scripted',
  [ProjectStage.SCRIPT_REVIEW]: 'Script Review',
  [ProjectStage.VIDEO_DRAFT]: 'Video Draft',
  [ProjectStage.UNDER_REVIEW]: 'Video Review',
  [ProjectStage.ASSIGNED]: 'Assigned',
  [ProjectStage.BID_SUBMITTED]: 'Bid Submitted',
  [ProjectStage.VIEWED]: 'Viewed',
  [ProjectStage.MESSAGED]: 'Messaged',
  [ProjectStage.INTERVIEW]: 'Interview',
  [ProjectStage.WON]: 'Won',
  [ProjectStage.IN_PROGRESS]: 'In Progress',
  [ProjectStage.COMPLETED]: 'Completed',
  [ProjectStage.LOST]: 'Lost',
  [ProjectStage.CANCELLED]: 'Cancelled',
};

const STAGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  DISCOVERED: 'secondary',
  SCRIPTED: 'default',
  SCRIPT_REVIEW: 'warning',
  VIDEO_DRAFT: 'default',
  UNDER_REVIEW: 'warning',
  ASSIGNED: 'outline',
  BID_SUBMITTED: 'warning',
  VIEWED: 'default',
  MESSAGED: 'default',
  INTERVIEW: 'default',
  WON: 'success',
  IN_PROGRESS: 'success',
  COMPLETED: 'success',
  LOST: 'destructive',
  CANCELLED: 'secondary',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.FINALISED]: 'Finalised',
};

const TASK_STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.BLOCKED,
  TaskStatus.DONE,
  TaskStatus.FINALISED,
];

const MEETING_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  SCHEDULED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'secondary',
  NO_SHOW: 'destructive',
};

const LINK_TYPE_OPTIONS = [
  { value: ProjectLinkType.GITHUB, label: 'GitHub' },
  { value: ProjectLinkType.VERCEL, label: 'Vercel' },
  { value: ProjectLinkType.STAGING, label: 'Staging' },
  { value: ProjectLinkType.DOCS, label: 'Docs' },
  { value: ProjectLinkType.OTHER, label: 'Other' },
];

const LINK_TYPE_ICONS: Record<string, React.ReactNode> = {
  [ProjectLinkType.GITHUB]: <Github className="h-4 w-4 text-muted-foreground shrink-0" />,
  [ProjectLinkType.VERCEL]: <Globe className="h-4 w-4 text-muted-foreground shrink-0" />,
  [ProjectLinkType.STAGING]: <Server className="h-4 w-4 text-muted-foreground shrink-0" />,
  [ProjectLinkType.DOCS]: <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />,
  [ProjectLinkType.OTHER]: <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />,
};

const LINK_TYPE_LABELS: Record<string, string> = {
  [ProjectLinkType.GITHUB]: 'GitHub',
  [ProjectLinkType.VERCEL]: 'Vercel',
  [ProjectLinkType.STAGING]: 'Staging',
  [ProjectLinkType.DOCS]: 'Documentation',
  [ProjectLinkType.OTHER]: 'Other',
};

// ── Role helpers ─────────────────────────────────────────────────────────────

function canManageTasks(role: string) {
  return ['admin', 'project_manager', 'operator'].includes(role);
}

function canEditNotes(role: string) {
  return ['admin', 'closer', 'project_manager'].includes(role);
}

function canEditDevNotes(role: string) {
  return ['admin', 'developer', 'project_manager'].includes(role);
}

function canManageLinks(role: string) {
  return ['admin', 'project_manager', 'developer'].includes(role);
}

function canManageMilestones(role: string) {
  return ['admin', 'project_manager'].includes(role);
}

function canScheduleMeetings(role: string) {
  return ['admin', 'project_manager', 'closer'].includes(role);
}

// ── Formatting helpers ───────────────────────────────────────────────────────

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatUserName(
  u?: { firstName?: string | null; lastName?: string | null; email: string } | null,
) {
  if (!u) return '\u2014';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email;
}

function formatDate(d?: string | null) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(d?: string | null) {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPricing(project: Project) {
  if (project.pricingType === PricingType.HOURLY) {
    const min = project.hourlyRateMin;
    const max = project.hourlyRateMax;
    if (min && max) return `Hourly \u00b7 $${min}\u2013$${max}/hr`;
    if (min) return `Hourly \u00b7 $${min}+/hr`;
    if (max) return `Hourly \u00b7 up to $${max}/hr`;
    return 'Hourly';
  }
  if (project.fixedPrice) return `Fixed \u00b7 $${project.fixedPrice.toLocaleString()}`;
  return 'Fixed';
}

// ── Glass Card wrapper ───────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 ${className}`}
    >
      {children}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthContext();
  const role = user?.role?.toLowerCase() ?? '';

  // Data fetching
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasks } = useProjectTasks(id);
  const { data: meetingsData } = useMeetings({ projectId: id, limit: 50 });
  const { data: links } = useProjectLinks(id);
  const { data: milestonesData } = useMilestones(id);
  const { data: usersData } = useUsers({ limit: 200 });

  // Mutations
  const updateProject = useUpdateProject();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createLink = useCreateProjectLink();
  const deleteLink = useDeleteProjectLink();
  const createMilestone = useCreateMilestone();
  const completeMilestone = useCompleteMilestone();
  const createMeeting = useCreateMeeting();

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(5);
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');

  // Link form state
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<string>(ProjectLinkType.OTHER);

  // Notes editing state (closer notes)
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  // Developer notes editing state
  const [editingDevNotes, setEditingDevNotes] = useState(false);
  const [devNotesValue, setDevNotesValue] = useState('');

  // Milestone form state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');

  // Meeting form state
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [newMeetingScheduledAt, setNewMeetingScheduledAt] = useState('');
  const [newMeetingType, setNewMeetingType] = useState<string>(MeetingType.INTERVIEW);
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [newMeetingUrl, setNewMeetingUrl] = useState('');

  const meetings = meetingsData?.data ?? [];
  const milestones = milestonesData ?? [];
  const allUsers = usersData?.data ?? [];
  const developerUsers = allUsers.filter((u) =>
    ['developer', 'operator'].includes(u.role?.name?.toLowerCase() ?? ''),
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (projectLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-lg">Project not found</p>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const chatMessages = project.chatMessages ?? [];
  const isOngoing = !project.endDate;

  // Financial computations
  const allTasks = tasks ?? [];
  const doneTasks = allTasks.filter(
    (t) => t.status === TaskStatus.DONE || t.status === TaskStatus.FINALISED,
  );
  const totalHoursBilled = doneTasks.reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0);
  const currentEarnings =
    project.pricingType === PricingType.HOURLY
      ? totalHoursBilled * (project.hourlyRateMin ?? 0)
      : (project.contractValue ?? project.fixedPrice ?? 0);
  const milestonePaymentsAchieved = milestones
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + (m.amount ?? 0), 0);
  const taskCompletionPct =
    allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;

  // Group links by type
  const linksByType = (links ?? []).reduce(
    (acc, link) => {
      const type = link.type || ProjectLinkType.OTHER;
      if (!acc[type]) acc[type] = [];
      acc[type].push(link);
      return acc;
    },
    {} as Record<string, ProjectLink[]>,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    createTask.mutate(
      {
        projectId: id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
        isUrgent: newTaskUrgent,
        assigneeId: newTaskAssigneeId || undefined,
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setNewTaskDescription('');
          setNewTaskPriority(5);
          setNewTaskUrgent(false);
          setNewTaskAssigneeId('');
          setShowTaskForm(false);
        },
      },
    );
  }

  function handleCreateLink() {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    createLink.mutate(
      {
        projectId: id,
        label: newLinkLabel.trim(),
        url: newLinkUrl.trim(),
        type: newLinkType,
      },
      {
        onSuccess: () => {
          setNewLinkLabel('');
          setNewLinkUrl('');
          setNewLinkType(ProjectLinkType.OTHER);
          setShowLinkForm(false);
        },
      },
    );
  }

  function handleSaveNotes() {
    updateProject.mutate(
      { id, clientNotes: notesValue },
      { onSuccess: () => setEditingNotes(false) },
    );
  }

  function handleSaveDevNotes() {
    updateProject.mutate(
      { id, developerNotes: devNotesValue },
      { onSuccess: () => setEditingDevNotes(false) },
    );
  }

  function handleTaskStatusChange(taskId: string, status: TaskStatus) {
    updateTask.mutate({ id: taskId, status });
  }

  function handleCreateMilestone() {
    if (!newMilestoneName.trim()) return;
    createMilestone.mutate(
      {
        projectId: id,
        name: newMilestoneName.trim(),
        dueDate: newMilestoneDueDate || undefined,
        amount: newMilestoneAmount ? Number(newMilestoneAmount) : undefined,
      },
      {
        onSuccess: () => {
          setNewMilestoneName('');
          setNewMilestoneDueDate('');
          setNewMilestoneAmount('');
          setShowMilestoneForm(false);
        },
      },
    );
  }

  function handleCompleteMilestone(milestoneId: string) {
    completeMilestone.mutate({ projectId: id, id: milestoneId });
  }

  function handleCreateMeeting() {
    if (!newMeetingScheduledAt) return;
    createMeeting.mutate(
      {
        projectId: id,
        scheduledAt: new Date(newMeetingScheduledAt).toISOString(),
        type: newMeetingType as MeetingType,
        notes: newMeetingNotes.trim() || undefined,
        meetingUrl: newMeetingUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewMeetingScheduledAt('');
          setNewMeetingType(MeetingType.INTERVIEW);
          setNewMeetingNotes('');
          setNewMeetingUrl('');
          setShowMeetingForm(false);
        },
      },
    );
  }

  // ── Group tasks by status ──────────────────────────────────────────────────

  const tasksByStatus = TASK_STATUS_ORDER.reduce(
    (acc, status) => {
      const filtered = allTasks.filter((t) => t.status === status);
      if (filtered.length > 0) acc[status] = filtered;
      return acc;
    },
    {} as Record<TaskStatus, Task[]>,
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Back button */}
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Header section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{project.title}</h1>
          <Badge variant={STAGE_VARIANT[project.stage] ?? 'outline'}>
            {STAGE_LABELS[project.stage] ?? project.stage}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {project.clientName && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {project.clientName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            {formatPricing(project)}
          </span>
          <Badge variant={isOngoing ? 'warning' : 'outline'} className="text-xs">
            {isOngoing ? 'Ongoing' : `Ends ${formatDate(project.endDate)}`}
          </Badge>
          {project.startDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Started {formatDate(project.startDate)}
            </span>
          )}
        </div>
      </div>

      <Separator />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Tasks Section ─────────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Tasks</h2>
                <Badge variant="secondary" className="text-xs">
                  {allTasks.length}
                </Badge>
              </div>
              {canManageTasks(role) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
              )}
            </div>

            {/* Inline add task form */}
            {showTaskForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div>
                  <Label htmlFor="task-title" className="text-sm">
                    Title *
                  </Label>
                  <Input
                    id="task-title"
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="task-desc" className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="task-desc"
                    placeholder="Optional description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="task-priority" className="text-sm">
                      Priority (0-10)
                    </Label>
                    <Input
                      id="task-priority"
                      type="number"
                      min={0}
                      max={10}
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                      className="mt-1 w-20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-assignee" className="text-sm">
                      Assignee
                    </Label>
                    <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                      <SelectTrigger id="task-assignee" className="mt-1 h-9 w-[180px]">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {developerUsers.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {formatUserName(u)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={newTaskUrgent}
                      onChange={(e) => setNewTaskUrgent(e.target.checked)}
                      className="rounded border-border"
                    />
                    Urgent
                  </label>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="ghost" onClick={() => setShowTaskForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateTask}
                      disabled={!newTaskTitle.trim() || createTask.isPending}
                    >
                      {createTask.isPending ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Task list grouped by status */}
            {allTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet</p>
            ) : (
              <div className="space-y-4">
                {TASK_STATUS_ORDER.map((status) => {
                  const group = tasksByStatus[status];
                  if (!group) return null;
                  return (
                    <div key={status}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {TASK_STATUS_LABELS[status]} ({group.length})
                      </h3>
                      <div className="space-y-1.5">
                        {group.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/50 px-3 py-2"
                          >
                            {task.isUrgent && (
                              <span
                                className="h-2 w-2 rounded-full bg-red-500 shrink-0"
                                title="Urgent"
                              />
                            )}
                            <span className="text-sm font-medium flex-1 min-w-0 truncate">
                              {task.title}
                            </span>
                            {task.assignee && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {formatUserName(task.assignee)}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                task.priority >= 8
                                  ? 'destructive'
                                  : task.priority >= 5
                                    ? 'warning'
                                    : 'secondary'
                              }
                              className="text-xs shrink-0"
                            >
                              P{task.priority}
                            </Badge>
                            {canManageTasks(role) ? (
                              <Select
                                value={task.status}
                                onValueChange={(v) =>
                                  handleTaskStatusChange(task.id, v as TaskStatus)
                                }
                              >
                                <SelectTrigger className="h-7 w-[120px] text-xs shrink-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TASK_STATUS_ORDER.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs">
                                      {TASK_STATUS_LABELS[s]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {TASK_STATUS_LABELS[task.status]}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ── Milestones Section ────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Milestones</h2>
                <Badge variant="secondary" className="text-xs">
                  {milestones.length}
                </Badge>
              </div>
              {canManageMilestones(role) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Milestone
                </Button>
              )}
            </div>

            {/* Progress bar */}
            {milestones.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {completedMilestones} of {milestones.length} completed
                  </span>
                  <span>
                    {Math.round(
                      milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{
                      width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Inline add milestone form */}
            {showMilestoneForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div>
                  <Label htmlFor="milestone-name" className="text-sm">
                    Name *
                  </Label>
                  <Input
                    id="milestone-name"
                    placeholder="Milestone name"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="milestone-due" className="text-sm">
                      Due Date
                    </Label>
                    <Input
                      id="milestone-due"
                      type="date"
                      value={newMilestoneDueDate}
                      onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                      className="mt-1 w-[160px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="milestone-amount" className="text-sm">
                      Amount ($)
                    </Label>
                    <Input
                      id="milestone-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={newMilestoneAmount}
                      onChange={(e) => setNewMilestoneAmount(e.target.value)}
                      className="mt-1 w-[120px]"
                    />
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" variant="ghost" onClick={() => setShowMilestoneForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateMilestone}
                      disabled={!newMilestoneName.trim() || createMilestone.isPending}
                    >
                      {createMilestone.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone list */}
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No milestones yet</p>
            ) : (
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                      milestone.completed
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-border/40 bg-background/50'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium flex-1 min-w-0 truncate ${
                        milestone.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {milestone.name}
                    </span>
                    {milestone.dueDate && (
                      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(milestone.dueDate)}
                      </span>
                    )}
                    {milestone.amount != null && milestone.amount > 0 && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {currencyFormatter.format(milestone.amount)}
                      </Badge>
                    )}
                    {!milestone.completed && canManageMilestones(role) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs shrink-0"
                        onClick={() => handleCompleteMilestone(milestone.id)}
                        disabled={completeMilestone.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Meetings Section ──────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Meetings</h2>
                <Badge variant="secondary" className="text-xs">
                  {meetings.length}
                </Badge>
              </div>
              {canScheduleMeetings(role) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setShowMeetingForm(!showMeetingForm)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule Meeting
                </Button>
              )}
            </div>

            {/* Inline schedule meeting form */}
            {showMeetingForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="meeting-date" className="text-sm">
                      Scheduled At *
                    </Label>
                    <Input
                      id="meeting-date"
                      type="datetime-local"
                      value={newMeetingScheduledAt}
                      onChange={(e) => setNewMeetingScheduledAt(e.target.value)}
                      className="mt-1 w-[220px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting-type" className="text-sm">
                      Type
                    </Label>
                    <Select value={newMeetingType} onValueChange={setNewMeetingType}>
                      <SelectTrigger id="meeting-type" className="mt-1 h-9 w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MeetingType.INTERVIEW}>Interview</SelectItem>
                        <SelectItem value={MeetingType.CLIENT_CHECKIN}>Client Check-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="meeting-url" className="text-sm">
                    Meeting URL
                  </Label>
                  <Input
                    id="meeting-url"
                    placeholder="https://..."
                    value={newMeetingUrl}
                    onChange={(e) => setNewMeetingUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="meeting-notes" className="text-sm">
                    Notes
                  </Label>
                  <Textarea
                    id="meeting-notes"
                    placeholder="Optional meeting notes"
                    value={newMeetingNotes}
                    onChange={(e) => setNewMeetingNotes(e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowMeetingForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateMeeting}
                    disabled={!newMeetingScheduledAt || createMeeting.isPending}
                  >
                    {createMeeting.isPending ? 'Scheduling...' : 'Schedule'}
                  </Button>
                </div>
              </div>
            )}

            {meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No meetings scheduled
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Closer
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Notes
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recordings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...meetings]
                      .sort(
                        (a, b) =>
                          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
                      )
                      .map((meeting) => (
                        <tr key={meeting.id} className="border-b border-border/30 last:border-b-0">
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            {formatDateTime(meeting.scheduledAt)}
                          </td>
                          <td className="py-2.5 px-2">
                            <Badge variant="outline" className="text-xs">
                              {meeting.type === MeetingType.INTERVIEW
                                ? 'Interview'
                                : 'Client Check-in'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-2">
                            <Badge
                              variant={MEETING_STATUS_VARIANT[meeting.status] ?? 'outline'}
                              className="text-xs"
                            >
                              {meeting.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-2 text-muted-foreground">
                            {formatUserName(meeting.closer)}
                          </td>
                          <td className="py-2.5 px-2 text-muted-foreground max-w-xs">
                            {meeting.notes || '\u2014'}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex flex-wrap gap-1.5">
                              {meeting.meetingUrl && (
                                <a
                                  href={meeting.meetingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Badge variant="default" className="text-xs gap-1 cursor-pointer">
                                    <ExternalLink className="h-3 w-3" />
                                    Meeting Link
                                  </Badge>
                                </a>
                              )}
                              {meeting.fathomUrl && (
                                <a
                                  href={meeting.fathomUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Badge variant="default" className="text-xs gap-1 cursor-pointer">
                                    <ExternalLink className="h-3 w-3" />
                                    Fathom
                                  </Badge>
                                </a>
                              )}
                              {meeting.loomUrl && (
                                <a href={meeting.loomUrl} target="_blank" rel="noopener noreferrer">
                                  <Badge variant="default" className="text-xs gap-1 cursor-pointer">
                                    <ExternalLink className="h-3 w-3" />
                                    Loom
                                  </Badge>
                                </a>
                              )}
                              {meeting.driveUrl && (
                                <a
                                  href={meeting.driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Badge variant="default" className="text-xs gap-1 cursor-pointer">
                                    <ExternalLink className="h-3 w-3" />
                                    Drive
                                  </Badge>
                                </a>
                              )}
                              {!meeting.meetingUrl &&
                                !meeting.fathomUrl &&
                                !meeting.loomUrl &&
                                !meeting.driveUrl && (
                                  <span className="text-xs text-muted-foreground">{'\u2014'}</span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          {/* ── Enhanced Financial Dashboard ──────────────────────────────── */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Financial Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-border/40 bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Hours Billed
                </p>
                <p className="text-xl font-bold mt-1">{totalHoursBilled.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Current Earnings
                </p>
                <p className="text-xl font-bold mt-1">
                  {currencyFormatter.format(currentEarnings)}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Milestones Paid
                </p>
                <p className="text-xl font-bold mt-1">
                  {currencyFormatter.format(milestonePaymentsAchieved)}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Task Completion
                </p>
                <p className="text-xl font-bold mt-1">{taskCompletionPct}%</p>
              </div>
            </div>
            <Separator className="mb-3" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Value</span>
                <span className="font-medium">
                  {project.contractValue
                    ? `${currencyFormatter.format(project.contractValue)} ${project.contractCurrency ?? 'USD'}`
                    : 'Not set'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pricing</span>
                <span className="font-medium">{formatPricing(project)}</span>
              </div>
              {milestones.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milestones</span>
                    <span className="font-medium">
                      {completedMilestones} / {milestones.length} completed
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* ── Links & Resources (grouped by type) ──────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Links & Resources</h2>
              </div>
              {canManageLinks(role) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setShowLinkForm(!showLinkForm)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              )}
            </div>

            {showLinkForm && (
              <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <Input
                  placeholder="Label"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                />
                <Input
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
                <Select value={newLinkType} onValueChange={setNewLinkType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowLinkForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateLink}
                    disabled={!newLinkLabel.trim() || !newLinkUrl.trim() || createLink.isPending}
                  >
                    {createLink.isPending ? 'Adding...' : 'Add Link'}
                  </Button>
                </div>
              </div>
            )}

            {(links ?? []).length === 0 && !showLinkForm ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No links added</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(linksByType).map(([type, groupLinks]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-2">
                      {LINK_TYPE_ICONS[type] ?? LINK_TYPE_ICONS[ProjectLinkType.OTHER]}
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {LINK_TYPE_LABELS[type] ?? type}
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {groupLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline truncate flex-1"
                          >
                            {link.label}
                          </a>
                          {canManageLinks(role) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => deleteLink.mutate({ projectId: id, id: link.id })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Closer Notes ──────────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Closer Notes</h2>
              </div>
              {canEditNotes(role) && !editingNotes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNotesValue(project.clientNotes ?? '');
                    setEditingNotes(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={5}
                  placeholder="Add notes about the client or deal..."
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSaveNotes}
                    disabled={updateProject.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {updateProject.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.clientNotes || 'No notes yet'}
              </p>
            )}
          </Card>

          {/* ── Developer Notes ───────────────────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Developer Notes</h2>
              </div>
              {canEditDevNotes(role) && !editingDevNotes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDevNotesValue(project.developerNotes ?? '');
                    setEditingDevNotes(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>

            {editingDevNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={devNotesValue}
                  onChange={(e) => setDevNotesValue(e.target.value)}
                  rows={5}
                  placeholder="Add developer notes, technical details, or implementation notes..."
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingDevNotes(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSaveDevNotes}
                    disabled={updateProject.isPending}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {updateProject.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.developerNotes || 'No developer notes yet'}
              </p>
            )}
          </Card>

          {/* ── Chat Messages ─────────────────────────────────────────────── */}
          {chatMessages.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Chat Messages</h2>
                <Badge variant="secondary" className="text-xs">
                  {chatMessages.length}
                </Badge>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...chatMessages]
                  .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-lg border border-border/40 bg-background/50 p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <Badge
                          variant={msg.senderType === ChatSenderType.CLIENT ? 'warning' : 'success'}
                          className="text-xs"
                        >
                          {msg.senderType}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDateTime(msg.sentAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
