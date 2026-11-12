import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { TeamService } from '../services/team/team.service';
import { TeamStore } from './team.store';

const MEMBERS = [
  { id: 'u-1', name: 'Alex', email: 'a@x.dev', role: 'Admin', status: 'active' },
  { id: 'u-2', name: 'Maya', email: 'm@x.dev', role: 'Member', status: 'invited' },
] as never;

describe('TeamStore', () => {
  let service: { list: Mock };
  const setup = () => {
    service = { list: vi.fn() };
    TestBed.configureTestingModule({
      providers: [TeamStore, { provide: TeamService, useValue: service }],
    });
    return TestBed.inject(TeamStore);
  };

  it('loads members and counts active ones', () => {
    const store = setup();
    service.list.mockReturnValue(of(MEMBERS));
    store.fetchTeam();
    expect(store.members()).toHaveLength(2);
    expect(store.activeCount()).toBe(1);
  });

  it('keeps errors', () => {
    const store = setup();
    service.list.mockReturnValue(throwError(() => ({ message: 'boom', code: 'E', status: 500 })));
    store.fetchTeam();
    expect(store.error()?.message).toBe('boom');
  });
});
