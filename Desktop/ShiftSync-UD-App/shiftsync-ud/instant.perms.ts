import type { InstantRules } from '@instantdb/react';

// ShiftSync UD permissions (MVP)
// Goal: safe + beginner-friendly. We enforce ownership on user-owned data (profiles, availability).
// For manager-only actions, we use the user's linked profile role where possible, and keep any tricky
// "only visible to eligible servers" filtering in the UI for V1.

const rules = {
  $default: {
    allow: {
      $default: 'auth.id != null',
    },
  },

  profiles: {
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      update: 'isOwner && isStillOwner',
      delete: 'isOwner',
    },
    bind: {
      isOwner: 'auth.id != null && auth.id == data.userId',
      isStillOwner: 'auth.id != null && auth.id == newData.userId',
    },
  },

  availabilityBlocks: {
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      update: 'isOwner && isStillOwner',
      delete: 'isOwner',
    },
    bind: {
      isOwner: 'auth.id != null && auth.id == data.userId',
      isStillOwner: 'auth.id != null && auth.id == newData.userId',
    },
  },

  shifts: {
    allow: {
      // Managers can see all shifts. Servers can see shifts assigned to them.
      view: 'isManager || auth.id in data.ref(\"assignedProfile.userId\")',
      create: 'isManager',
      update: 'isManager',
      delete: 'isManager',
    },
    bind: {
      isManager: "auth.id != null && 'manager' in auth.ref('profile.role')",
    },
  },

  swapRequests: {
    allow: {
      // Managers can see all. Servers can see open swaps + their own from/to swaps.
      view:
        "isManager || data.status == 'open' || auth.id in data.ref('fromProfile.userId') || auth.id in data.ref('toProfile.userId')",
      create: 'auth.id != null && auth.id in data.ref(\"fromProfile.userId\")',
      update:
        "isManager || auth.id in data.ref('fromProfile.userId') || auth.id in data.ref('toProfile.userId')",
      delete: 'isManager || auth.id in data.ref(\"fromProfile.userId\")',
    },
    bind: {
      isManager: "auth.id != null && 'manager' in auth.ref('profile.role')",
    },
  },
} satisfies InstantRules;

export default rules;

