export type ProjectStatus = 'active' | 'on-hold' | 'archived';

/** A project in the workspace. Shared so the dashboard and projects feature agree. */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  due: string;
  lead: string;
  members: string[];
  tasks: { total: number; done: number };
}