import { db } from '@/lib/db';

export type Role = 'server' | 'driver_assist' | 'bartender' | 'manager';
export type UniformSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type Profile = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  preferredContact: 'Email' | 'Phone';
  uniformSize: string;
  notes: string;
  role: Role;
};

export function useMyProfile() {
  const { data, isLoading, error } = db.useQuery({ profiles: {} });
  const { user } = db.useAuth();

  const profiles = (data?.profiles ?? []) as unknown as Profile[];
  const mine = user ? profiles.find((p) => p.userId === user.id) : undefined;

  return { profile: mine, profiles, isLoading, error, user };
}

