'use client';

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useMyProfile } from '@/lib/profile';

export default function HomePage() {
  return (
    <AppShell>
      <RequireAuth>
        <HomeInner />
      </RequireAuth>
    </AppShell>
  );
}

function HomeInner() {
  const { profile, isLoading } = useMyProfile();
  const role = profile?.role;
  const isManager = role === 'manager';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-zinc-200 shadow-md">
        <div className="grid min-h-[280px] md:grid-cols-2">
          <div className="p-8 md:p-10" style={{ backgroundColor: 'var(--ud-blue, #00539F)' }}>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl font-merriweather">
              Shifts, simplified.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 md:text-lg">
              Where every shift runs on time — no chaos, no reply-alls.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {isManager ? (
                <>
                  <Link
                    href="/manager"
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:opacity-95"
                    style={{ backgroundColor: 'var(--ud-gold, #FFD200)', color: '#1a1a1a' }}
                  >
                    Schedule Servers
                  </Link>
                  <Link
                    href="/manager#swaps"
                    className="rounded-md border px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,0.55)' }}
                  >
                    Manage Swaps
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/schedule"
                    className="rounded-md px-4 py-2 text-sm font-semibold hover:opacity-95"
                    style={{ backgroundColor: 'var(--ud-gold, #FFD200)', color: '#1a1a1a' }}
                  >
                    See Shifts
                  </Link>
                  <Link
                    href="/schedule#swaps"
                    className="rounded-md border px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,0.55)' }}
                  >
                    Swap Shift
                  </Link>
                </>
              )}
            </div>
          </div>

          <div
            className="relative flex h-full min-h-[220px] items-center justify-center overflow-hidden p-8"
            style={{ backgroundColor: '#003f7a' }}
          >
            <div className="w-full max-w-xs rounded-2xl border border-zinc-100 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-[var(--ud-blue,#00539F)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M8 3v3M16 3v3M4.5 7.5h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path
                      d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5V8A2.5 2.5 0 0 1 6.5 5.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-zinc-900">This Week</div>
              </div>

              {isManager ? (
                <div className="space-y-2">
                  <MiniStatRow colorClass="bg-emerald-500" label="3 servers assigned" badgeLabel="Coverage" />
                  <MiniStatRow colorClass="bg-sky-500" label="2 available" badgeLabel="Open slots" />
                  <MiniStatRow colorClass="bg-amber-500" label="1 swap pending" badgeLabel="Needs review" />
                </div>
              ) : (
                <div className="space-y-2">
                  <MiniShiftRow
                    colorClass="bg-emerald-500"
                    name="Alumni Dinner"
                    datetime="Wed • 6:00–9:00 PM"
                    badgeLabel="Confirmed"
                    badgeColorClass="bg-emerald-50 text-emerald-700"
                  />
                  <MiniShiftRow
                    colorClass="bg-emerald-500"
                    name="Faculty Luncheon"
                    datetime="Fri • 11:30–2:30 PM"
                    badgeLabel="Confirmed"
                    badgeColorClass="bg-emerald-50 text-emerald-700"
                  />
                  <MiniShiftRow
                    colorClass="bg-amber-500"
                    name="Grad Ceremony"
                    datetime="Sun • 3:00–7:00 PM"
                    badgeLabel="Swap Open"
                    badgeColorClass="bg-amber-50 text-amber-800"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-zinc-900">How it works</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2 border-l-4 border-[#FFD200] pl-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ud-blue,#00539F)] text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 3v3M16 3v3M4.5 7.5h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5V8A2.5 2.5 0 0 1 6.5 5.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#00539F]">Step 1</span>
            <h3 className="text-base font-semibold text-zinc-900">Set Your Availability</h3>
            <p className="text-sm text-zinc-600">
              Toggle your open hours once. Managers see it instantly — no emails needed.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-l-4 border-[#FFD200] pl-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ud-blue,#00539F)] text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 4h10a2 2 0 0 1 2 2v11H5V6a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#00539F]">Step 2</span>
            <h3 className="text-base font-semibold text-zinc-900">Get Assigned to Shifts</h3>
            <p className="text-sm text-zinc-600">
              Your manager builds the schedule and publishes it. You get notified with all the details.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-l-4 border-[#FFD200] pl-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ud-blue,#00539F)] text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 7h10l-3-3M7 17h10l-3 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 12a7 7 0 0 1 7-7M19 12a7 7 0 0 1-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#00539F]">Step 3</span>
            <h3 className="text-base font-semibold text-zinc-900">Swap If Plans Change</h3>
            <p className="text-sm text-zinc-600">
              Post a swap request. A matching server claims it. Manager approves. Done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniShiftRow({
  colorClass,
  name,
  datetime,
  badgeLabel,
  badgeColorClass,
}: {
  colorClass: string;
  name: string;
  datetime: string;
  badgeLabel: string;
  badgeColorClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-3 py-2">
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <div>
          <p className="text-sm font-medium text-zinc-900">{name}</p>
          <p className="text-xs text-zinc-500">{datetime}</p>
        </div>
      </div>
      <span
        className={[
          'rounded-full px-2 py-0.5 text-[11px] font-medium',
          badgeColorClass,
        ].join(' ')}
      >
        {badgeLabel}
      </span>
    </div>
  );
}

function MiniStatRow({
  colorClass,
  label,
  badgeLabel,
}: {
  colorClass: string;
  label: string;
  badgeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <p className="text-sm font-medium text-zinc-900">{label}</p>
      </div>
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
        {badgeLabel}
      </span>
    </div>
  );
}
