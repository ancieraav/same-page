import type { Metadata } from 'next';
import { PageRoot } from '@/components/layout/PageRoot';
import { ProfilePage } from '@/components/pages/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'User Profile - Same Page',
  description: 'Manage your Same Page profile.',
};

export default function ProfileRoute() {
  return <PageRoot bodyClass="profile-body"><ProfilePage /></PageRoot>;
}
