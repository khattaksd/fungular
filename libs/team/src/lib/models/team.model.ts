export type MemberRole = 'Admin' | 'Project Lead' | 'Member' | 'Viewer';
export type MemberStatus = 'active' | 'invited';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
}
