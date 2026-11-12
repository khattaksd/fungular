import type { Project } from '@libs/entity';

export interface ProjectTask {
  id: string;
  title: string;
  projectId: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  due: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface ProjectDetail {
  project: Project;
  tasks: ProjectTask[];
  members: ProjectMember[];
}