import { i } from '@instantdb/react';

// ShiftSync UD schema (MVP)
// Notes:
// - We store `userId` on user-owned records so permissions can enforce ownership cleanly.
// - Links connect entities so we can query relational data (profile -> availability, shift -> assignedProfile, etc.).

const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),

    profiles: i.entity({
      userId: i.string().indexed(), // auth.id of the owner
      displayName: i.string(),
      email: i.string(),
      phone: i.string(),
      preferredContact: i.string(), // "Email" | "Phone"
      uniformSize: i.string(), // XS | S | M | L | XL | XXL
      notes: i.string(),
      role: i.string(), // server | driver_assist | bartender | manager
    }),

    availabilityBlocks: i.entity({
      userId: i.string(), // auth.id of the owner (duplicated for simpler perms)
      dayOfWeek: i.string(), // Mon..Sun
      timeBlock: i.string(), // 4am-8am etc
      isAvailable: i.boolean(),
    }),

    shifts: i.entity({
      eventName: i.string(),
      date: i.date(),
      timeBlock: i.string(), // morning | afternoon | evening
      location: i.string(),
      meetupDetails: i.string(),
      status: i.string(), // draft | published
    }),

    swapRequests: i.entity({
      status: i.string(), // open | claimed | approved | denied
      createdAt: i.date(),
    }),
  },

  links: {
    // $users <-> profiles (one-to-one)
    userProfile: {
      forward: { on: '$users', has: 'one', label: 'profile' },
      reverse: { on: 'profiles', has: 'one', label: 'user' },
    },

    // profiles <-> availabilityBlocks (one-to-many)
    profileAvailability: {
      forward: { on: 'profiles', has: 'many', label: 'availabilityBlocks' },
      reverse: { on: 'availabilityBlocks', has: 'one', label: 'profile' },
    },

    // shifts <-> profiles (assigned server) (many shifts -> one profile for MVP)
    shiftAssignee: {
      forward: { on: 'shifts', has: 'one', label: 'assignedProfile' },
      reverse: { on: 'profiles', has: 'many', label: 'assignedShifts' },
    },

    // swapRequests <-> shifts (many swap requests per shift)
    swapShift: {
      forward: { on: 'shifts', has: 'many', label: 'swapRequests' },
      reverse: { on: 'swapRequests', has: 'one', label: 'shift' },
    },

    // swapRequests <-> profiles (from/to)
    swapFrom: {
      forward: { on: 'swapRequests', has: 'one', label: 'fromProfile' },
      reverse: { on: 'profiles', has: 'many', label: 'swapRequestsFromMe' },
    },
    swapTo: {
      forward: { on: 'swapRequests', has: 'one', label: 'toProfile' },
      reverse: { on: 'profiles', has: 'many', label: 'swapRequestsToMe' },
    },
  },
});

export default schema;

