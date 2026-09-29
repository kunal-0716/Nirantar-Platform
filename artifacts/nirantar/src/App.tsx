import { useMutation, useQuery } from '@tanstack/react-query';
import { customFetch, setRoleGetter, setParticipantIdGetter } from '@workspace/api-client-react';
import { type ReactNode, useMemo, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3,
  FileCheck2, Filter, Flag, Gauge, History, LayoutList, LockKeyhole, Menu, Pause, Play,
  Plus, RefreshCw, Search, Send, Settings2, ShieldCheck, SlidersHorizontal, UserRound,
  Users, X, XCircle, ShieldAlert
} from 'lucide-react';
import {
  getGetParticipantContinuityQueryKey, getGetWorkspaceQueryKey, getListParticipantsQueryKey,
  getListTasksQueryKey, useControlSimulation, useCreateAction, useCreateCaseEvent,
  useDecideTask, useGetParticipantContinuity, useGetWorkspace, useListParticipants,
  useListTasks, useSubmitParticipantCheckin, useTakeTaskOwnership, useVerifyAudit
} from '@workspace/api-client-react';
import { Route, Switch, Link, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import '@/index.css';

const queryClient = new QueryClient();

export const getActiveParticipantId = () => {
  return localStorage.getItem('nirantar_active_participant') || 'p-04';
};
setParticipantIdGetter(getActiveParticipantId);

export const getActiveRole = () => {
  const r = localStorage.getItem('nirantar_active_role') || 'SUPERVISOR';
  if (r === 'WORKER') return 'SUPERVISOR';
  return r;
};
setRoleGetter(getActiveRole);

export function useRole() {
  const [role, setRoleState] = useState(getActiveRole());
  const [participantId, setParticipantIdState] = useState(getActiveParticipantId());
  
  const setRole = (newRole: string) => {
    localStorage.setItem('nirantar_active_role', newRole);
    setRoleState(newRole);
    window.location.reload();
  };
  
  const setParticipantId = (newId: string) => {
    localStorage.setItem('nirantar_active_participant', newId);
    setParticipantIdState(newId);
    window.location.reload();
  };
  
  return { role, setRole, participantId, setParticipantId };
}

const sampleTasks = [
  { id: 'task-atypical', taskType: 'ATYPICAL_CHANGE', attentionTier: 'PRIORITY_REVIEW', ageLabel: '4h', participantId: 'p-02', pseudonym: 'P-02', owner: null, dueLabel: 'Today · 14:00', status: 'OPEN', summary: 'Observed score is outside the event-adjusted expected band.', escalationReason: null, confidenceTier: 'MODERATE CONFIDENCE' },
  { id: 'task-silence', taskType: 'SILENCE_REVIEW', attentionTier: 'PRIORITY_REVIEW', ageLabel: '1d', participantId: 'p-03', pseudonym: 'P-03', owner: null, dueLabel: 'Tomorrow · 10:00', status: 'OPEN', summary: 'Two scheduled check-ins have no response.', escalationReason: 'Contact Restricted', confidenceTier: 'REVIEW REQUIRED' },
  { id: 'task-closed', taskType: 'SAFETY_EVENT_REVIEW', attentionTier: 'IMMEDIATE_ATTENTION', ageLabel: '2d', participantId: 'p-01', pseudonym: 'P-01', owner: 'Supervisor', dueLabel: 'Closed', status: 'CLOSED', summary: 'Event verification recorded.', escalationReason: 'Completed', confidenceTier: null },
];
const samplePeople = [
  { id: 'p-01', pseudonym: 'P-01', status: 'Active', latestClass: 'EVENT_CONSISTENT_CHANGE', latestScore: 66, lastObservationLabel: '10 Sep · 09:12', contactRestriction: 'No automated contact', checkinState: 'SCHEDULED', nextCheckinExpectedAt: '2026-09-08T09:00:00Z' },
  { id: 'p-02', pseudonym: 'P-02', status: 'Active', latestClass: 'ATYPICAL_CHANGE', latestScore: 57, lastObservationLabel: '10 Sep · 09:12', contactRestriction: 'No automated contact', checkinState: 'SCHEDULED', nextCheckinExpectedAt: '2026-09-08T09:00:00Z' },
  { id: 'p-03', pseudonym: 'P-03', status: 'Active · Contact restricted', latestClass: 'SILENCE_REVIEW', latestScore: 72, lastObservationLabel: 'Last valid observation · 27 Aug', contactRestriction: 'Discreet contact only', checkinState: 'SILENCE_REVIEW', nextCheckinExpectedAt: '2026-09-08T09:00:00Z' },
];

function classLabel(value?: string) {
  return (value || '').replaceAll('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (s) => s.toUpperCase());
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'orange' | 'quiet' | 'danger' }) {
  return <span className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] font-medium uppercase tracking-[.12em] ${tone === 'accent' ? 'border-[hsl(var(--primary)/.4)] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))]' : tone === 'orange' ? 'border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.11)] text-[hsl(var(--accent-foreground))]' : tone === 'danger' ? 'border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.08)] text-[hsl(var(--destructive))]' : tone === 'quiet' ? 'border-transparent bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]' : 'border-border bg-card text-muted-foreground'}`}>{children}</span>;
}

function Button({ children, className = '', variant = 'line', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'line' | 'solid' | 'quiet' }) {
  return <button className={`focus-ring button-line inline-flex min-h-9 items-center justify-center gap-2 border px-3 text-xs font-semibold tracking-[.02em] disabled:cursor-not-allowed disabled:opacity-45 ${variant === 'solid' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : variant === 'quiet' ? 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground' : 'border-border bg-card text-foreground hover:border-[hsl(var(--primary)/.5)] hover:bg-secondary'} ${className}`} {...props}>{children}</button>;
}

function SectionTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
    <div><div className="mb-1 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">{eyebrow}</div><h1 className="font-serif text-4xl leading-none tracking-tight text-foreground">{title}</h1>{detail && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{detail}</p>}</div>{action}
  </div>;
}

function LoadingRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-2">{Array.from({ length: count }, (_, i) => <div key={i} className="h-14 animate-pulse border border-border bg-muted/60" />)}</div>;
}

function Shell({ children }: { children: ReactNode }) {
  const { role, setRole, participantId, setParticipantId } = useRole();
  const [location] = useLocation();
  const { data: workspace, isLoading } = useGetWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/queue', label: 'Review queue', icon: LayoutList, count: workspace?.counts.openTasks },
    { href: '/participants', label: 'Caseload', icon: Users, count: workspace?.counts.participants },
    { href: '/operations', label: 'Operations', icon: Activity },
    ...(role === 'SUPERVISOR' ? [{ href: '/escalations', label: 'Escalations', icon: ShieldAlert as any }] : []),
    ...(role === 'SUPERVISOR' ? [{ href: '/audit', label: 'Audit chain', icon: FileCheck2 }] : []),
    { href: '/simulation', label: 'Simulation', icon: Gauge },
  ];
  return <div className="grain min-h-[100dvh] bg-background">
    <div className="synthetic-banner">SYNTHETIC DATA — MVP ENVIRONMENT</div>
    <header className="flex h-16 items-center justify-between border-b border-border bg-[hsl(var(--primary))] px-4 text-[hsl(var(--primary-foreground))] md:px-7">
      <div className="flex items-center gap-4"><button className="focus-ring md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={18} /></button><Link href="/queue" className="focus-ring flex items-center gap-3" data-testid="link-nirantar-home"><span className="grid h-8 w-8 place-items-center border border-[hsl(var(--primary-foreground)/.45)] font-serif text-lg">N</span><span className="text-sm font-semibold tracking-[.25em]">NIRANTAR</span></Link><span className="hidden border-l border-[hsl(var(--primary-foreground)/.3)] pl-4 font-mono text-[10px] uppercase tracking-[.16em] opacity-70 md:inline">Continuity workspace / synthetic</span></div>
      <div className="flex items-center gap-4"><div className="hidden text-right sm:block"><div className="font-mono text-[10px] uppercase opacity-65">Workspace clock</div><div className="text-xs">{isLoading ? 'syncing…' : workspace?.clockLabel || 'Tue 18 Jun · 10:42'}</div></div><div className="flex items-center gap-2 border-l border-[hsl(var(--primary-foreground)/.3)] pl-4"><span className="grid h-7 w-7 place-items-center border border-[hsl(var(--primary-foreground)/.4)] text-[10px] font-semibold">RS</span><span className="hidden text-xs sm:inline">R. Sen · liaison</span></div></div>
    </header>
    <div className="flex">
      <aside className={`${mobileOpen ? 'block' : 'hidden'} fixed inset-y-[88px] left-0 z-40 w-64 border-r border-border bg-[hsl(var(--background))] p-4 md:sticky md:top-0 md:block md:h-[calc(100dvh-4rem)]`}>
        <div className="mb-5 px-2 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Authorized view</div>
        <nav className="space-y-1">{nav.map((item) => { const Icon = item.icon; const active = location === item.href || (item.href === '/participants' && location.startsWith('/participants/')); return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`focus-ring flex items-center justify-between border-l-2 px-3 py-3 text-sm ${active ? 'border-[hsl(var(--accent))] bg-secondary font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}><span className="flex items-center gap-3"><Icon size={16} strokeWidth={1.7} />{item.label}</span>{item.count !== undefined && <span className="font-mono text-[10px] text-muted-foreground">{item.count}</span>}</Link>; })}</nav>
        <div className="absolute bottom-5 left-4 right-4 border-t border-border pt-4"><Link href="/participant/check-in" className="focus-ring flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground hover:text-foreground" data-testid="link-participant-view"><UserRound size={15} />Participant surface</Link><div className="mt-4 flex items-center gap-2 px-3 text-[10px] uppercase tracking-[.12em] text-muted-foreground"><LockKeyhole size={12} />Human review required</div></div>
      </aside>
      <main className="min-w-0 flex-1"><div className="mx-auto max-w-[1440px] p-4 md:p-8">{children}</div></main>
    </div>
  </div>;
}

function Home() {
  const [, setLocation] = useLocation();
  return <div className="grain min-h-[100dvh] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
    <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-between p-6 md:p-12">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center border border-[hsl(var(--primary-foreground)/.45)] font-serif text-2xl">N</span><span className="text-sm font-semibold tracking-[.3em]">NIRANTAR</span></div><span className="font-mono text-[10px] uppercase tracking-[.18em] opacity-60">Synthetic continuity workspace</span></header>
      <div className="grid gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:items-end"><div className="enter"><p className="mb-5 font-mono text-[11px] uppercase tracking-[.22em] text-[hsl(var(--accent))]">A record that keeps the thread</p><h1 className="max-w-2xl font-serif text-6xl leading-[.93] tracking-tight md:text-8xl">Stay close to what changed.</h1><p className="mt-8 max-w-lg text-base leading-7 opacity-75">NIRANTAR keeps events, observations, context, ownership, and follow-up visible together — for people doing careful work with synthetic cases.</p></div><div className="enter delay-2 border border-[hsl(var(--primary-foreground)/.3)] p-5"><div className="mb-6 font-mono text-[10px] uppercase tracking-[.2em] opacity-60">Enter demo workspace</div><div className="space-y-3"><button onClick={() => setLocation('/queue')} className="focus-ring flex w-full items-center justify-between border border-[hsl(var(--primary-foreground)/.45)] px-4 py-4 text-left text-sm hover:bg-[hsl(var(--primary-foreground)/.08)]" data-testid="button-enter-worker"><span><strong className="block">Support worker</strong><small className="mt-1 block opacity-60">Review queue and continuity records</small></span><ArrowRight size={17} /></button><button onClick={() => setLocation('/participant/check-in')} className="focus-ring flex w-full items-center justify-between border border-[hsl(var(--primary-foreground)/.22)] px-4 py-4 text-left text-sm hover:bg-[hsl(var(--primary-foreground)/.08)]" data-testid="button-enter-participant"><span><strong className="block">Participant</strong><small className="mt-1 block opacity-60">A private, plain-language check-in</small></span><ArrowRight size={17} /></button></div></div></div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--primary-foreground)/.2)] pt-5 font-mono text-[10px] uppercase tracking-[.14em] opacity-55"><span>Demo environment · no live records</span><span className="flex items-center gap-2"><ShieldCheck size={13} /> Access is role-bound</span></footer>
    </div>
  </div>;
}

function QueuePage() {
  const { role } = useRole();
  const workerId = role.toLowerCase() + '-01';
  const { data, isLoading, isError, refetch } = useListTasks(undefined, { query: { queryKey: getListTasksQueryKey() } });
  const take = useTakeTaskOwnership();
  const decide = useDecideTask();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const tasks = data || sampleTasks;
  const filtered = tasks.filter((t) => filter === 'all' || (filter === 'unowned' && !t.owner) || (filter === 'mine' && t.owner === workerId) || (filter === 'escalated' && t.status === 'ESCALATED'));
  return <><SectionTitle eyebrow="01 / human work" title="Review queue" detail="Open attention signals ordered by age and required human response." action={<Button onClick={() => refetch()} data-testid="button-refresh-queue"><RefreshCw size={14} />Refresh</Button>} />
    {notice && <div className="mb-5 flex items-center gap-2 border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] px-3 py-2 text-xs text-[hsl(var(--primary))]" data-testid="status-queue-success"><CheckCircle2 size={15} />{notice}<button className="ml-auto" onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14} /></button></div>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3"><div className="flex items-center gap-2"><Filter size={15} className="text-muted-foreground" /><span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Showing</span>{['all', 'unowned', 'mine', 'escalated'].map((f) => <button key={f} onClick={() => setFilter(f)} className={`focus-ring px-2 py-1 text-xs ${filter === f ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-muted-foreground hover:bg-muted'}`} data-testid={`button-filter-${f}`}>{f === 'all' ? 'All tasks' : classLabel(f)}</button>)}</div><span className="font-mono text-[10px] text-muted-foreground">{filtered.length} visible / {tasks.length} total</span></div>
    {isError && <div className="mb-4 border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.06)] p-4 text-sm"><strong>Queue could not sync.</strong><p className="mt-1 text-muted-foreground">Showing the last synthetic working set. Retry when the service is available.</p><Button className="mt-3" onClick={() => refetch()} data-testid="button-retry-queue">Retry sync</Button></div>}
    {isLoading ? <LoadingRows /> : filtered.length === 0 ? <EmptyState title="The queue is clear" detail="No tasks match this view. Human attention is not currently waiting here." icon={<CheckCircle2 size={28} />} /> : <div className="space-y-2">{filtered.map((task) => <div key={task.id} className="table-row grid gap-4 border border-border bg-card p-4 md:grid-cols-[150px_1fr_180px_150px] md:items-center" data-testid={`row-task-${task.id}`}><div><div className="flex items-center gap-2"><span className="h-2 w-2 border border-[hsl(var(--primary))]" /><span className="font-mono text-[10px] text-muted-foreground">{task.id}</span></div><Badge tone={task.attentionTier === 'PRIORITY_REVIEW' ? 'orange' : 'quiet'}>{classLabel(task.attentionTier)}</Badge></div><div><Link href={`/participants/${task.participantId}`} className="focus-ring font-semibold hover:underline" data-testid={`link-task-participant-${task.id}`}>{task.pseudonym}</Link><p className="mt-1 text-sm text-muted-foreground">{task.summary}</p>{task.escalationReason && <div className="mt-1 inline-flex"><Badge tone="danger">{task.escalationReason}</Badge></div>}<p className="mt-2 font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">{classLabel(task.taskType)} · {task.confidenceTier || 'Unstated'} confidence</p></div><div className="text-xs"><div className="flex items-center gap-2 text-muted-foreground"><Clock3 size={13} />{task.ageLabel} old</div><div className="mt-2 font-mono text-[10px] uppercase text-muted-foreground">Due {task.dueLabel}</div></div><div className="flex flex-wrap gap-2 md:justify-end">{!task.owner && <Button onClick={() => take.mutate({ taskId: task.id, data: { owner: workerId } }, { onSuccess: () => { setNotice('Task assigned to ' + workerId + '.'); qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); } })} disabled={take.isPending} data-testid={`button-take-${task.id}`}>Take ownership</Button>}{task.status !== 'CLOSED' && <Link href={`/participants/${task.participantId}`} className="focus-ring button-line inline-flex min-h-9 items-center justify-center gap-2 border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-3 text-xs font-semibold text-[hsl(var(--primary-foreground))]" data-testid={`button-review-${task.id}`}>Review <ArrowRight size={13} /></Link>}</div></div>)}</div>}
  </>;
}

function EmptyState({ title, detail, icon }: { title: string; detail: string; icon: ReactNode }) {
  return <div className="border border-dashed border-border bg-card px-6 py-16 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center border border-border text-[hsl(var(--primary))]">{icon}</div><h2 className="font-serif text-2xl">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{detail}</p></div>;
}

function ParticipantsPage() {
  const { data, isLoading } = useListParticipants({ query: { queryKey: getListParticipantsQueryKey() } });
  const [search, setSearch] = useState('');
  const people = (data || samplePeople).filter((p) => p.pseudonym.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search));
  return <><SectionTitle eyebrow="02 / caseload" title="Participants" detail="Synthetic participant directory. Names are pseudonyms; continuity is reviewed, not inferred." action={<div className="relative"><Search size={15} className="absolute left-3 top-2.5 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a participant" className="focus-ring h-9 w-56 border border-border bg-card pl-9 pr-3 text-xs" data-testid="input-search-participants" /></div>} />{isLoading ? <LoadingRows /> : people.length === 0 ? <EmptyState title="No matching participants" detail="Try a pseudonym or participant reference." icon={<Search size={24} />} /> : <div className="border border-border bg-card"><div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_140px] border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground md:grid"><span>Participant</span><span>Latest observation</span><span>Continuity class</span><span>Contact restriction</span><span>Open record</span></div>{people.map((p) => <div key={p.id} className="table-row grid gap-3 border-b border-border p-4 last:border-0 md:grid-cols-[1.1fr_1fr_1fr_1fr_140px] md:items-center"><div><Link href={`/participants/${p.id}`} className="focus-ring font-semibold hover:underline" data-testid={`link-participant-${p.id}`}>{p.pseudonym}</Link><div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{p.id} · {p.status}</div></div><div className="text-sm">{p.lastObservationLabel}</div><div><Badge tone={p.latestClass === 'ATYPICAL_CHANGE' ? 'orange' : p.latestClass === 'SILENCE_REVIEW' ? 'quiet' : 'accent'}>{classLabel(p.latestClass)}</Badge><div className="mt-1 font-mono text-[10px] text-muted-foreground">observed index {p.latestScore}</div></div><div className="text-sm text-muted-foreground">{p.contactRestriction}</div><Link href={`/participants/${p.id}`} className="focus-ring inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] hover:underline" data-testid={`link-open-record-${p.id}`}>Open record <ArrowRight size={13} /></Link></div>)}</div>}</>;
}

function ParticipantPage() {
  const { role } = useRole();
  const { id = 'p-02' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetParticipantContinuity(id, { query: { enabled: !!id, queryKey: getGetParticipantContinuityQueryKey(id) } });
  const createEvent = useCreateCaseEvent();
  const createAction = useCreateAction();
  const qc = useQueryClient();
  const [eventOpen, setEventOpen] = useState(false);
  const [eventLabel, setEventLabel] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventSignificance, setEventSignificance] = useState(2);
  const [notice, setNotice] = useState('');
  const view = data || { participant: samplePeople.find((p) => p.id === id) || samplePeople[0], trajectory: [{ label: 'Mon', score: 3.8, baseline: 3.8, lowerBand: 3.1, upperBand: 4.5, classification: 'WITHIN_EXPECTED_RANGE', missing: false }, { label: 'Tue', score: 2.1, baseline: 3.8, lowerBand: 3.1, upperBand: 4.5, classification: 'ATYPICAL_CHANGE', missing: false }, { label: 'Wed', score: null, baseline: 3.8, lowerBand: 3.1, upperBand: 4.5, classification: 'WITHIN_EXPECTED_RANGE', missing: true }], timeline: [{ id: '1', label: 'Check-in observed', kind: 'EVENT', description: 'Sleep and appetite shifted from recent baseline.', significance: 2 }, { id: '2', label: 'Follow-up window', kind: 'FOLLOW_UP', description: 'No confirmation yet from the assigned worker.', significance: null }], signal: { classification: 'ATYPICAL_CHANGE', whatChanged: 'Observed index moved below the expected band.', context: 'A recent housing transition is recorded, but timing is not yet confirmed.', confidenceTier: 'Moderate', confidenceFactors: ['2 observations in current window', 'context event is 3 days old', 'no direct participant note'], actionLocked: false, taskId: 'RV-104', owner: null }, events: [{ id: 'e1', label: 'Housing transition', eventType: 'Context', status: 'Recorded', significance: 2, dateLabel: '14 Jun 2024' }], interventions: [{ id: 'a1', pathway: 'Text follow-up', outcome: 'Awaiting response', followUpLabel: 'Check again tomorrow', followUpDueLabel: 'Next scheduled check-in', followUpState: 'UNKNOWN', dateLabel: '17 Jun 2024' }] };
  const submitEvent = () => { if (!eventLabel.trim() || !eventDate.trim()) return; createEvent.mutate({ participantId: id, data: { label: eventLabel.trim(), eventType: eventLabel.trim().toUpperCase().replaceAll(' ', '_'), significance: eventSignificance, dateLabel: eventDate } }, { onSuccess: () => { setEventLabel(''); setEventDate(''); setEventSignificance(2); setEventOpen(false); setNotice('Case event added to the continuity record.'); qc.invalidateQueries({ queryKey: getGetParticipantContinuityQueryKey(id) }); qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); } }); };
  return <>{isLoading ? <LoadingRows count={6} /> : <><div className="mb-5 flex items-center justify-between"><Link href="/queue" className="focus-ring inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="link-back-queue"><ArrowLeft size={14} />Back to queue</Link><span className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Record / {id}</span></div>{isError && <div className="mb-5 border border-[hsl(var(--destructive)/.35)] p-4 text-sm">Continuity record is temporarily unavailable. <Button className="ml-3" onClick={() => refetch()} data-testid="button-retry-record">Retry</Button></div>}<div className="mb-8 grid gap-6 border-y border-border py-6 md:grid-cols-[1fr_auto]"><div><div className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">Participant continuity record</div><h1 className="font-serif text-5xl">{view.participant.pseudonym}</h1><div className="mt-3 flex flex-wrap items-center gap-2"><Badge tone="accent">{view.participant.status}</Badge><Badge>{view.participant.contactRestriction}</Badge><Badge tone="accent">Check-in: {classLabel(view.participant.checkinState)}</Badge><span className="font-mono text-[10px] text-muted-foreground">last observed {view.participant.lastObservationLabel}</span><span className="font-mono text-[10px] text-muted-foreground">next expected {new Date(view.participant.nextCheckinExpectedAt).toLocaleDateString()}</span></div></div><div className="flex items-end gap-2"><Link href={`/participant/check-in/${id}`} className="focus-ring button-line inline-flex min-h-9 items-center justify-center gap-2 border border-border bg-card px-3 text-xs font-semibold" data-testid="link-participant-checkin"><UserRound size={14} />Participant check-in</Link>{(role === 'LIAISON' || role === 'SUPERVISOR') && <Button onClick={() => setEventOpen(!eventOpen)} data-testid="button-add-event"><Plus size={14} />Add case event</Button>}<Button variant="solid" onClick={() => createAction.mutate({ data: { taskId: view.signal.taskId || 'manual', participantId: id, pathway: 'Human follow-up', outcome: 'CONTINUED_SUPPORT_REQUESTED', followUpLabel: 'Structured follow-up created', followUpDueLabel: 'Next scheduled check-in' } }, { onSuccess: () => { setNotice('Follow-up action recorded.'); qc.invalidateQueries({ queryKey: getGetParticipantContinuityQueryKey(id) }); qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); } })} disabled={createAction.isPending || !view.signal.taskId || !view.signal.owner || view.signal.actionLocked} data-testid="button-record-followup"><Flag size={14} />Record follow-up</Button></div></div>{eventOpen && <div className="mb-6 flex flex-wrap gap-3 border border-[hsl(var(--accent)/.45)] bg-[hsl(var(--accent)/.07)] p-4"><input value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} placeholder="Event label, e.g. temporary accommodation" className="focus-ring h-9 min-w-64 flex-1 border border-border bg-card px-3 text-sm" data-testid="input-case-event" /><input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="DD MMM YYYY � HH:mm" className="focus-ring h-9 w-40 border border-border bg-card px-3 text-sm" /><select value={eventSignificance} onChange={(e) => setEventSignificance(Number(e.target.value))} className="focus-ring h-9 border border-border bg-card px-3 text-sm"><option value={1}>1 - Ordinary</option><option value={2}>2 - Meaningful</option><option value={3}>3 - Major</option></select><Button variant="solid" onClick={submitEvent} disabled={createEvent.isPending} data-testid="button-save-event"><Check size={14} />Save event</Button><Button onClick={() => setEventOpen(false)} data-testid="button-cancel-event">Cancel</Button></div>}{notice && <div className="mb-5 border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.06)] px-3 py-2 text-xs text-[hsl(var(--primary))]" data-testid="status-record-success"><CheckCircle2 size={14} className="mr-2 inline" />{notice}</div>}<div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]"><div className="space-y-6"><Trajectory points={view.trajectory} /><Timeline items={view.timeline} /><div className="border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Case events</h2><span className="font-mono text-[10px] text-muted-foreground">{view.events.length} recorded</span></div><div className="space-y-3">{view.events.map((e) => <div key={e.id} className="grid grid-cols-[95px_1fr_auto] gap-3 border-t border-border pt-3 text-sm"><span className="font-mono text-[10px] text-muted-foreground">{e.dateLabel}</span><span><strong>{e.label}</strong><span className="ml-2 text-xs text-muted-foreground">{e.eventType}</span></span><Badge>{e.status}</Badge></div>)}</div></div>{view.interventions.length > 0 && <div className="border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Actions & follow-up</h2><span className="font-mono text-[10px] text-muted-foreground">{view.interventions.length} recorded</span></div><div className="space-y-3">{view.interventions.map((action) => <div key={action.id} className="border-t border-border pt-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{action.pathway}</strong><Badge tone="accent">{classLabel(action.followUpState)}</Badge></div><p className="mt-1 text-muted-foreground">{action.outcome} · {action.followUpLabel}</p><p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">Due {action.followUpDueLabel} · recorded {action.dateLabel}</p></div>)}</div></div>}</div><ReviewPanel participantId={id} signal={view.signal} /></div></>}</>;
}

function Trajectory({ points }: { points: Array<{ label: string; score: number | null; baseline: number; lowerBand: number; upperBand: number; classification: string; missing: boolean }> }) {
  const max = Math.max(...points.map((p) => p.upperBand), 5);
  return <div className="border border-border bg-card p-5"><div className="mb-5 flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Observed trajectory</div><h2 className="mt-1 font-serif text-2xl">Against expected context</h2></div><div className="flex gap-3 font-mono text-[9px] uppercase tracking-[.1em] text-muted-foreground"><span className="flex items-center gap-1"><i className="h-2 w-2 bg-[hsl(var(--primary))]" />observed</span><span className="flex items-center gap-1"><i className="h-2 w-2 border border-[hsl(var(--accent))]" />expected band</span><span className="flex items-center gap-1"><i className="h-px w-3 bg-muted-foreground" />baseline</span></div></div><div className="flex h-48 items-end gap-2 border-b border-l border-border px-3 pb-0 pt-5">{points.map((p) => { const h = p.score === null ? 0 : (p.score / max) * 100; const bandBottom = (p.lowerBand / max) * 100; const bandHeight = ((p.upperBand - p.lowerBand) / max) * 100; const baselinePos = (p.baseline / max) * 100; return <div key={p.label} className="relative flex h-full flex-1 flex-col justify-end"><div className="absolute w-full border-y border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.1)]" style={{ bottom: `${bandBottom}%`, height: `${bandHeight}%` }} /><div className="absolute w-[calc(100%+0.5rem)] -left-[0.25rem] border-t border-[hsl(var(--foreground)/.4)] z-0" style={{ bottom: `${baselinePos}%` }} /><div className={`relative z-10 mx-auto w-5 ${p.missing ? 'border border-dashed border-muted-foreground bg-transparent' : p.classification === 'ATYPICAL_CHANGE' ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'}`} style={{ height: `${Math.max(h, 3)}%` }} title={p.score === null ? 'Missing observation' : `Observed index ${p.score}`} /> <span className="mt-2 text-center font-mono text-[10px] text-muted-foreground">{p.label}</span></div>; })}</div><div className="mt-4 flex justify-between text-[10px] text-muted-foreground"><span>0 · lower observed index</span><span>5 · higher observed index</span></div></div>;
}

function Timeline({ items }: { items: Array<{ id: string; label: string; kind: string; description: string; significance?: number | null }> }) {
  return <div className="border border-border bg-card p-5"><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">Continuity log</div><h2 className="mt-1 font-serif text-2xl">What is known</h2></div><History size={18} className="text-muted-foreground" /></div><div className="ml-2 border-l border-[hsl(var(--accent)/.5)]">{items.map((item) => <div key={item.id} className="relative pl-6 pb-5 last:pb-0"><span className="absolute -left-[5px] top-1 h-2 w-2 bg-[hsl(var(--accent))]" /><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{item.label}</strong><Badge tone="quiet">{classLabel(item.kind)}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>)}</div></div>;
}

function ReviewPanel({ participantId, signal }: { participantId: string; signal: { classification: string; whatChanged: string; context: string; confidenceTier: string; confidenceFactors: string[]; actionLocked: boolean; taskId: string | null; owner?: string | null } }) {
  const { role } = useRole();
  const qc = useQueryClient();
  const take = useTakeTaskOwnership();
  const decide = useDecideTask();
  const createAction = useCreateAction();
  const [mode, setMode] = useState<'review' | 'act'>('review');
  const [pathway, setPathway] = useState('Facilitated connection');
  const [outcome, setOutcome] = useState('CONTINUED_SUPPORT_REQUESTED');
  const [notice, setNotice] = useState('');
  const canReview = Boolean(signal.taskId);
  const refresh = () => {
    if (signal.taskId) qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getGetParticipantContinuityQueryKey(participantId) });
    qc.invalidateQueries({ queryKey: getGetWorkspaceQueryKey() });
  };
  const takeOwnership = () => {
    if (!signal.taskId) return;
    take.mutate({ taskId: signal.taskId, data: { owner: role.toLowerCase() + '-01' } }, {
      onSuccess: () => { setNotice('Ownership recorded. Action pathways are now available.'); refresh(); },
    });
  };
  const recordDecision = (decision: any) => {
    if (!signal.taskId) return;
    decide.mutate({ taskId: signal.taskId, data: { decision, rationale: decision === 'LOG_CONTACT' ? 'Contacted via registered safe channel.' : 'Reviewed by assigned worker.' } }, {
      onSuccess: () => { setNotice('Review decision recorded in the audit chain.'); refresh(); },
    });
  };
  const recordAction = () => {
    if (!signal.taskId) return;
    createAction.mutate({ data: { taskId: signal.taskId, participantId, pathway, outcome, followUpLabel: 'Structured follow-up created', followUpDueLabel: 'Next scheduled check-in' } }, {
      onSuccess: () => { setNotice('Action and follow-up recorded.'); setMode('review'); refresh(); },
    });
  };
  return <aside className="border border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.05)] p-5"><div className="mb-5 flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">Contextual review</div><h2 className="mt-1 font-serif text-2xl">Human reading required</h2></div><Activity size={18} className="text-[hsl(var(--accent-foreground))]" /></div><Badge tone={signal.classification === 'ATYPICAL_CHANGE' ? 'orange' : 'accent'}>{classLabel(signal.classification)}</Badge><div className="mt-5 space-y-4 text-sm"><div><label className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">What changed</label><p className="mt-1 leading-6">{signal.whatChanged}</p></div><div><label className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Context to consider</label><p className="mt-1 leading-6">{signal.context}</p></div><div className="border-t border-[hsl(var(--primary)/.18)] pt-4"><label className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Confidence: {signal.confidenceTier}</label><ul className="mt-2 space-y-2 text-xs text-muted-foreground">{signal.confidenceFactors.map((f) => <li key={f} className="flex gap-2"><span className="text-[hsl(var(--accent-foreground))]">—</span>{f}</li>)}</ul></div></div><div className="mt-5 border-t border-[hsl(var(--primary)/.18)] pt-4 text-xs text-muted-foreground">{signal.actionLocked && !signal.owner ? 'Unowned task. Take ownership before selecting a pathway.' : signal.actionLocked ? 'Action recorded. Follow-up remains visible on the continuity record.' : 'This signal is ready for a human decision.'}<div className="mt-2 font-mono text-[10px] uppercase">Task {signal.taskId || 'not assigned'} · {signal.owner || 'unowned'}</div></div>{canReview && signal.actionLocked && !signal.owner && <Button variant="solid" className="mt-5 w-full" onClick={takeOwnership} disabled={take.isPending} data-testid="button-review-take-ownership">{take.isPending ? 'Taking ownership…' : 'Take ownership'}</Button>}{canReview && !signal.actionLocked && mode === 'review' && (signal.classification !== 'ATYPICAL_CHANGE' || role === 'COUNSELLOR' || role === 'SUPERVISOR') && <div className="mt-5 grid gap-2 border-t border-[hsl(var(--primary)/.18)] pt-4"><div className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Choose a human pathway</div><div className="flex flex-wrap gap-2"><Button variant="solid" onClick={() => setMode('act')} data-testid="button-review-act">Act</Button><Button onClick={() => recordDecision('DISMISS')} disabled={decide.isPending} data-testid="button-review-dismiss">Dismiss</Button>{role !== 'SUPERVISOR' && <Button onClick={() => recordDecision('ESCALATE')} disabled={decide.isPending} data-testid="button-review-escalate">Escalate</Button>}
   {role === 'SUPERVISOR' && <Button onClick={() => recordDecision('RESOLVE')} disabled={decide.isPending} data-testid="button-review-resolve">Resolve Escalation</Button>}
   {role === 'SUPERVISOR' && <Button onClick={() => recordDecision('RETURN')} disabled={decide.isPending} data-testid="button-review-return">Return to Worker</Button>}{signal.classification === 'SILENCE_REVIEW' && <><Button onClick={() => recordDecision('LOG_CONTACT')} disabled={decide.isPending} data-testid="button-review-log-contact">Log safe contact</Button><Button onClick={() => recordDecision('PLAN_RETRY')} disabled={decide.isPending} data-testid="button-review-plan-retry">Plan retry</Button></>}</div></div>}{mode === 'act' && <div className="mt-5 grid gap-3 border-t border-[hsl(var(--primary)/.18)] pt-4"><label className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Context-typed pathway<select className="focus-ring mt-2 h-10 w-full border border-border bg-card px-2 text-sm" value={pathway} onChange={(e) => setPathway(e.target.value)}><option>Facilitated connection</option><option>Legal accompaniment support</option><option>Worker check-in</option></select></label><label className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Outcome<select className="focus-ring mt-2 h-10 w-full border border-border bg-card px-2 text-sm" value={outcome} onChange={(e) => setOutcome(e.target.value)}><option>Planned</option><option>Participant accepted</option><option>Unable to reach</option></select></label><div className="flex gap-2"><Button variant="solid" onClick={recordAction} disabled={createAction.isPending} data-testid="button-execute-action">{createAction.isPending ? 'Recording…' : 'Record action & follow-up'}</Button><Button onClick={() => setMode('review')}>Back</Button></div></div>}{notice && <div className="mt-4 border border-[hsl(var(--primary)/.3)] bg-card px-3 py-2 text-xs" data-testid="status-review-success">{notice}</div>}</aside>;
}


function EnrollmentPage() {
  const { participantId = 'p-04' } = useParams<{ participantId?: string }>();
  const [consentGranted, setConsentGranted] = useState(false);
  const [contactRestriction, setContactRestriction] = useState('Normal contact');
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: pSummary, isLoading } = useQuery({
    queryKey: ['participantSettings', participantId],
    queryFn: () => customFetch(`/api/participants/${participantId}/settings`) as Promise<any>
  });

  const mutation = useMutation({
    mutationFn: (data: any) => customFetch(`/api/participants/${participantId}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participantSettings', participantId] });
      navigate(`/participant/check-in/${participantId}`);
    }
  });

  if (isLoading) return <ParticipantFrame><LoadingRows /></ParticipantFrame>;

  if (pSummary?.enrollmentState === 'ACTIVE') {
    return <ParticipantFrame>
      <div className="mx-auto max-w-xl text-center py-12">
        <h1 className="font-serif text-4xl mb-4">You are already enrolled.</h1>
        <Button onClick={() => navigate(`/participant/check-in/${participantId}`)} variant="solid">Continue to check-in</Button>
      </div>
    </ParticipantFrame>;
  }

  return <ParticipantFrame>
    <div className="mx-auto max-w-xl">
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Enrollment & Consent</p>
      <h1 className="mt-3 font-serif text-5xl mb-6">Welcome to Nirantar</h1>
      <div className="prose prose-sm text-muted-foreground mb-8"><p>This is a synthetic continuity engine designed to monitor wellbeing over time. Before we begin, you need to understand how this system works and provide consent.</p><ul className="list-disc pl-5 mt-4 space-y-2"><li><strong>What this is for:</strong> Regular check-ins help us understand how you are doing as your case progresses.</li><li><strong>What is collected:</strong> We collect your responses to check-in questions and use them to observe your trajectory.</li><li><strong>Voluntary:</strong> Your participation is entirely voluntary. You can stop check-ins at any time.</li><li><strong>No Diagnosis:</strong> This system does NOT diagnose conditions. It identifies changes and signals human reviewers.</li><li><strong>Human Review:</strong> If your check-in suggests a meaningful change or if you stop responding, a human support worker will review your case.</li></ul></div>
      <div className="mt-8 space-y-4">
        <SettingRow title="I understand and consent" detail="I agree to participate in the continuity engine and allow my check-ins to be reviewed by the support team." on={consentGranted} action={<Button onClick={() => setConsentGranted(!consentGranted)} data-testid="button-toggle-consent">{consentGranted ? 'Revoke' : 'Consent'}</Button>} />
        <SettingRow title="Safety and contact preferences" detail="If a safety review is required (e.g. if you stop responding), the team will use this rule." on={true} action={<select className="border border-border bg-card px-2 py-1 text-xs outline-none" value={contactRestriction} onChange={(e) => setContactRestriction(e.target.value)}><option value="Normal contact">Normal contact</option><option value="Discreet contact only">Discreet contact only</option><option value="No automated contact">No automated contact</option></select>} />
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="font-serif text-2xl">Complete enrollment</h2>
        <Button variant="solid" className="mt-4" onClick={() => mutation.mutate({ consentStatus: 'GRANTED', contactRestriction })} disabled={!consentGranted || mutation.isPending} data-testid="button-complete-enrollment"><Check size={14} />{mutation.isPending ? 'Saving...' : 'Complete Enrollment'}</Button>
      </div>
    </div>
  </ParticipantFrame>;
}

function CheckinPage() {
  const { participantId = 'p-01' } = useParams<{ participantId?: string }>();
  const submit = useSubmitParticipantCheckin();
  const [responses, setResponses] = useState<number[]>([3, 3, 3, 3, 3]);
  const [safety, setSafety] = useState('PREFER_NOT_TO_SAY');
  const [done, setDone] = useState(false);
  const questions = ['How manageable has today felt?', 'How has your sleep been?', 'How supported do you feel?', 'How steady has your energy been?', 'How connected do you feel to your usual routine?'];
  
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const { data: pSummary, isLoading } = useQuery({
    queryKey: ['participantSettings', participantId],
    queryFn: () => customFetch(`/api/participants/${participantId}/settings`) as Promise<any>
  });

  useEffect(() => {
    if (pSummary?.enrollmentState === 'INVITED') {
      navigate(`/participant/enrollment/${participantId}`, { replace: true });
    }
  }, [pSummary, navigate, participantId]);

  if (isLoading || pSummary?.enrollmentState === 'INVITED') return <ParticipantFrame><LoadingRows /></ParticipantFrame>;

  if (done) return <ParticipantFrame><div className="mx-auto max-w-md py-12 text-center"><div className="mx-auto mb-6 grid h-16 w-16 place-items-center border border-[hsl(var(--primary)/.4)] text-[hsl(var(--primary))]"><CheckCircle2 size={32} /></div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Check-in received</p><h1 className="mt-3 font-serif text-4xl">Thank you for telling us.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Your answers were recorded for your support team to review. This page does not make decisions about your care.</p><div className="mt-8 border border-border bg-card p-4 text-left text-xs text-muted-foreground"><strong className="text-foreground">If you need immediate help</strong><p className="mt-1">Use your agreed safety contact or local emergency support. This check-in is not monitored continuously.</p></div></div></ParticipantFrame>;
  return <ParticipantFrame><div className="mx-auto max-w-xl"><div className="mb-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Private participant check-in · {participantId}</p><h1 className="mt-3 font-serif text-5xl leading-none">How are things sitting today?</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">There are no right answers. Choose the number that is closest to how it has felt for you. Your support worker will review this with other context.</p></div><div className="space-y-3">{questions.map((q, qi) => <div key={q} className="border border-border bg-card p-4"><div className="mb-3 flex gap-3"><span className="font-mono text-[10px] text-muted-foreground">0{qi + 1}</span><p className="text-sm font-medium">{q}</p></div><div className="grid grid-cols-6 gap-1">{[0, 1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setResponses((r) => r.map((v, i) => i === qi ? n : v))} className={`focus-ring h-9 border text-xs ${responses[qi] === n ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-border hover:bg-muted'}`} data-testid={`button-response-${qi}-${n}`}>{n}</button>)}</div><div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground"><span>not at all</span><span>very much</span></div></div>)}</div><div className="mt-7 border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.08)] p-4"><div className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 text-[hsl(var(--accent-foreground))]" /><div><h2 className="text-sm font-semibold">A separate safety question</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Do you feel unsafe right now, or need someone to contact you urgently?</p><div className="mt-3 flex flex-wrap gap-2">{[['YES', 'Yes'], ['NO', 'No'], ['PREFER_NOT_TO_SAY', 'Prefer not to say']].map(([v, l]) => <button key={v} onClick={() => setSafety(v)} className={`focus-ring border px-3 py-2 text-xs ${safety === v ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.18)]' : 'border-border bg-card'}`} data-testid={`button-safety-${v.toLowerCase()}`}>{l}</button>)}</div></div></div></div><Button variant="solid" className="mt-6 w-full py-3" onClick={() => submit.mutate({ data: { participantId, responses, safetyResponse: safety as never } }, { onSuccess: () => setDone(true) })} disabled={submit.isPending} data-testid="button-submit-checkin">{submit.isPending ? 'Recording…' : 'Submit check-in'} <Send size={14} /></Button><p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">You can leave this page without submitting</p></div></ParticipantFrame>;
}

function ParticipantFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><div className="synthetic-banner">SYNTHETIC DATA — MVP ENVIRONMENT</div><header className="border-b border-border bg-[hsl(var(--primary))] px-5 py-4 text-[hsl(var(--primary-foreground))]"><div className="mx-auto flex max-w-xl items-center justify-between"><Link href="/" className="focus-ring flex items-center gap-2 text-xs font-semibold tracking-[.24em]" data-testid="link-participant-logo"><span className="grid h-7 w-7 place-items-center border border-[hsl(var(--primary-foreground)/.45)] font-serif text-lg">N</span>NIRANTAR</Link><span className="font-mono text-[9px] uppercase tracking-[.16em] opacity-65">Participant view</span></div></header><main className="px-5 py-8">{children}</main></div>;
}

function SettingsPage() {
  const [paused, setPaused] = useState(false);
  const [saved, setSaved] = useState(false);
  return <ParticipantFrame><div className="mx-auto max-w-xl"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Participant settings</p><h1 className="mt-3 font-serif text-5xl">Your choices</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">You decide what this check-in is used for. These settings are visible to your support team.</p><div className="mt-8 space-y-3"><SettingRow title="Continuity notes" detail="Allow your check-ins to sit alongside agreed case context." on={true} /><SettingRow title="Contact if a safety answer needs follow-up" detail="Your support team may use your agreed contact route." on={!paused} /><SettingRow title="Pause check-ins" detail="Temporarily stop receiving check-in prompts. You can return here to resume." on={paused} action={<Button onClick={() => setPaused(!paused)} data-testid="button-toggle-pause">{paused ? 'Resume' : 'Pause'}</Button>} /></div><div className="mt-8 border-t border-border pt-6"><h2 className="font-serif text-2xl">Save changes</h2><p className="mt-2 text-sm text-muted-foreground">Settings are only applied after you confirm.</p><Button variant="solid" className="mt-4" onClick={() => setSaved(true)} data-testid="button-save-settings"><Check size={14} />{saved ? 'Saved' : 'Confirm settings'}</Button>{saved && <p className="mt-3 text-xs text-[hsl(var(--primary))]" data-testid="status-settings-saved">Your preferences were updated.</p>}</div></div></ParticipantFrame>;
}
function SettingRow({ title, detail, on, action }: { title: string; detail: string; on: boolean; action?: ReactNode }) { return <div className="flex items-start justify-between gap-4 border border-border bg-card p-4"><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></div><div className="flex shrink-0 items-center gap-3">{action || <span className={`h-3 w-3 border ${on ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]' : 'border-muted-foreground'}`} />}</div></div>; }


function EscalationsPage() {
  const { data, isLoading } = useListTasks(undefined, { query: { queryKey: getListTasksQueryKey() } });
  const qc = useQueryClient();
  const tasks = (data || sampleTasks).filter((t) => t.status === 'ESCALATED');
  return <><SectionTitle eyebrow="02 / oversight" title="Supervisor escalations" detail="Tasks escalated by originating workers requiring supervisor review." />
    {isLoading ? <LoadingRows /> : tasks.length === 0 ? <EmptyState title="No escalations" detail="There are currently no tasks escalated for supervisor review." icon={<CheckCircle2 size={28} />} /> : <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="table-row grid gap-4 border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.05)] p-4 md:grid-cols-[150px_1fr_150px] md:items-center">
      <div><Badge tone="danger">ESCALATED</Badge><div className="mt-2 text-xs font-mono text-muted-foreground">{task.id}</div></div>
      <div>
        <Link href={`/participants/${task.participantId}`} className="focus-ring font-semibold hover:underline text-[hsl(var(--destructive))]">{task.pseudonym}</Link>
        <p className="mt-1 text-sm text-muted-foreground">{task.summary}</p>
        <p className="mt-2 text-xs"><strong>Escalation reason:</strong> {task.escalationReason || 'No rationale provided'}</p>
        <p className="mt-1 text-[10px] font-mono text-muted-foreground">Originating worker: {(task as any).assignedWorker || 'Unknown'}</p>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <Link href={`/participants/${task.participantId}`} className="focus-ring button-line inline-flex min-h-9 items-center justify-center gap-2 border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-3 text-xs font-semibold text-[hsl(var(--primary-foreground))]">Review escalation <ArrowRight size={13} /></Link>
      </div>
    </div>)}</div>}
  </>;
}

function OperationsPage() {
  const { data: workspace } = useGetWorkspace();
  const counts = workspace?.counts || { openTasks: 3, unownedTasks: 1, participants: 24, followUps: 7 };
  return <><SectionTitle eyebrow="03 / oversight" title="Operations" detail="A compact view of workload, ownership, and follow-up — not a measure of participant risk." /><div className="grid gap-px border border-border bg-border md:grid-cols-4">{[['Open tasks', counts.openTasks, 'human review queue'], ['Unowned', counts.unownedTasks, 'need an owner'], ['Participants', counts.participants, 'synthetic caseload'], ['Follow-ups', counts.followUps, 'scheduled or pending']].map(([label, value, detail]) => <div key={label as string} className="bg-card p-5"><span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">{label}</span><strong className="mt-4 block font-serif text-5xl">{value as number}</strong><span className="mt-2 block text-xs text-muted-foreground">{detail}</span></div>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Workload by state</h2><SlidersHorizontal size={16} className="text-muted-foreground" /></div>{[['Open and unowned', counts.unownedTasks, 'Assign before review'], ['Owned in progress', Math.max(1, counts.openTasks - counts.unownedTasks), 'Within assigned team'], ['Follow-up due', counts.followUps, 'Check completion trail']].map(([label, value, note]) => <div key={label as string} className="border-t border-border py-4"><div className="flex justify-between text-sm"><span>{label}</span><strong>{value as number}</strong></div><div className="mt-2 h-2 bg-muted"><div className="h-full bg-[hsl(var(--primary))]" style={{ width: `${Math.min(100, Number(value) / Math.max(counts.openTasks, 1) * 100)}%` }} /></div><div className="mt-1 font-mono text-[10px] text-muted-foreground">{note}</div></div>)}</div><div className="border border-border bg-card p-5"><h2 className="font-serif text-2xl">Review discipline</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Signals are not decisions. Every attention item remains attributable to a person, a context window, and a recorded action.</p><div className="mt-6 space-y-3 text-xs"><div className="flex gap-3 border-t border-border pt-3"><ShieldCheck size={16} className="text-[hsl(var(--primary))]" /><span>Human ownership is visible before action.</span></div><div className="flex gap-3 border-t border-border pt-3"><BookOpen size={16} className="text-[hsl(var(--primary))]" /><span>Context is shown beside the observed change.</span></div><div className="flex gap-3 border-t border-border pt-3"><History size={16} className="text-[hsl(var(--primary))]" /><span>Decisions remain in the audit chain.</span></div></div></div></div></>;
}

function AuditPage() {
  const verify = useVerifyAudit();
  const [result, setResult] = useState<{ status: string; message: string; checkedRows: number; firstFailingSequence: number | null } | null>(null);
  return <><SectionTitle eyebrow="04 / provenance" title="Audit chain" detail="Verify that synthetic case events and human decisions have not been altered." action={<Button variant="solid" onClick={() => verify.mutate({ data: { simulateTamper: false } }, { onSuccess: setResult })} disabled={verify.isPending} data-testid="button-verify-audit"><FileCheck2 size={14} />{verify.isPending ? 'Checking…' : 'Verify chain'}</Button>} /><div className={`border p-6 ${result?.status === 'FAIL' ? 'border-[hsl(var(--destructive)/.45)] bg-[hsl(var(--destructive)/.06)]' : result?.status === 'PASS' ? 'border-[hsl(var(--primary)/.4)] bg-[hsl(var(--primary)/.06)]' : 'border-border bg-card'}`} data-testid="status-audit-result">{result ? <><div className="flex items-center gap-3">{result.status === 'PASS' ? <CheckCircle2 className="text-[hsl(var(--primary))]" /> : <XCircle className="text-[hsl(var(--destructive))]" />}<h2 className="font-serif text-3xl">{result.status === 'PASS' ? 'Chain verified' : 'Verification failed'}</h2></div><p className="mt-3 text-sm">{result.message}</p><div className="mt-5 flex gap-6 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground"><span>{result.checkedRows} rows checked</span>{result.firstFailingSequence && <span>first failing sequence {result.firstFailingSequence}</span>}</div></> : <><div className="flex items-center gap-3"><LockKeyhole className="text-muted-foreground" /><h2 className="font-serif text-3xl">Chain not yet checked</h2></div><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">The audit chain links event provenance, task ownership, and decisions. Run verification before treating the current ledger as complete.</p></>}</div><div className="mt-6 border border-border bg-card p-5"><h2 className="font-serif text-2xl">What verification covers</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{['Sequence continuity', 'Record signatures', 'Decision attribution'].map((x) => <div key={x} className="border-t border-border pt-3 text-sm"><Check size={14} className="mb-2 text-[hsl(var(--primary))]" />{x}<p className="mt-1 text-xs text-muted-foreground">Synthetic ledger check</p></div>)}</div></div></>;
}

function SimulationPage() {
  const control = useControlSimulation();
  const qc = useQueryClient();
  const [notice, setNotice] = useState('');
  const run = (action: string) => control.mutate({ data: { action: action as never } }, { onSuccess: (workspace) => { setNotice(`Scenario loaded: ${classLabel(workspace.activeScenario)} · ${workspace.clockLabel}`); qc.invalidateQueries(); } });
  return <><SectionTitle eyebrow="05 / demonstration" title="Simulation controls" detail="Move the synthetic workspace through a known scenario. This does not affect live records." /><div className="grid gap-6 lg:grid-cols-[1fr_.8fr]"><div className="border border-border bg-card p-6"><div className="mb-5 flex items-center gap-3"><Gauge size={18} className="text-[hsl(var(--accent-foreground))]" /><h2 className="font-serif text-2xl">Load a scenario</h2></div><div className="grid gap-2 md:grid-cols-3">{[['LOAD_BASELINE', 'Baseline', 'Expected observations'], ['LOAD_ATYPICAL', 'Atypical', 'Context needs review'], ['LOAD_SILENCE', 'Silence', 'Missingness needs review']].map(([a, label, detail]) => <button key={a} onClick={() => run(a)} className="focus-ring border border-border p-4 text-left hover:border-[hsl(var(--primary)/.5)] hover:bg-secondary" data-testid={`button-scenario-${label.toLowerCase()}`}><span className="block text-sm font-semibold">{label}</span><span className="mt-2 block text-xs text-muted-foreground">{detail}</span></button>)}</div>{notice && <div className="mt-5 border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.06)] p-3 text-xs" data-testid="status-simulation-success"><Check size={14} className="mr-2 inline text-[hsl(var(--primary))]" />{notice}</div>}</div><div className="border border-border bg-card p-6"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Demo clock</div><div className="mt-3 flex items-center gap-3"><Clock3 size={20} /><span className="font-serif text-3xl">Tue 18 Jun</span></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Advance the clock to create the next review window, or reset to the scenario starting point.</p><div className="mt-5 flex gap-2"><Button onClick={() => run('ADVANCE_CLOCK')} data-testid="button-advance-clock"><Play size={14} />Advance clock</Button><Button onClick={() => run('RESET')} data-testid="button-reset-simulation"><RefreshCw size={14} />Reset</Button></div></div></div></>;
}


function ProtectedParticipantRoute({ children, targetId }: { children: ReactNode, targetId: string }) {
  const { role, participantId } = useRole();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // If they are a participant and trying to access someone else's stuff, redirect them to their own stuff
    if (role === 'PARTICIPANT' && participantId !== targetId) {
      navigate(`/participant/check-in/${participantId}`, { replace: true });
    }
  }, [role, participantId, targetId, navigate]);
  
  if (role === 'PARTICIPANT' && participantId !== targetId) return null;
  
  return <>{children}</>;
}

function ProtectedWorkerRoute({ children, allowed }: { children: ReactNode, allowed?: string[] }) {
  const { role, participantId } = useRole();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (role === 'PARTICIPANT') {
      navigate(`/participant/check-in/${participantId}`, { replace: true });
    } else if (allowed && !allowed.includes(role)) {
      navigate('/queue', { replace: true });
    }
  }, [role, navigate, allowed, participantId]);
  
  if (role === 'PARTICIPANT') return null;
  if (allowed && !allowed.includes(role)) return null;
  return <>{children}</>;
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/queue"><ProtectedWorkerRoute><Shell><QueuePage /></Shell></ProtectedWorkerRoute></Route><Route path="/participants" ><ProtectedWorkerRoute><Shell><ParticipantsPage /></Shell></ProtectedWorkerRoute></Route><Route path="/participants/:id"><ProtectedWorkerRoute><Shell><ParticipantPage /></Shell></ProtectedWorkerRoute></Route><Route path="/participant/enrollment/:participantId">
    {(params) => <ProtectedParticipantRoute targetId={params.participantId}><EnrollmentPage /></ProtectedParticipantRoute>}
  </Route>
        <Route path="/participant/check-in/:participantId">
    {(params) => <ProtectedParticipantRoute targetId={params.participantId}><CheckinPage /></ProtectedParticipantRoute>}
  </Route><Route path="/participant/check-in">
    <ProtectedWorkerRoute><CheckinPage /></ProtectedWorkerRoute>
  </Route><Route path="/participant/settings">
    <ProtectedWorkerRoute><SettingsPage /></ProtectedWorkerRoute>
  </Route><Route path="/operations"><ProtectedWorkerRoute><Shell><OperationsPage /></Shell></ProtectedWorkerRoute></Route>
     <Route path="/escalations"><ProtectedWorkerRoute allowed={["SUPERVISOR"]}><Shell><EscalationsPage /></Shell></ProtectedWorkerRoute></Route><Route path="/audit"><ProtectedWorkerRoute allowed={["SUPERVISOR"]}><Shell><AuditPage /></Shell></ProtectedWorkerRoute></Route><Route path="/simulation"><ProtectedWorkerRoute><Shell><SimulationPage /></Shell></ProtectedWorkerRoute></Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;