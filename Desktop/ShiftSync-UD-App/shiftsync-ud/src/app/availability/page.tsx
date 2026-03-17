'use client';

import { useEffect, useMemo, useState } from 'react';
import { id } from '@instantdb/react';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { db } from '@/lib/db';
import { useMyProfile } from '@/lib/profile';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const BLOCKS = ['4am-8am', '8am-12pm', '12pm-4pm', '4pm-8pm', '8pm-12am'] as const;

type Day = (typeof DAYS)[number];
type Block = (typeof BLOCKS)[number];

function formatSlotLabel(block: Block) {
  return block.replace('-', ' – ');
}

function key(day: Day, block: Block) {
  return `${day}:${block}`;
}

export default function AvailabilityPage() {
  return (
    <AppShell>
      <RequireAuth>
        <AvailabilityInner />
      </RequireAuth>
    </AppShell>
  );
}

function AvailabilityInner() {
  const { profile, user, isLoading: profileLoading } = useMyProfile();
  const { data, isLoading: blocksLoading, error } = db.useQuery({ availabilityBlocks: {} });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'idle' | 'ok' | 'error'; text?: string }>({ kind: 'idle' });

  type AvailabilityBlock = {
    id: string;
    userId: string;
    dayOfWeek: Day;
    timeBlock: Block;
    isAvailable: boolean;
  };

  const allBlocks = useMemo(() => {
    return (data?.availabilityBlocks ?? []) as unknown as AvailabilityBlock[];
  }, [data?.availabilityBlocks]);

  const existingByKey = useMemo(() => {
    const map = new Map<string, AvailabilityBlock>();
    if (!user) return map;
    for (const b of allBlocks) {
      if (b.userId !== user.id) continue;
      map.set(key(b.dayOfWeek, b.timeBlock), b);
    }
    return map;
  }, [allBlocks, user]);

  const current = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const d of DAYS) {
      for (const b of BLOCKS) {
        const ex = existingByKey.get(key(d, b));
        map.set(key(d, b), ex ? Boolean(ex.isAvailable) : false);
      }
    }
    return map;
  }, [existingByKey]);

  const [grid, setGrid] = useState<Map<string, boolean>>(() => new Map());

  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun,1=Mon...
    const offsetToMonday = ((dayOfWeek + 6) % 7) * -1;
    const monday = new Date(today);
    monday.setDate(today.getDate() + offsetToMonday);

    return DAYS.map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d;
    });
  }, []);

  const todayKey = (() => {
    const d = new Date();
    return d.toDateString();
  })();

  useEffect(() => {
    if (blocksLoading) return;
    setGrid(current);
  }, [blocksLoading, current]);

  if (profileLoading) {
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
          Availability belongs to a profile. Go to Profile and save your info, then come back here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Weekly availability</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Click squares to toggle. This saves to InstantDB so managers can staff events.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error.message}</div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
        <table className="min-w-[720px] w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="text-left text-sm font-semibold text-zinc-900"></th>
              {BLOCKS.map((block) => (
                <th key={block} className="px-2 py-1 text-left text-sm font-semibold text-zinc-900 whitespace-nowrap">
                  {formatSlotLabel(block)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, idx) => {
              const date = weekDates[idx];
              const isToday = date.toDateString() === todayKey;
              const dateLabel = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              return (
                <tr key={day}>
                  <td
                    className={[
                      'pr-2 text-sm font-semibold whitespace-nowrap rounded-md px-2 py-1',
                      isToday
                        ? 'bg-[var(--ud-blue,#00539F)] text-white'
                        : 'bg-transparent text-zinc-900',
                    ].join(' ')}
                  >
                    <div>{day}</div>
                    <div className={isToday ? 'text-[11px] text-white/80' : 'text-[11px] text-zinc-500'}>
                      {dateLabel}
                    </div>
                  </td>
                  {BLOCKS.map((block) => {
                    const k = key(day, block);
                    const on = grid.get(k) ?? false;
                    return (
                      <td key={k}>
                        <button
                          type="button"
                          onClick={() => setGrid((g) => new Map(g).set(k, !on))}
                          className={[
                            'h-12 w-full rounded-lg border text-sm font-semibold transition-all duration-150 active:scale-95',
                            on
                              ? 'border-transparent text-white hover:opacity-95'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
                          ].join(' ')}
                          style={on ? { backgroundColor: 'var(--ud-blue, #00539F)' } : undefined}
                        >
                          {on ? (
                            <span className="inline-flex items-center gap-2">
                              <span aria-hidden="true">✓</span>
                              <span>Available</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving || !user}
          onClick={async () => {
            if (!user) return;
            setSaving(true);
            setMsg({ kind: 'idle' });

            try {
              const txs: unknown[] = [];
              for (const day of DAYS) {
                for (const block of BLOCKS) {
                  const k = key(day, block);
                  const isAvailable = Boolean(grid.get(k));
                  const existing = existingByKey.get(k);
                  const blockId = existing?.id ?? id();
                  txs.push(
                    db.tx.availabilityBlocks[blockId].update({
                      userId: user.id,
                      dayOfWeek: day,
                      timeBlock: block,
                      isAvailable,
                    }),
                  );
                  // Link block -> profile (reverse label is `profile`)
                  txs.push(db.tx.availabilityBlocks[blockId].link({ profile: profile.id }));
                }
              }
              await db.transact(txs as never[]);
              setMsg({ kind: 'ok', text: 'Availability saved.' });
            } catch (e: unknown) {
              const text =
                (e as { body?: { message?: string }; message?: string })?.body?.message ??
                (e as { message?: string })?.message ??
                'Failed to save availability.';
              setMsg({ kind: 'error', text });
            } finally {
              setSaving(false);
            }
          }}
          className="rounded-md px-4 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
          style={{ backgroundColor: 'var(--ud-gold, #FFD200)', color: '#1a1a1a' }}
        >
          {saving ? 'Saving…' : 'Save availability'}
        </button>

        {blocksLoading ? <span className="text-sm text-zinc-500">Loading saved blocks…</span> : null}
      </div>

      {msg.kind === 'ok' ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{msg.text}</div>
      ) : msg.kind === 'error' ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg.text}</div>
      ) : null}
    </div>
  );
}

