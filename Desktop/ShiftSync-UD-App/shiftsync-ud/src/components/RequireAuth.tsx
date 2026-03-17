'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user, error } = db.useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">Auth error</p>
        <p className="mt-1 text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

