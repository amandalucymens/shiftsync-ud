'use client';

import { useEffect, useMemo, useState } from 'react';
import { id } from '@instantdb/react';
import { AppShell } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { db } from '@/lib/db';
import { useMyProfile, type Role, type UniformSize } from '@/lib/profile';

const UNIFORM_SIZES: UniformSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProfilePage() {
  return (
    <AppShell>
      <RequireAuth>
        <ProfileInner />
      </RequireAuth>
    </AppShell>
  );
}

function ProfileInner() {
  const { profile, user, isLoading } = useMyProfile();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const initial = useMemo(() => {
    return {
      displayName: profile?.displayName ?? '',
      email: profile?.email ?? (user?.email ?? ''),
      phone: profile?.phone ?? '',
      preferredContact: (profile?.preferredContact as 'Email' | 'Phone') ?? 'Email',
      uniformSize: (profile?.uniformSize as UniformSize) ?? 'M',
      notes: profile?.notes ?? '',
      role: (profile?.role as Role) ?? 'server',
    };
  }, [profile, user?.email]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    // Keep form in sync when profile finishes loading or changes.
    if (isLoading) return;
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, profile?.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md border-l-[3px] border-l-[var(--ud-blue)]">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Your profile</h1>
        <p className="mt-2 text-sm text-zinc-700">
          This is what managers will use when scheduling (uniform size + key notes).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Display name"
            icon={
              <IconPerson />
            }
          >
            <input
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Maya Patel"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            />
          </Field>

          <Field label="Email" icon={<IconEnvelope />}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="maya@udel.edu"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            />
          </Field>

          <Field label="Phone" icon={<IconPhone />}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(302) 555-0123"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            />
          </Field>

          <Field label="Preferred contact method" icon={<IconTag />}>
            <select
              required
              value={form.preferredContact}
              onChange={(e) => setForm((f) => ({ ...f, preferredContact: e.target.value as 'Email' | 'Phone' }))}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            >
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
            </select>
          </Field>

          <Field label="Uniform size" icon={<IconShirt />}>
            <select
              value={form.uniformSize}
              onChange={(e) => setForm((f) => ({ ...f, uniformSize: e.target.value as UniformSize }))}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            >
              {UNIFORM_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Role" icon={<IconTag />}>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
            >
              <option value="server">Server</option>
              <option value="driver_assist">Driver Assist</option>
              <option value="bartender">Bartender</option>
              <option value="manager">Manager</option>
            </select>
            <p className="mt-2 text-xs text-zinc-500">
              For demo/MVP: you can switch this here. In a real app, you’d lock this down.
            </p>
          </Field>

          <div className="md:col-span-2">
            <Field label="Notes for managers" icon={<IconNote />}>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder='Example: "Commutes from Newark, needs 30 min notice for off-campus meetups."'
                className="min-h-28 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#00539F] focus:ring-2 focus:ring-[#00539F]"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !user}
            onClick={async () => {
              if (!user) return;
              setSaving(true);
              setErr(null);
              setOk(null);

              try {
                const profileId = profile?.id ?? id();
                await db.transact([
                  db.tx.profiles[profileId].update({
                    userId: user.id,
                    displayName: form.displayName.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    preferredContact: form.preferredContact,
                    uniformSize: form.uniformSize,
                    notes: form.notes.trim(),
                    role: form.role,
                  }),
                  // Link $users -> profile so permissions and auth.ref('profile.role') work.
                  db.tx.$users[user.id].link({ profile: profileId }),
                ]);
                setOk('Saved.');
              } catch (e: unknown) {
                const msg =
                  (e as { body?: { message?: string }; message?: string })?.body?.message ??
                  (e as { message?: string })?.message ??
                  'Failed to save profile.';
                setErr(msg);
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-md px-4 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--ud-gold)', color: '#1a1a1a' }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>

        {err ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
        {ok ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</div>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-900">
        <span className="text-[#00539F]">{icon}</span>
        <span>{label}</span>
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function IconBase({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function IconPerson() {
  return (
    <IconBase>
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
    </IconBase>
  );
}

function IconEnvelope() {
  return (
    <IconBase>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m6 8 6 4 6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

function IconPhone() {
  return (
    <IconBase>
      <path
        d="M8 3h2l1 5-2 1c1 3 3 5 6 6l1-2 5 1v2c0 1.1-.9 2-2 2h-1C10.3 20 4 13.7 4 6V5c0-1.1.9-2 2-2h2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function IconShirt() {
  return (
    <IconBase>
      <path
        d="M9 4 7 6H5L3 9l4 2v9h10v-9l4-2-2-3h-2l-2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function IconTag() {
  return (
    <IconBase>
      <path
        d="M20 12l-8 8-9-9V4h7l10 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}

function IconNote() {
  return (
    <IconBase>
      <path
        d="M6 3h9l3 3v15H6V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

