'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects, useCreateProject, usePipelineCounts } from '@/hooks/use-projects';
import { useNiches } from '@/hooks/use-niches';
import { useUsers } from '@/hooks/use-users';
import { useAuthContext } from '@/components/auth-provider';
import {
  ProjectDetailSheet,
  STAGE_LABELS,
  STAGE_VARIANT,
} from '@/components/projects/project-detail-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, ChevronRight } from 'lucide-react';
import { ProjectStage, PricingType } from '@/types';

const STAGE_OPTIONS = [
  { label: 'All Stages', value: 'all' },
  ...Object.values(ProjectStage).map((s) => ({
    label: STAGE_LABELS[s] ?? s,
    value: s,
  })),
];

// Roles that cannot view the projects page at all
const BLOCKED_ROLES = ['operator', 'qa'];

export default function ProjectsPage() {
  const router = useRouter();
  const { user, activeOrganizationId } = useAuthContext();
  const role = user?.role?.toLowerCase() ?? '';

  // Redirect operators/qa away
  useEffect(() => {
    if (role && BLOCKED_ROLES.includes(role)) {
      router.replace('/tasks');
    }
  }, [role, router]);

  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const limit = 25;

  const { data, isLoading, isError, error } = useProjects({
    page,
    limit,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    organizationId: activeOrganizationId ?? undefined,
  });

  const { data: pipelineCounts } = usePipelineCounts(activeOrganizationId ?? undefined);
  const createProject = useCreateProject();
  const { data: niches } = useNiches(activeOrganizationId ?? undefined);
  const { data: usersData } = useUsers({ limit: 100 });

  const [form, setForm] = useState({
    title: '',
    pricingType: PricingType.HOURLY as string,
    jobUrl: '',
    jobDescription: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    fixedPrice: '',
    nicheId: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganizationId) return;
    await createProject.mutateAsync({
      title: form.title,
      pricingType: form.pricingType,
      organizationId: activeOrganizationId,
      jobUrl: form.jobUrl || undefined,
      jobDescription: form.jobDescription || undefined,
      hourlyRateMin: form.hourlyRateMin ? parseFloat(form.hourlyRateMin) : undefined,
      hourlyRateMax: form.hourlyRateMax ? parseFloat(form.hourlyRateMax) : undefined,
      fixedPrice: form.fixedPrice ? parseFloat(form.fixedPrice) : undefined,
      nicheId: form.nicheId && form.nicheId !== 'none' ? form.nicheId : undefined,
      discoveredById: user?.id,
    });
    setForm({
      title: '',
      pricingType: PricingType.HOURLY,
      jobUrl: '',
      jobDescription: '',
      hourlyRateMin: '',
      hourlyRateMax: '',
      fixedPrice: '',
      nicheId: '',
    });
    setCreateOpen(false);
  };

  const formatUserName = (
    u?: { firstName?: string | null; lastName?: string | null; email: string } | null,
  ) => {
    if (!u) return '—';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || u.email;
  };

  if (BLOCKED_ROLES.includes(role)) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-6 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">Full pipeline: Discovery to Delivery</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Discover a new job and add it to the pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="projTitle">Job Title *</Label>
                  <Input
                    id="projTitle"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Full-Stack Developer for SaaS Platform"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projPricing">Pricing Type *</Label>
                    <Select
                      value={form.pricingType}
                      onValueChange={(v) => setForm((p) => ({ ...p, pricingType: v }))}
                    >
                      <SelectTrigger id="projPricing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PricingType.HOURLY}>Hourly</SelectItem>
                        <SelectItem value={PricingType.FIXED}>Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="projNiche">Niche</Label>
                    <Select
                      value={form.nicheId}
                      onValueChange={(v) => setForm((p) => ({ ...p, nicheId: v }))}
                    >
                      <SelectTrigger id="projNiche">
                        <SelectValue placeholder="Select niche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {niches?.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projUrl">Job URL</Label>
                  <Input
                    id="projUrl"
                    value={form.jobUrl}
                    onChange={(e) => setForm((p) => ({ ...p, jobUrl: e.target.value }))}
                    placeholder="https://www.upwork.com/jobs/..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projDesc">Job Description</Label>
                  <Textarea
                    id="projDesc"
                    value={form.jobDescription}
                    onChange={(e) => setForm((p) => ({ ...p, jobDescription: e.target.value }))}
                    placeholder="Paste the job description..."
                    rows={3}
                  />
                </div>
                {form.pricingType === PricingType.HOURLY ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="projRateMin">Hourly Min ($)</Label>
                      <Input
                        id="projRateMin"
                        type="number"
                        min="0"
                        value={form.hourlyRateMin}
                        onChange={(e) => setForm((p) => ({ ...p, hourlyRateMin: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="projRateMax">Hourly Max ($)</Label>
                      <Input
                        id="projRateMax"
                        type="number"
                        min="0"
                        value={form.hourlyRateMax}
                        onChange={(e) => setForm((p) => ({ ...p, hourlyRateMax: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="projFixed">Fixed Price ($)</Label>
                    <Input
                      id="projFixed"
                      type="number"
                      min="0"
                      value={form.fixedPrice}
                      onChange={(e) => setForm((p) => ({ ...p, fixedPrice: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProject.isPending || !form.title}>
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Pipeline pills ──────────────────────────────────────────────── */}
      {pipelineCounts && pipelineCounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            onClick={() => {
              setStageFilter('all');
              setPage(1);
            }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              stageFilter === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-accent'
            }`}
          >
            All
          </button>
          {pipelineCounts
            .filter(({ count }) => count > 0)
            .map(({ stage, count }) => (
              <button
                key={stage}
                onClick={() => {
                  setStageFilter(stageFilter === stage ? 'all' : stage);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  stageFilter === stage
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-accent'
                }`}
              >
                {STAGE_LABELS[stage] ?? stage}: {count}
              </button>
            ))}
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        <Select
          value={stageFilter}
          onValueChange={(v) => {
            setStageFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {data ? `${data.meta.total} project${data.meta.total !== 1 ? 's' : ''}` : '—'}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">Click any row to open details</span>
      </div>

      {/* ── Table (fills remaining height) ─────────────────────────────── */}
      <div className="flex-1 rounded-lg border overflow-hidden flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[280px]">Title</TableHead>
                <TableHead className="w-[130px]">Stage</TableHead>
                <TableHead className="w-[110px]">Niche</TableHead>
                <TableHead className="w-[140px]">Discovered By</TableHead>
                <TableHead className="w-[140px]">Closer</TableHead>
                <TableHead className="w-[110px]">Bid Amount</TableHead>
                <TableHead className="w-[100px]">Created</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {isError && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-destructive">
                    Failed to load projects. {(error as Error)?.message || 'Unknown error'}
                  </TableCell>
                </TableRow>
              )}

              {data?.data.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <TableCell>
                    <div className="font-medium leading-tight truncate max-w-[260px]">
                      {project.title}
                    </div>
                    {project.niche && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {project.organization?.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STAGE_VARIANT[project.stage] ?? 'secondary'}
                      className="text-xs whitespace-nowrap"
                    >
                      {STAGE_LABELS[project.stage] ?? project.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.niche?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[130px]">
                    {formatUserName(project.discoveredBy)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[130px]">
                    {formatUserName(project.assignedCloser)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.bidAmount ? `$${project.bidAmount.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}

              {data && data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    No projects found.{' '}
                    {stageFilter !== 'all' && (
                      <button
                        className="underline text-primary"
                        onClick={() => setStageFilter('all')}
                      >
                        Clear filter
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="border-t px-4 py-2.5 flex items-center justify-between shrink-0 bg-card">
            <p className="text-xs text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} &middot; {data.meta.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page >= data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Project Detail Sheet ───────────────────────────────────────── */}
      <ProjectDetailSheet
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
}
