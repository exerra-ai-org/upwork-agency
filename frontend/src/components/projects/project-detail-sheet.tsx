'use client';

import { useState, useEffect } from 'react';
import {
  useProject,
  useUpdateProject,
  useAdvanceStage,
  useSetStage,
  useAssignProject,
  useMilestones,
  useCreateMilestone,
  useCompleteMilestone,
} from '@/hooks/use-projects';
import { useUsers } from '@/hooks/use-users';
import { useAuthContext } from '@/components/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ExternalLink,
  Save,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  Tag,
  Users,
  FileText,
  Plus,
  Check,
} from 'lucide-react';
import { ProjectStage, PricingType } from '@/types';
import type { Project, Milestone } from '@/types';

// ── Stage display helpers ────────────────────────────────────────────────────

export const STAGE_LABELS: Record<string, string> = {
  [ProjectStage.DISCOVERED]: 'Discovered',
  [ProjectStage.SCRIPTED]: 'Scripted',
  [ProjectStage.UNDER_REVIEW]: 'Under Review',
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

export const STAGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
> = {
  DISCOVERED: 'secondary',
  SCRIPTED: 'default',
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

const TERMINAL_STAGES = new Set([
  ProjectStage.COMPLETED,
  ProjectStage.LOST,
  ProjectStage.CANCELLED,
]);

// ── Role capability helpers ──────────────────────────────────────────────────

function canEditScript(role: string) {
  return ['admin', 'lead', 'bidder'].includes(role);
}

function canEditBidDetails(role: string) {
  return ['admin', 'lead', 'closer'].includes(role);
}

function canEditWonDetails(role: string) {
  return ['admin', 'project_manager'].includes(role);
}

function canManageMilestones(role: string) {
  return ['admin', 'project_manager'].includes(role);
}

// ── Stage action config ──────────────────────────────────────────────────────

interface StageAction {
  label: string;
  variant: 'default' | 'destructive' | 'outline';
  type: 'advance' | 'set_stage' | 'assign_closer' | 'submit_bid';
  stage?: ProjectStage;
  requiresBid?: boolean;
}

function getPrimaryAction(stage: ProjectStage, role: string): StageAction | null {
  switch (stage) {
    case ProjectStage.DISCOVERED:
      if (['admin', 'lead', 'bidder'].includes(role))
        return { label: 'Submit for Review', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.SCRIPTED:
      if (['admin', 'lead'].includes(role))
        return { label: 'Move to Under Review', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.UNDER_REVIEW:
      if (['admin', 'lead'].includes(role))
        return { label: 'Assign Closer', variant: 'default', type: 'assign_closer' };
      break;
    case ProjectStage.ASSIGNED:
      if (['admin', 'closer'].includes(role))
        return { label: 'Submit Bid', variant: 'default', type: 'submit_bid', requiresBid: true };
      break;
    case ProjectStage.BID_SUBMITTED:
      if (['admin', 'closer'].includes(role))
        return { label: 'Mark as Viewed', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.VIEWED:
      if (['admin', 'closer'].includes(role))
        return { label: 'Mark as Messaged', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.MESSAGED:
      if (['admin', 'closer'].includes(role))
        return { label: 'Schedule Interview', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.INTERVIEW:
      if (['admin', 'closer', 'lead'].includes(role))
        return { label: 'Mark as Won', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.WON:
      if (['admin', 'project_manager'].includes(role))
        return { label: 'Start Project', variant: 'default', type: 'advance' };
      break;
    case ProjectStage.IN_PROGRESS:
      if (['admin', 'project_manager'].includes(role))
        return { label: 'Mark Complete', variant: 'default', type: 'advance' };
      break;
  }
  return null;
}

function getSecondaryActions(stage: ProjectStage, role: string): StageAction[] {
  if (TERMINAL_STAGES.has(stage)) return [];
  const actions: StageAction[] = [];

  // Mark as Lost — closer/lead/admin from ASSIGNED onwards makes business sense
  // but we allow from any non-terminal for flexibility
  if (['admin', 'lead', 'closer'].includes(role) && stage !== ProjectStage.WON) {
    actions.push({
      label: 'Mark as Lost',
      variant: 'destructive',
      type: 'set_stage',
      stage: ProjectStage.LOST,
    });
  }

  // Cancel — admin only
  if (role === 'admin') {
    actions.push({
      label: 'Cancel Project',
      variant: 'outline',
      type: 'set_stage',
      stage: ProjectStage.CANCELLED,
    });
  }

  return actions;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatUserName(
  u?: { firstName?: string | null; lastName?: string | null; email: string } | null,
) {
  if (!u) return '—';
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return name || u.email;
}

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(d?: string | null) {
  if (!d) return '—';
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
    if (min && max) return `Hourly · $${min}–$${max}/hr`;
    if (min) return `Hourly · $${min}+/hr`;
    if (max) return `Hourly · up to $${max}/hr`;
    return 'Hourly';
  }
  if (project.fixedPrice) return `Fixed · $${project.fixedPrice.toLocaleString()}`;
  return 'Fixed';
}

// ── Stage Action Banner ──────────────────────────────────────────────────────

interface BannerProps {
  project: Project;
  role: string;
  onAdvance: () => void;
  onSetStage: (stage: ProjectStage) => void;
  onAssignCloser: (closerId: string) => void;
  onSubmitBid: (bidAmount: number, upworkAccount: string) => void;
  isPending: boolean;
  closers: Array<{
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
  }>;
}

function StageActionBanner({
  project,
  role,
  onAdvance,
  onSetStage,
  onAssignCloser,
  onSubmitBid,
  isPending,
  closers,
}: BannerProps) {
  const [selectedCloser, setSelectedCloser] = useState('');
  const [bidAmount, setBidAmount] = useState(project.bidAmount?.toString() ?? '');
  const [upworkAccount, setUpworkAccount] = useState(project.upworkAccount ?? '');

  const primary = getPrimaryAction(project.stage, role);
  const secondary = getSecondaryActions(project.stage, role);

  if (!primary && secondary.length === 0) return null;

  const handlePrimary = () => {
    if (!primary) return;
    if (primary.type === 'advance') onAdvance();
    else if (primary.type === 'set_stage' && primary.stage) onSetStage(primary.stage);
    else if (primary.type === 'assign_closer') {
      if (selectedCloser) onAssignCloser(selectedCloser);
    } else if (primary.type === 'submit_bid') {
      const amount = parseFloat(bidAmount);
      if (!isNaN(amount) && amount > 0) onSubmitBid(amount, upworkAccount);
    }
  };

  return (
    <div className="px-6 py-4 bg-muted/40 border-b space-y-3">
      {/* Assign closer inline */}
      {primary?.type === 'assign_closer' && (
        <div className="flex items-center gap-2">
          <Select value={selectedCloser} onValueChange={setSelectedCloser}>
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="Select closer to assign..." />
            </SelectTrigger>
            <SelectContent>
              {closers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {formatUserName(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handlePrimary} disabled={isPending || !selectedCloser}>
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Assign & Advance
          </Button>
        </div>
      )}

      {/* Submit bid inline */}
      {primary?.type === 'submit_bid' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-7 h-9"
                type="number"
                min="0"
                placeholder="Bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
            <Input
              className="flex-1 h-9"
              placeholder="Upwork account (optional)"
              value={upworkAccount}
              onChange={(e) => setUpworkAccount(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handlePrimary}
              disabled={isPending || !bidAmount || parseFloat(bidAmount) <= 0}
            >
              Submit Bid
            </Button>
          </div>
        </div>
      )}

      {/* Simple advance actions */}
      {primary && primary.type === 'advance' && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {project.stage === ProjectStage.DISCOVERED &&
              'Script & cover letter should be filled before submitting.'}
            {project.stage === ProjectStage.SCRIPTED &&
              'Script reviewed and ready for closer assignment.'}
            {project.stage === ProjectStage.INTERVIEW && 'Did the interview go well?'}
          </p>
          <div className="flex items-center gap-2">
            {project.stage === ProjectStage.INTERVIEW && (
              <>
                <Button size="sm" onClick={handlePrimary} disabled={isPending}>
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Mark as Won
                </Button>
              </>
            )}
            {project.stage !== ProjectStage.INTERVIEW && (
              <Button size="sm" onClick={handlePrimary} disabled={isPending}>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                {primary.label}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Secondary actions */}
      {secondary.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground mr-1">Other actions:</span>
          {secondary.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                if (action.type === 'set_stage' && action.stage) onSetStage(action.stage);
              }}
              disabled={isPending}
            >
              {action.stage === ProjectStage.LOST && <XCircle className="h-3 w-3 mr-1" />}
              {action.stage === ProjectStage.CANCELLED && (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Milestone row ─────────────────────────────────────────────────────────────

function MilestoneRow({
  milestone,
  canManage,
  projectId,
}: {
  milestone: Milestone;
  canManage: boolean;
  projectId: string;
}) {
  const completeMilestone = useCompleteMilestone();

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            milestone.completed ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/40'
          }`}
        >
          {milestone.completed && <Check className="h-3 w-3 text-white" />}
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-medium truncate ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
          >
            {milestone.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {milestone.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(milestone.dueDate as unknown as string)}
              </span>
            )}
            {milestone.amount && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {milestone.amount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      {canManage && !milestone.completed && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs shrink-0"
          disabled={completeMilestone.isPending}
          onClick={() => completeMilestone.mutate({ projectId, id: milestone.id })}
        >
          <Check className="h-3 w-3 mr-1" />
          Done
        </Button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ProjectDetailSheetProps {
  projectId: string | null;
  onClose: () => void;
}

export function ProjectDetailSheet({ projectId, onClose }: ProjectDetailSheetProps) {
  const { user } = useAuthContext();
  const role = user?.role?.toLowerCase() ?? '';

  const { data: project, isLoading, isError } = useProject(projectId ?? '');
  const { data: usersData } = useUsers({ limit: 100 });
  const closers = usersData?.data.filter((u) => u.role?.name === 'closer') ?? [];

  const milestones = useMilestones(projectId ?? '');

  const updateProject = useUpdateProject();
  const advanceStage = useAdvanceStage();
  const setStage = useSetStage();
  const assignProject = useAssignProject();
  const createMilestone = useCreateMilestone();

  // Script & Bid form state
  const [scriptForm, setScriptForm] = useState({
    coverLetter: '',
    videoScript: '',
    upworkAccount: '',
    bidAmount: '',
  });

  // Won Details form state
  const [wonForm, setWonForm] = useState({
    clientName: '',
    clientNotes: '',
    contractValue: '',
    contractCurrency: 'USD',
    startDate: '',
    endDate: '',
  });

  // Milestone add form
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', dueDate: '', amount: '' });

  // Active tab — switch to 'won' when project moves to WON stage
  const [activeTab, setActiveTab] = useState('overview');

  // Sync forms when project data loads / changes
  useEffect(() => {
    if (!project) return;
    setScriptForm({
      coverLetter: project.coverLetter ?? '',
      videoScript: project.videoScript ?? '',
      upworkAccount: project.upworkAccount ?? '',
      bidAmount: project.bidAmount?.toString() ?? '',
    });
    setWonForm({
      clientName: project.clientName ?? '',
      clientNotes: project.clientNotes ?? '',
      contractValue: project.contractValue?.toString() ?? '',
      contractCurrency: project.contractCurrency ?? 'USD',
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
    });
  }, [project]);

  // When project advances to WON, auto-switch to won tab
  useEffect(() => {
    if (
      project?.stage &&
      [ProjectStage.WON, ProjectStage.IN_PROGRESS, ProjectStage.COMPLETED].includes(project.stage)
    ) {
      // Only auto-switch if we're not already there
      setActiveTab((prev) => (prev === 'overview' || prev === 'script' ? 'won' : prev));
    }
  }, [project?.stage]);

  const handleSaveScript = async () => {
    if (!project) return;
    await updateProject.mutateAsync({
      id: project.id,
      coverLetter: scriptForm.coverLetter || undefined,
      videoScript: scriptForm.videoScript || undefined,
      upworkAccount: scriptForm.upworkAccount || undefined,
      bidAmount: scriptForm.bidAmount ? parseFloat(scriptForm.bidAmount) : undefined,
      lastEditedById: user?.id,
    });
  };

  const handleSaveWon = async () => {
    if (!project) return;
    await updateProject.mutateAsync({
      id: project.id,
      clientName: wonForm.clientName || undefined,
      clientNotes: wonForm.clientNotes || undefined,
      contractValue: wonForm.contractValue ? parseFloat(wonForm.contractValue) : undefined,
      contractCurrency: wonForm.contractCurrency || 'USD',
      startDate: wonForm.startDate || undefined,
      endDate: wonForm.endDate || undefined,
      lastEditedById: user?.id,
    });
  };

  const handleAdvance = () => {
    if (!project) return;
    advanceStage.mutate(project.id);
  };

  const handleSetStage = (stage: ProjectStage) => {
    if (!project) return;
    setStage.mutate({ id: project.id, stage });
  };

  const handleAssignCloser = (closerId: string) => {
    if (!project) return;
    assignProject.mutate({ id: project.id, assignedCloserId: closerId, lastEditedById: user?.id });
  };

  const handleSubmitBid = (bidAmount: number, upworkAccount: string) => {
    if (!project) return;
    updateProject
      .mutateAsync({
        id: project.id,
        bidAmount,
        upworkAccount: upworkAccount || undefined,
        lastEditedById: user?.id,
      })
      .then(() => advanceStage.mutate(project.id));
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !milestoneForm.name) return;
    await createMilestone.mutateAsync({
      projectId: project.id,
      name: milestoneForm.name,
      dueDate: milestoneForm.dueDate || undefined,
      amount: milestoneForm.amount ? parseFloat(milestoneForm.amount) : undefined,
    });
    setMilestoneForm({ name: '', dueDate: '', amount: '' });
    setAddingMilestone(false);
  };

  const isPending =
    advanceStage.isPending ||
    setStage.isPending ||
    assignProject.isPending ||
    updateProject.isPending;

  const showWonTab =
    project &&
    [ProjectStage.WON, ProjectStage.IN_PROGRESS, ProjectStage.COMPLETED].includes(project.stage);

  const scriptEditable = canEditScript(role);
  const bidEditable = canEditBidDetails(role);
  const wonEditable = canEditWonDetails(role);
  const milestoneManage = canManageMilestones(role);
  const canSaveScript = scriptEditable || bidEditable;

  return (
    <Sheet open={!!projectId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:w-[640px] sm:max-w-[640px] p-0 flex flex-col overflow-hidden"
        side="right"
      >
        {isLoading && (
          <div className="p-6 space-y-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-destructive">Failed to load project details.</div>
        )}

        {project && (
          <>
            {/* ── Header ─────────────────────────────────────────────── */}
            <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="pr-8">
                <SheetTitle className="text-xl leading-tight">{project.title}</SheetTitle>
                <SheetDescription className="sr-only">Project details</SheetDescription>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant={STAGE_VARIANT[project.stage] ?? 'secondary'}>
                    {STAGE_LABELS[project.stage] ?? project.stage}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatPricing(project)}</span>
                  {project.jobUrl && (
                    <a
                      href={project.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Job
                    </a>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* ── Stage Action Banner ─────────────────────────────────── */}
            <StageActionBanner
              project={project}
              role={role}
              onAdvance={handleAdvance}
              onSetStage={handleSetStage}
              onAssignCloser={handleAssignCloser}
              onSubmitBid={handleSubmitBid}
              isPending={isPending}
              closers={closers}
            />

            {/* ── Tabs ───────────────────────────────────────────────── */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="px-6 pt-3 shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="script" className="flex-1">
                    Script & Bid
                  </TabsTrigger>
                  {showWonTab && (
                    <TabsTrigger value="won" className="flex-1">
                      Won Details
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* ── Overview Tab ─────────────────────────────────────── */}
              <TabsContent
                value="overview"
                className="flex-1 overflow-y-auto px-6 pb-6 mt-0 space-y-5"
              >
                {/* Job Description */}
                {project.jobDescription && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Job Description
                    </h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                      {project.jobDescription}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Context */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Building2 className="h-3 w-3" />
                      Organization
                    </p>
                    <p className="text-sm font-medium">{project.organization?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Tag className="h-3 w-3" />
                      Niche
                    </p>
                    <p className="text-sm font-medium">{project.niche?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Users className="h-3 w-3" />
                      Team
                    </p>
                    <p className="text-sm font-medium">{project.team?.name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Calendar className="h-3 w-3" />
                      Discovered
                    </p>
                    <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                {/* Assignments */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Assignments
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Discovered By</p>
                      <p className="text-sm font-medium">{formatUserName(project.discoveredBy)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Assigned Closer</p>
                      <p className="text-sm font-medium">
                        {formatUserName(project.assignedCloser)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Project Manager</p>
                      <p className="text-sm font-medium">{formatUserName(project.assignedPM)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Audit */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Audit
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last edited by</span>
                      <span className="font-medium">{formatUserName(project.lastEditedBy)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last updated</span>
                      <span className="font-medium">{formatDateTime(project.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">{formatDateTime(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Script & Bid Tab ──────────────────────────────────── */}
              <TabsContent
                value="script"
                className="flex-1 overflow-y-auto px-6 pb-6 mt-0 space-y-5"
              >
                {/* Last edited info */}
                {project.lastEditedBy && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Last edited by{' '}
                    <span className="font-medium text-foreground">
                      {formatUserName(project.lastEditedBy)}
                    </span>{' '}
                    · {formatDateTime(project.updatedAt)}
                  </p>
                )}

                {/* Cover Letter */}
                <div className="space-y-2">
                  <Label htmlFor="coverLetter" className="text-sm font-semibold">
                    Cover Letter
                    {!scriptEditable && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (read-only)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="coverLetter"
                    rows={8}
                    placeholder="Write the Upwork cover letter here..."
                    value={scriptForm.coverLetter}
                    onChange={(e) => setScriptForm((p) => ({ ...p, coverLetter: e.target.value }))}
                    disabled={!scriptEditable}
                    className="resize-none font-mono text-sm"
                  />
                </div>

                {/* Video Script */}
                <div className="space-y-2">
                  <Label htmlFor="videoScript" className="text-sm font-semibold">
                    Video Script
                    {!scriptEditable && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (read-only)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="videoScript"
                    rows={8}
                    placeholder="Write the video proposal script here..."
                    value={scriptForm.videoScript}
                    onChange={(e) => setScriptForm((p) => ({ ...p, videoScript: e.target.value }))}
                    disabled={!scriptEditable}
                    className="resize-none font-mono text-sm"
                  />
                </div>

                <Separator />

                {/* Bid Details */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Bid Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bidAmount" className="text-xs">
                        Bid Amount ($)
                        {!bidEditable && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            (read-only)
                          </span>
                        )}
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="bidAmount"
                          type="number"
                          min="0"
                          placeholder="0"
                          className="pl-7"
                          value={scriptForm.bidAmount}
                          onChange={(e) =>
                            setScriptForm((p) => ({ ...p, bidAmount: e.target.value }))
                          }
                          disabled={!bidEditable}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="upworkAccount" className="text-xs">
                        Upwork Account
                        {!bidEditable && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            (read-only)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="upworkAccount"
                        placeholder="e.g. AOP_Main"
                        value={scriptForm.upworkAccount}
                        onChange={(e) =>
                          setScriptForm((p) => ({ ...p, upworkAccount: e.target.value }))
                        }
                        disabled={!bidEditable}
                      />
                    </div>
                  </div>
                </div>

                {canSaveScript && (
                  <Button
                    onClick={handleSaveScript}
                    disabled={updateProject.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </TabsContent>

              {/* ── Won Details Tab ──────────────────────────────────── */}
              {showWonTab && (
                <TabsContent
                  value="won"
                  className="flex-1 overflow-y-auto px-6 pb-6 mt-0 space-y-5"
                >
                  {/* Won project fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="clientName" className="text-xs font-semibold">
                        Client Name
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="Client or company name"
                        value={wonForm.clientName}
                        onChange={(e) => setWonForm((p) => ({ ...p, clientName: e.target.value }))}
                        disabled={!wonEditable}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contractValue" className="text-xs font-semibold">
                        Contract Value ($)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          id="contractValue"
                          type="number"
                          min="0"
                          className="pl-7"
                          placeholder="0"
                          value={wonForm.contractValue}
                          onChange={(e) =>
                            setWonForm((p) => ({ ...p, contractValue: e.target.value }))
                          }
                          disabled={!wonEditable}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="currency" className="text-xs font-semibold">
                        Currency
                      </Label>
                      <Select
                        value={wonForm.contractCurrency}
                        onValueChange={(v) => setWonForm((p) => ({ ...p, contractCurrency: v }))}
                        disabled={!wonEditable}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="startDate" className="text-xs font-semibold">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={wonForm.startDate}
                        onChange={(e) => setWonForm((p) => ({ ...p, startDate: e.target.value }))}
                        disabled={!wonEditable}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endDate" className="text-xs font-semibold">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={wonForm.endDate}
                        onChange={(e) => setWonForm((p) => ({ ...p, endDate: e.target.value }))}
                        disabled={!wonEditable}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="clientNotes" className="text-xs font-semibold">
                        Client Notes
                      </Label>
                      <Textarea
                        id="clientNotes"
                        rows={3}
                        placeholder="Notes about the client, project requirements, context..."
                        value={wonForm.clientNotes}
                        onChange={(e) => setWonForm((p) => ({ ...p, clientNotes: e.target.value }))}
                        disabled={!wonEditable}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {wonEditable && (
                    <Button
                      onClick={handleSaveWon}
                      disabled={updateProject.isPending}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProject.isPending ? 'Saving...' : 'Save Won Details'}
                    </Button>
                  )}

                  <Separator />

                  {/* Milestones */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        Milestones
                        {milestones.data && milestones.data.length > 0 && (
                          <span className="text-xs text-muted-foreground font-normal">
                            ({milestones.data.filter((m) => m.completed).length}/
                            {milestones.data.length} done)
                          </span>
                        )}
                      </h3>
                      {milestoneManage && !addingMilestone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setAddingMilestone(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>

                    {/* Add milestone form */}
                    {addingMilestone && (
                      <form
                        onSubmit={handleAddMilestone}
                        className="mb-3 p-3 rounded-lg border bg-muted/30 space-y-2"
                      >
                        <Input
                          placeholder="Milestone name *"
                          value={milestoneForm.name}
                          onChange={(e) =>
                            setMilestoneForm((p) => ({ ...p, name: e.target.value }))
                          }
                          required
                          autoFocus
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            className="h-8 text-sm flex-1"
                            value={milestoneForm.dueDate}
                            onChange={(e) =>
                              setMilestoneForm((p) => ({ ...p, dueDate: e.target.value }))
                            }
                          />
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="h-8 text-sm pl-6"
                              value={milestoneForm.amount}
                              onChange={(e) =>
                                setMilestoneForm((p) => ({ ...p, amount: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            className="h-7 text-xs flex-1"
                            disabled={createMilestone.isPending}
                          >
                            {createMilestone.isPending ? 'Adding...' : 'Add Milestone'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setAddingMilestone(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {milestones.isLoading && <Skeleton className="h-10 w-full" />}
                    {milestones.data && milestones.data.length === 0 && !addingMilestone && (
                      <p className="text-sm text-muted-foreground py-2">No milestones yet.</p>
                    )}
                    {milestones.data && milestones.data.length > 0 && (
                      <div>
                        {milestones.data.map((m) => (
                          <MilestoneRow
                            key={m.id}
                            milestone={m}
                            canManage={milestoneManage}
                            projectId={project.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
