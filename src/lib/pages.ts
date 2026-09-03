export type PageKey = keyof typeof pages;

export const pages = {
  index: {
    title: 'Same Page — Join or Create Room',
    description: 'Collaborate and align your team in seconds with Same Page.',
    bodyClass: 'no-scroll',
  },
  join: {
    title: 'Set Your Room Identity - Same Page',
    description: 'Set your display name and profile photo before joining the session.',
    bodyClass: 'join-body',
  },
  create: {
    title: 'Same Page — Create Room',
    description: 'Create a new private Same Page 1-on-1 session with custom rules.',
    bodyClass: 'scrollable-page',
  },
  waiting: {
    title: 'Same Page — Waiting Room',
    description: 'Wait for participants to join your private Same Page session.',
    bodyClass: 'scrollable-page waiting-page-body',
  },
  session: {
    title: 'Session Active | Question 1 - Same Page',
    description: 'Answer the active alignment question.',
    bodyClass: 'viewport-fit-page session-body',
  },
  comparison: {
    title: 'Comparison & Alignment Breakdown - Same Page',
    description: 'Compare perspectives and alignment.',
    bodyClass: 'viewport-fit-page comparison-body',
  },
  meme: {
    title: 'Meme Intermission — Same Page',
    description: 'A short room intermission.',
    bodyClass: 'viewport-fit-page meme-body',
  },
  analytics: {
    title: 'Session Analytics & Alignment Breakdown — Same Page',
    description: 'Comprehensive multi-perspective session analytics.',
    bodyClass: 'viewport-fit-page analytics-body',
  },
  participants: {
    title: 'Team Perspectives & Individual Analytics | SamePage',
    description: 'Detailed perspectives and individual analytics.',
    bodyClass: 'samepage-body-theme',
  },
  profile: {
    title: 'User Profile - Same Page',
    description: 'Manage your Same Page profile.',
    bodyClass: 'profile-body',
  },
} as const;

export function isPageKey(value: string): value is PageKey {
  return Object.prototype.hasOwnProperty.call(pages, value);
}
