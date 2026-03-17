'use client';

import { useMemo, useState } from 'react';
import { id } from '@instantdb/react';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { db } from '@/lib/db';
import { useMyProfile } from '@/lib/profile';

type TimeBlock = 'morning' | 'afternoon' | 'evening';
const BLOCKS: TimeBlock[] = ['morning', 'afternoon', 'evening'];

type ProfileLite = { id: string; displayName?: string; contact?: string; uniformSize?: string; notes?: string; role?: string };
type Shift = {
  id: string;
  eventName: string;
  date: Date;
  timeBlock: TimeBlock;
  location: string;
  meetupDetails: string;
  status: string;
  assignedProfile?: ProfileLite | null;
};
type SwapRequest = {
  id: string;
  status: string;
  shift?: Shift | null;
  fromProfile?: ProfileLite | null;
  toProfile?: ProfileLite | null;
};

function formatDate(d: unknown) {
  try {
    const date = d instanceof Date ? d : new Date(d as string);
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return String(d);
  }
}

export default function ManagerPage() {
  return (
    <AppShell>
      <RequireAuth>
        <ManagerInner />
      </RequireAuth>
    </AppShell>
  );
}

function ManagerInner() {
  const { profile, profiles, isLoading: profileLoading } = useMyProfile();
  const { data, isLoading, error } = db.useQuery({
    shifts: { assignedProfile: {} },
    swapRequests: { shift: {}, fromProfile: {}, toProfile: {} },
  });

  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'idle' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  const shifts = useMemo(() => (data?.shifts ?? []) as unknown as Shift[], [data?.shifts]);
  const swaps = useMemo(() => (data?.swapRequests ?? []) as unknown as SwapRequest[], [data?.swapRequests]);

  const pendingApprovals = useMemo(() => swaps.filter((r) => r.status === 'claimed'), [swaps]);

  const [draft, setDraft] = useState({
    eventName: '',
    date: '',
    timeBlock: 'evening' as TimeBlock,
    location: '',
    meetupDetails: '',
    assignedProfileId: '',
  });

  if (profileLoading || isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  if (!profile || profile.role !== 'manager') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-medium text-amber-900">Manager access only</p>
        <p className="mt-1 text-sm text-amber-800">
          Your profile role is not set to <span className="font-medium">manager</span>. Go to Profile and change your role (MVP/demo),
          then come back.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
        <h1 className="text-2xl font-semibold tracking-tight">Manager schedule builder</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Create shifts, assign servers, publish the schedule, and approve swaps.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error.message}</div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold">Create a shift</h2>
          <p className="mt-2 text-sm text-zinc-600">
            V1 assumes one assigned server per shift. You can extend this later.
          </p>

          <div className="mt-4 grid gap-3">
            <Field label="Event name">
              <input
                value={draft.eventName}
                onChange={(e) => setDraft((d) => ({ ...d, eventName: e.target.value }))}
                placeholder="Fundraising dinner"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
              />
            </Field>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Date">
                <input
                  value={draft.date}
                  onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                  type="date"
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
                />
              </Field>
              <Field label="Time block">
                <select
                  value={draft.timeBlock}
                  onChange={(e) => setDraft((d) => ({ ...d, timeBlock: e.target.value as TimeBlock }))}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
                >
                  {BLOCKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="Trabants Multipurpose Room"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
              />
            </Field>

            <Field label="Meetup details">
              <input
                value={draft.meetupDetails}
                onChange={(e) => setDraft((d) => ({ ...d, meetupDetails: e.target.value }))}
                placeholder="Meet at storeroom at 5:15 PM"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
              />
            </Field>

            <Field label="Assign server (optional)">
              <select
                value={draft.assignedProfileId}
                onChange={(e) => setDraft((d) => ({ ...d, assignedProfileId: e.target.value }))}
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
              >
                <option value="">— Unassigned —</option>
                {(profiles as unknown as ProfileLite[])
                  .filter((p) => p.role !== 'manager')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName || p.contact || p.id} • {p.uniformSize || '—'} • {p.notes ? 'has notes' : 'no notes'}
                    </option>
                  ))}
              </select>
              <p className="mt-2 text-xs text-zinc-500">You’ll see uniform size and whether notes exist in the dropdown.</p>
            </Field>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={creating || !draft.eventName || !draft.date || !draft.location}
                onClick={async () => {
                  setCreating(true);
                  setMsg({ kind: 'idle' });
                  try {
                    const shiftId = id();
                    const txs: unknown[] = [
                      db.tx.shifts[shiftId].create({
                        eventName: draft.eventName.trim(),
                        date: new Date(draft.date),
                        timeBlock: draft.timeBlock,
                        location: draft.location.trim(),
                        meetupDetails: draft.meetupDetails.trim(),
                        status: 'draft',
                      }),
                    ];
                    if (draft.assignedProfileId) {
                      txs.push(db.tx.shifts[shiftId].link({ assignedProfile: draft.assignedProfileId }));
                    }
                    await db.transact(txs as never[]);
                    setMsg({ kind: 'ok', text: 'Shift created (draft).' });
                    setDraft((d) => ({ ...d, eventName: '', location: '', meetupDetails: '' }));
                  } catch (e: unknown) {
                    const text =
                      (e as { body?: { message?: string }; message?: string })?.body?.message ??
                      (e as { message?: string })?.message ??
                      'Failed to create shift.';
                    setMsg({ kind: 'error', text });
                  } finally {
                    setCreating(false);
                  }
                }}
                className="rounded-md px-4 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
              >
                {creating ? 'Creating…' : 'Create shift'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold">Pending swap approvals</h2>
          {pendingApprovals.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">No swaps awaiting approval.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingApprovals.map((r) => (
                <li key={r.id} className="rounded-xl border border-zinc-200 p-4">
                  <p className="font-medium text-zinc-900">{r.shift?.eventName ?? 'Shift'}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatDate(r.shift?.date)} • <span className="capitalize">{r.shift?.timeBlock}</span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    From: <span className="text-zinc-900">{r.fromProfile?.displayName ?? 'Unknown'}</span> → To:{' '}
                    <span className="text-zinc-900">{r.toProfile?.displayName ?? 'Unknown'}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setCreating(true);
                        setMsg({ kind: 'idle' });
                        try {
                          const txs: unknown[] = [db.tx.swapRequests[r.id].update({ status: 'approved' })];
                          if (r.shift?.id && r.toProfile?.id) {
                            txs.push(db.tx.shifts[r.shift.id].link({ assignedProfile: r.toProfile.id }));
                          }
                          await db.transact(txs as never[]);
                          setMsg({ kind: 'ok', text: 'Swap approved and schedule updated.' });
                        } catch (e: unknown) {
                          const text =
                            (e as { body?: { message?: string }; message?: string })?.body?.message ??
                            (e as { message?: string })?.message ??
                            'Failed to approve swap.';
                          setMsg({ kind: 'error', text });
                        } finally {
                          setCreating(false);
                        }
                      }}
                      className="rounded-md px-3 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                      style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
                      disabled={creating}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setCreating(true);
                        setMsg({ kind: 'idle' });
                        try {
                          await db.transact([db.tx.swapRequests[r.id].update({ status: 'denied' })]);
                          setMsg({ kind: 'ok', text: 'Swap denied.' });
                        } catch (e: unknown) {
                          const text =
                            (e as { body?: { message?: string }; message?: string })?.body?.message ??
                            (e as { message?: string })?.message ??
                            'Failed to deny swap.';
                          setMsg({ kind: 'error', text });
                        } finally {
                          setCreating(false);
                        }
                      }}
                      className="rounded-md border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                      style={{ backgroundColor: 'transparent' }}
                      disabled={creating}
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">All shifts</h2>
            <p className="mt-2 text-sm text-zinc-600">Create drafts, assign servers, then publish.</p>
          </div>
        </div>

        {shifts.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No shifts created yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {shifts
              .slice()
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((s) => (
                <div key={s.id} className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900">{s.eventName}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {formatDate(s.date)} • <span className="capitalize">{s.timeBlock}</span> •{' '}
                        <span className="text-zinc-900">{s.location}</span>
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Assigned:{' '}
                        <span className="text-zinc-900">{s.assignedProfile?.displayName ?? '—'}</span>
                        {s.assignedProfile?.uniformSize ? (
                          <span className="text-zinc-500"> • {s.assignedProfile.uniformSize}</span>
                        ) : null}
                      </p>
                      {s.assignedProfile?.notes ? (
                        <p className="mt-1 text-sm text-zinc-600">
                          Notes: <span className="text-zinc-900">{s.assignedProfile.notes}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        value={s.assignedProfile?.id ?? ''}
                        onChange={async (e) => {
                          const pid = e.target.value;
                          setCreating(true);
                          setMsg({ kind: 'idle' });
                          try {
                            if (!pid) return;
                            await db.transact([db.tx.shifts[s.id].link({ assignedProfile: pid })]);
                            setMsg({ kind: 'ok', text: 'Assignment updated.' });
                          } catch (e2: unknown) {
                            const text =
                              (e2 as { body?: { message?: string }; message?: string })?.body?.message ??
                              (e2 as { message?: string })?.message ??
                              'Failed to assign server.';
                            setMsg({ kind: 'error', text });
                          } finally {
                            setCreating(false);
                          }
                        }}
                        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
                      >
                        <option value="">Assign…</option>
                        {(profiles as unknown as ProfileLite[])
                          .filter((p) => p.role !== 'manager')
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.displayName || p.contact || p.id} • {p.uniformSize || '—'}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={async () => {
                          setCreating(true);
                          setMsg({ kind: 'idle' });
                          try {
                            await db.transact([db.tx.shifts[s.id].update({ status: 'published' })]);
                            setMsg({ kind: 'ok', text: 'Shift published.' });
                          } catch (e: unknown) {
                            const text =
                              (e as { body?: { message?: string }; message?: string })?.body?.message ??
                              (e as { message?: string })?.message ??
                              'Failed to publish shift.';
                            setMsg({ kind: 'error', text });
                          } finally {
                            setCreating(false);
                          }
                        }}
                        disabled={creating}
                        className="rounded-md px-3 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
                        style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {msg.kind === 'ok' ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{msg.text}</div>
      ) : msg.kind === 'error' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg.text}</div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-800">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

