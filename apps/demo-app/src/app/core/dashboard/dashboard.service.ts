import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@libs/environment';
import { Project } from '@libs/entity';
import { Observable } from 'rxjs';

export interface DashboardStat {
  label: string;
  value: string | number;
  delta?: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  when: string;
  done: boolean;
}

export interface DashboardData {
  tenantId: string;
  stats: DashboardStat[];
  projects: Project[];
  activity: DashboardActivity[];
}

/**
 * The dashboard is app chrome, not a feature: it composes the tenant's stats
 * and the first projects. It stays in the app (the composition root) rather
 * than spawning a feature library — the one thick page that belongs here.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  httpClient = inject(HttpClient);

  fetch(): Observable<DashboardData> {
    return this.httpClient.get<DashboardData>(environment.baseUrl + '/api/dashboard');
  }
}
