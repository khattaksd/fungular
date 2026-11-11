import { TestBed } from '@angular/core/testing';
import { Layout, ViewportService } from './viewport.service';

const PHONE = '(max-width: 600px)';
const TABLET = '(min-width: 601px) and (max-width: 1023px)';

/** A controllable `matchMedia`: tests flip a query and fire its `change` listeners. */
function controlViewport(): {
  set: (query: string, matches: boolean) => void;
  listeners: () => number;
} {
  const state = new Map<string, { matches: boolean; fns: Set<() => void> }>();
  const entry = (query: string) => {
    let found = state.get(query);
    if (!found) {
      found = { matches: false, fns: new Set() };
      state.set(query, found);
    }
    return found;
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => {
      const e = entry(query);
      return {
        get matches() {
          return e.matches;
        },
        addEventListener: (_: string, fn: () => void) => e.fns.add(fn),
        removeEventListener: (_: string, fn: () => void) => e.fns.delete(fn),
      };
    },
  });
  return {
    set: (query, matches) => {
      const e = entry(query);
      e.matches = matches;
      e.fns.forEach((fn) => fn());
    },
    listeners: () => [...state.values()].reduce((n, e) => n + e.fns.size, 0),
  };
}

describe('ViewportService', () => {
  const create = (): ViewportService => TestBed.inject(ViewportService);
  const layout = (service: ViewportService): Layout => service.layout();

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('reports desktop where matchMedia is unavailable', () => {
    expect(layout(create())).toBe('desktop');
  });

  it('starts from the current window width', () => {
    const viewport = controlViewport();
    viewport.set(TABLET, true);

    expect(layout(create())).toBe('tablet');
  });

  it('follows the window as it crosses each breakpoint', () => {
    const viewport = controlViewport();
    const service = create();
    expect(layout(service)).toBe('desktop');

    viewport.set(TABLET, true);
    expect(layout(service)).toBe('tablet');

    viewport.set(TABLET, false);
    viewport.set(PHONE, true);
    expect(layout(service)).toBe('phone');

    viewport.set(PHONE, false);
    expect(layout(service)).toBe('desktop');
  });

  it('stops listening when the injector is destroyed', () => {
    const viewport = controlViewport();
    create();
    expect(viewport.listeners()).toBe(2);

    TestBed.resetTestingModule();

    expect(viewport.listeners()).toBe(0);
  });
});
