export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
}
