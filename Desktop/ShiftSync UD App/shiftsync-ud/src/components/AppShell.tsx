'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/db';
import { useMyProfile } from '@/lib/profile';

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        'px-3 py-2 text-sm font-medium transition-colors',
        'text-white/90 hover:text-white',
        active
          ? 'border-b-2 border-[var(--ud-gold)] text-white'
          : 'border-b-2 border-transparent hover:border-white/30',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

function CalendarClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 3v3M16 3v3M4.5 7.5h15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5V8A2.5 2.5 0 0 1 6.5 5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 14.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M13 14.5v-2M13 14.5h1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useMyProfile();
  const role = profile?.role;

  const isManager = role === 'manager';

  return (
    <div className="min-h-dvh">
      <header
        className="sticky top-0 z-50 border-b border-white/15 backdrop-blur"
        style={{ backgroundColor: 'var(--ud-blue, #00539F)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3 tracking-tight">
            <span
              className="inline-flex h-9 w-9 items-center justify-center"
              style={{
                borderRadius: 8,
                backgroundColor: 'var(--ud-gold, #FFD200)',
                color: 'var(--ud-blue, #00539F)',
              }}
            >
              <CalendarClockIcon />
            </span>
            <span className="text-lg font-bold text-white font-merriweather">
              ShiftSync <span style={{ color: 'var(--ud-gold, #FFD200)' }}>UD</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink href="/" label="Home" />
            <NavLink href="/availability" label="Availability" />
            {isManager ? (
              <NavLink href="/manager" label="Manager" />
            ) : (
              <NavLink href="/schedule" label="My Schedule" />
            )}
          </nav>

          <div className="flex items-center gap-2">
            <db.SignedIn>
              <Link
                href="/profile"
                title="Profile settings"
                className="flex flex-col items-center justify-center text-[11px] font-medium text-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="mb-0.5"
                >
                  <path
                    d="M20 21a8 8 0 0 0-16 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span>Edit Profile</span>
              </Link>
              <button
                type="button"
                onClick={() => db.auth.signOut()}
                className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:opacity-95"
                style={{ backgroundColor: 'var(--ud-gold, #FFD200)', color: '#1a1a1a' }}
              >
                Sign out
              </button>
            </db.SignedIn>
            <db.SignedOut>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:opacity-95"
                style={{ backgroundColor: 'var(--ud-gold, #FFD200)', color: '#1a1a1a' }}
              >
                Log in
              </Link>
            </db.SignedOut>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

