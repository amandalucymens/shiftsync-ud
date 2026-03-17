'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { id } from '@instantdb/react';
import { db } from '@/lib/db';
import { AppShell } from '@/components/AppShell';

type RoleChoice = 'server' | 'manager';

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <db.SignedIn>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">You’re already logged in</h1>
            <p className="mt-2 text-sm text-zinc-700">Go back to your dashboard.</p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex rounded-md px-3 py-2 text-sm font-semibold hover:opacity-95"
                style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
              >
                Go to Home
              </Link>
            </div>
          </div>
        </db.SignedIn>

        <db.SignedOut>
          <LoginFlow />
        </db.SignedOut>
      </div>
    </AppShell>
  );
}

function LoginFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [sentEmail, setSentEmail] = useState('');
  const [status, setStatus] = useState<{ kind: 'idle' | 'loading' | 'error' | 'ok'; message?: string }>({
    kind: 'idle',
  });

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <RoleStep
          onChoose={(r) => {
            setRole(r);
            setStep(2);
          }}
        />
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Signing in as {role === 'manager' ? 'Manager' : 'Server'}
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900">Magic code sign-in</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setRole(null);
                setSentEmail('');
                setStatus({ kind: 'idle' });
              }}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              ← Back
            </button>
          </div>

          <p className="mt-3 text-sm text-zinc-700">
            Enter your email and we’ll send a 6-digit code. No passwords.
          </p>

          <div className="mt-6">
            {!sentEmail ? (
              <EmailStep
                onSendEmail={(email) => {
                  setSentEmail(email);
                }}
                onStatus={setStatus}
              />
            ) : (
              <CodeStep
                sentEmail={sentEmail}
                onStatus={setStatus}
                onBack={() => setSentEmail('')}
                chosenRole={role ?? 'server'}
              />
            )}
          </div>

          {status.kind === 'error' ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{status.message}</div>
          ) : status.kind === 'ok' ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {status.message}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function RoleStep({ onChoose }: { onChoose: (r: RoleChoice) => void }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-md">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-12 w-12 items-center justify-center"
          style={{ backgroundColor: 'var(--ud-blue, #00539F)', borderRadius: 12 }}
        >
          <span className="text-[var(--ud-gold,#FFD200)]">
            <CalendarClockIcon />
          </span>
        </div>
        <div className="mt-4 text-2xl font-bold text-zinc-900">
          ShiftSync <span style={{ color: 'var(--ud-blue, #00539F)' }}>UD</span>
        </div>
        <p className="mt-2 text-sm text-zinc-700">Choose how you&apos;re signing in today.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose('server')}
          className="rounded-2xl border-2 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: 'var(--ud-blue, #00539F)' }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#00539F]">
              <IconServer />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Sign in as Server</h2>
              <p className="mt-1 text-sm text-zinc-700">View shifts, set availability, and request swaps.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChoose('manager')}
          className="rounded-2xl border-2 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: 'var(--ud-gold, #FFD200)' }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#00539F]">
              <IconBriefcase />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Sign in as Manager</h2>
              <p className="mt-1 text-sm text-zinc-700">Build schedules, assign servers, and approve swaps.</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
  onStatus,
}: {
  onSendEmail: (email: string) => void;
  onStatus: (s: { kind: 'idle' | 'loading' | 'error' | 'ok'; message?: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const email = inputRef.current?.value?.trim() ?? '';
        if (!email) return;

        onStatus({ kind: 'loading' });
        onSendEmail(email);

        db.auth.sendMagicCode({ email }).then(
          () => onStatus({ kind: 'ok', message: `Code sent to ${email}. Check your inbox (and spam).` }),
          (err) => {
            onStatus({ kind: 'error', message: err?.body?.message ?? 'Failed to send code.' });
            onSendEmail('');
          },
        );
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-zinc-800">Email</label>
      <input
        ref={inputRef}
        type="email"
        required
        autoFocus
        placeholder="you@udel.edu"
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
      />
      <button
        type="submit"
        className="w-full rounded-md px-3 py-2 text-sm font-semibold hover:opacity-95"
        style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
      >
        Send code
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onStatus,
  onBack,
  chosenRole,
}: {
  sentEmail: string;
  onStatus: (s: { kind: 'idle' | 'loading' | 'error' | 'ok'; message?: string }) => void;
  onBack: () => void;
  chosenRole: RoleChoice;
}) {
  const codeRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hint = useMemo(() => sentEmail.replace(/(.{2}).+(@.*)/, '$1••••$2'), [sentEmail]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const code = codeRef.current?.value?.trim() ?? '';
        if (!code) return;

        onStatus({ kind: 'loading' });
        db.auth
          .signInWithMagicCode({ email: sentEmail, code })
          .then(async () => {
            const auth = await db.getAuth();
            const userId = auth?.id;
            if (userId) {
              const profileId = id();
              await db.transact([
                db.tx.profiles[profileId].update({
                  userId,
                  displayName: '',
                  email: sentEmail,
                  phone: '',
                  preferredContact: 'Email',
                  uniformSize: 'M',
                  notes: '',
                  role: chosenRole,
                }),
                db.tx.$users[userId].link({ profile: profileId }),
              ]);
            }
            onStatus({ kind: 'ok', message: 'Signed in. Redirecting…' });
            router.push('/');
          })
          .catch((err) => {
            if (codeRef.current) codeRef.current.value = '';
            onStatus({ kind: 'error', message: err?.body?.message ?? 'Invalid code.' });
          });
      }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-800">6-digit code</label>
        <button type="button" onClick={onBack} className="text-sm font-medium text-blue-700 hover:underline">
          Change email
        </button>
      </div>
      <p className="text-sm text-zinc-600">We sent a code to <span className="font-medium text-zinc-900">{hint}</span>.</p>
      <input
        ref={codeRef}
        type="text"
        inputMode="numeric"
        autoFocus
        required
        placeholder="123456"
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
      />
      <button
        type="submit"
        className="w-full rounded-md px-3 py-2 text-sm font-semibold hover:opacity-95"
        style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
      >
        Verify code
      </button>
    </form>
  );
}

function CalendarClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3v3M16 3v3M4.5 7.5h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v10.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5V8A2.5 2.5 0 0 1 6.5 5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16.5 14.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" stroke="currentColor" strokeWidth="2" />
      <path d="M13 14.5v-2M13 14.5h1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconServer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h12a2 2 0 0 1 2 2v3H4V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 9h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7 7h.01M10 7h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M4 15h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7 18h.01M10 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

