'use client';

import { useMemo, useState } from 'react';
import { id } from '@instantdb/react';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { db } from '@/lib/db';
import { useMyProfile } from '@/lib/profile';

type TimeBlock = 'morning' | 'afternoon' | 'evening';

type ProfileLite = { id: string; userId: string; displayName?: string };
type Shift = {
  id: string;
  eventName: string;
  date: Date;
  timeBlock: TimeBlock;
  location: string;
  meetupDetails: string;
  assignedProfile?: ProfileLite | null;
};
type AvailabilityBlock = { id: string; userId: string; dayOfWeek: string; timeBlock: string; isAvailable: boolean };
type SwapRequest = {
  id: string;
  status: string;
  createdAt: Date;
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

export default function SchedulePage() {
  return (
    <AppShell>
      <RequireAuth>
        <ScheduleInner />
      </RequireAuth>
    </AppShell>
  );
}

function ScheduleInner() {
  const { profile, user, isLoading: profileLoading } = useMyProfile();
  const { data, isLoading, error } = db.useQuery({
    shifts: { assignedProfile: {} },
    swapRequests: { shift: {}, fromProfile: {}, toProfile: {} },
    availabilityBlocks: {},
  });

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'idle' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  const shifts = useMemo(() => (data?.shifts ?? []) as unknown as Shift[], [data?.shifts]);
  const swaps = useMemo(() => (data?.swapRequests ?? []) as unknown as SwapRequest[], [data?.swapRequests]);
  const availability = useMemo(
    () => (data?.availabilityBlocks ?? []) as unknown as AvailabilityBlock[],
    [data?.availabilityBlocks],
  );

  const myAvailabilityKeys = useMemo(() => {
    if (!user) return new Set<string>();
    const mine = availability.filter((b) => b.userId === user.id && b.isAvailable);
    return new Set<string>(mine.map((b) => `${b.dayOfWeek}:${b.timeBlock}`));
  }, [availability, user]);

  const myShifts = useMemo(() => {
    if (!profile) return [];
    return shifts.filter((s) => s.assignedProfile?.id === profile.id);
  }, [shifts, profile]);

  const openSwaps = useMemo(() => swaps.filter((r) => r.status === 'open'), [swaps]);

  const swapsMatchingMe = useMemo(() => {
    // V1: permissions to hide swaps from non-eligible servers is hard; we filter client-side.
    // We approximate eligibility based on day-of-week + timeBlock.
    return openSwaps.filter((r) => {
      const shift = r.shift;
      if (!shift?.date || !shift?.timeBlock) return true;
      const day = new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short' });
      const dayKey = day.slice(0, 3); // "Mon", "Tue", ...
      const tb = shift.timeBlock as TimeBlock;
      return myAvailabilityKeys.has(`${dayKey}:${tb}`);
    });
  }, [openSwaps, myAvailabilityKeys]);

  if (profileLoading || isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm font-medium text-amber-900">Create your profile first</p>
        <p className="mt-1 text-sm text-amber-800">
          Your schedule and swaps are tied to your profile. Go to Profile and save your info first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Schedule + Swap Board</h1>
        <p className="mt-2 text-sm text-zinc-700">
          See your assigned shifts, request swaps, and claim swaps you can cover.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error.message}</div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-zinc-900">My assigned shifts</h2>
          {myShifts.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">No assigned shifts yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {myShifts.map((s) => (
                <li key={s.id} className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900">{s.eventName}</p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {formatDate(s.date)} • <span className="capitalize">{s.timeBlock}</span>
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        Location: <span className="text-zinc-900">{s.location}</span>
                      </p>
                      {s.meetupDetails ? (
                        <p className="mt-1 text-sm text-zinc-600">
                          Meetup: <span className="text-zinc-900">{s.meetupDetails}</span>
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!user) return;
                        setBusy(true);
                        setMsg({ kind: 'idle' });
                        try {
                          const swapId = id();
                          await db.transact([
                            db.tx.swapRequests[swapId].create({
                              status: 'open',
                              createdAt: new Date(),
                            }),
                            db.tx.swapRequests[swapId].link({ shift: s.id, fromProfile: profile.id }),
                          ]);
                          setMsg({ kind: 'ok', text: 'Swap request posted.' });
                      } catch (e: unknown) {
                        const text =
                          (e as { body?: { message?: string }; message?: string })?.body?.message ??
                          (e as { message?: string })?.message ??
                          'Failed to post swap request.';
                        setMsg({ kind: 'error', text });
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="shrink-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                    >
                      Request swap
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md" id="swaps">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Swap board</h2>
              <p className="mt-2 text-sm text-zinc-700">
                Showing open swaps that match your availability (filtered client-side for V1).
              </p>
            </div>
          </div>

          {swapsMatchingMe.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600">No matching open swaps right now.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {swapsMatchingMe.map((r) => (
                <li key={r.id} className="rounded-xl border border-zinc-200 p-4">
                  <p className="font-medium text-zinc-900">{r.shift?.eventName ?? 'Shift'}</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {formatDate(r.shift?.date)} • <span className="capitalize">{r.shift?.timeBlock}</span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    From: <span className="text-zinc-900">{r.fromProfile?.displayName ?? 'Unknown'}</span>
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        setMsg({ kind: 'idle' });
                        try {
                          await db.transact([
                            db.tx.swapRequests[r.id].update({ status: 'claimed' }),
                            db.tx.swapRequests[r.id].link({ toProfile: profile.id }),
                          ]);
                          setMsg({ kind: 'ok', text: 'Swap claimed. A manager will approve or deny.' });
                        } catch (e: unknown) {
                          const text =
                            (e as { body?: { message?: string }; message?: string })?.body?.message ??
                            (e as { message?: string })?.message ??
                            'Failed to claim swap.';
                          setMsg({ kind: 'error', text });
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                    >
                      Claim swap
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {msg.kind === 'ok' ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{msg.text}</div>
      ) : msg.kind === 'error' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg.text}</div>
      ) : null}
    </div>
  );
}

