import { PAIR_MODE } from '@/lib/pairMode';

export interface Group {
  id: number;
  name: string;
  isSourceOfTruth: boolean;
  roles: string[];
}

export interface WaitingRoomInfo {
  code: string;
  name: string;
  topic?: string;
  participantMode?: 'flexible' | 'fixed';
  participantCount?: number;
  groups?: Group[];
}

export interface FallbackParticipant {
  id: string;
  name: string;
  initials: string;
  group: string;
  role: string;
  color: string;
  avatarUrl?: string | null;
  operator?: boolean;
  sot?: boolean;
}

const mockProfiles = [
  ['Elena Rostova', 'ER', 'avatar-color-cyan'],
  ['Marcus Vance', 'MV', 'avatar-color-amber'],
  ['Siti Sarah', 'SS', 'avatar-color-rose'],
  ['David Chen', 'DC', 'avatar-color-purple'],
] as const satisfies readonly (readonly [string, string, string])[];

function getMockProfile(index: number): readonly [string, string, string] {
  const profile = mockProfiles[index % mockProfiles.length];
  return profile ?? mockProfiles[0];
}

/** Offline fallback bubbles (no code / backend unreachable). */
export function makeFallbackParticipants(room: WaitingRoomInfo): FallbackParticipant[] {
  // PAIR_MODE: 2-person, no roles, no SOT, single code.
  // REVIVE: multi-group/role/SOT logic below.
  if (PAIR_MODE) {
    return [
      {
        id: 'p1',
        name: 'You',
        initials: 'AR',
        group: '',
        role: '',
        color: 'avatar-color-indigo',
        operator: true,
      },
      {
        id: 'p2',
        name: 'Alex Morgan',
        initials: 'AL',
        group: '',
        role: '',
        color: 'avatar-color-cyan',
      },
    ];
  }
  const defaultGroup: Group = { id: 1, name: 'General', isSourceOfTruth: true, roles: ['Participant'] };
  const groups = room.groups?.length ? room.groups : [defaultGroup];
  const source = groups.find((group) => group.isSourceOfTruth) ?? groups[0] ?? defaultGroup;
  const initialRole = source.roles[0] ?? 'Host';
  const result: FallbackParticipant[] = [{
    id: 'p1',
    name: 'You (Operator)',
    initials: 'AR',
    group: source.name,
    role: initialRole,
    color: 'avatar-color-indigo',
    operator: true,
    sot: source.isSourceOfTruth,
  }];

  let profileIndex = 0;
  for (const group of groups.filter((item) => item.id !== source.id)) {
    const roles = group.roles.length ? group.roles : ['Contributor'];
    for (const role of roles) {
      if (result.length >= 5) break;
      if (group.id === source.id && role === initialRole) continue;
      const [name, initials, color] = getMockProfile(profileIndex++);
      result.push({
        id: `p${String(result.length + 1)}`,
        name,
        initials,
        group: group.name,
        role,
        color,
        sot: group.isSourceOfTruth,
      });
    }
  }

  for (const role of source.roles.slice(1)) {
    if (result.length >= 5) break;
    const [name, initials, color] = getMockProfile(profileIndex++);
    result.push({
      id: `p${String(result.length + 1)}`,
      name,
      initials,
      group: source.name,
      role,
      color,
      sot: true,
    });
  }

  while (result.length < 5) {
    const [name, initials, color] = getMockProfile(profileIndex++);
    result.push({
      id: `p${String(result.length + 1)}`,
      name,
      initials,
      group: 'General',
      role: 'Participant',
      color,
    });
  }

  return result;
}
