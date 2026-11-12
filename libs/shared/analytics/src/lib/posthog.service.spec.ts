import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '@libs/environment';
import { PostHogService } from './posthog.service';

/** npm packages may be `vi.mock`ed (only `@libs/*` aliases are off-limits); `environment` is mutated in place. */
const clientMock = vi.hoisted(() => ({
  init: vi.fn(),
  identify: vi.fn(),
  capture: vi.fn(),
  captureException: vi.fn(),
  reset: vi.fn(),
  logger: { info: vi.fn() },
}));

vi.mock('posthog-js', () => ({ default: clientMock }));

describe('PostHogService', () => {
  const originalToken = environment.posthogProjectToken;
  const originalHost = environment.posthogHost;
  const originalProduction = environment.production;

  interface SetupOptions {
    platformId?: string;
    token?: string;
    host?: string;
    production?: boolean;
  }

  const setup = (options: SetupOptions = {}): PostHogService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: options.platformId ?? 'browser' },
      ],
    });
    environment.posthogProjectToken = options.token;
    environment.posthogHost = options.host;
    environment.production = options.production ?? false;
    return TestBed.inject(PostHogService);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    environment.posthogProjectToken = originalToken;
    environment.posthogHost = originalHost;
    environment.production = originalProduction;
  });

  it('does nothing outside the browser (e.g. SSR)', async () => {
    const service = setup({ platformId: 'server', token: 't', host: 'h' });

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(clientMock.init).not.toHaveBeenCalled();
  });

  it('resolves when the project token is missing, logging a dev-only warning', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const service = setup({ host: 'h' });

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(clientMock.init).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('posthogProjectToken'),
    );
  });

  it('resolves when the host is missing, logging a dev-only warning', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const service = setup({ token: 't' });

    await expect(service.initialize()).resolves.toBeUndefined();

    expect(clientMock.init).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('posthogHost'));
  });

  it('stays silent about the missing token in production', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const service = setup({ production: true });

    await service.initialize();

    expect(error).not.toHaveBeenCalled();
  });

  it('stays silent about the missing host in production', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const service = setup({ token: 't', production: true });

    await service.initialize();

    expect(error).not.toHaveBeenCalled();
  });

  it('initializes posthog with the configured token and host', async () => {
    const service = setup({
      token: 'tk_project',
      host: 'https://ph.example.com',
    });

    await service.initialize();

    expect(clientMock.init).toHaveBeenCalledTimes(1);
    expect(clientMock.init).toHaveBeenCalledWith('tk_project', {
      api_host: 'https://ph.example.com',
      capture_exceptions: true,
      logs: {
        serviceName: 'fungular-web',
        environment: 'development',
      },
    });
  });

  it('labels logs as production when running a production build', async () => {
    const service = setup({ token: 't', host: 'h', production: true });

    await service.initialize();

    expect(clientMock.init).toHaveBeenCalledWith(
      't',
      expect.objectContaining({
        logs: { serviceName: 'fungular-web', environment: 'production' },
      }),
    );
  });

  it('reuses a single initialization when called concurrently', async () => {
    const service = setup({ token: 't', host: 'h' });

    const first = service.initialize();
    const second = service.initialize();

    expect(second).toBe(first);
    await first;
    expect(clientMock.init).toHaveBeenCalledTimes(1);
  });

  it('skips re-initialization once the client is ready', async () => {
    const service = setup({ token: 't', host: 'h' });

    await service.initialize();
    await service.initialize();

    expect(clientMock.init).toHaveBeenCalledTimes(1);
  });

  it('absorbs initialization failures and allows a retry', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    clientMock.init.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const service = setup({ token: 't', host: 'h' });

    await expect(service.initialize()).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      'PostHog initialization failed',
      expect.any(Error),
    );

    await service.initialize();
    expect(clientMock.init).toHaveBeenCalledTimes(2);
  });

  it('forwards events to the client once it is ready', async () => {
    const service = setup({ token: 't', host: 'h' });
    await service.initialize();

    service.identifyUser('user_1', { email: 'a@b.dev' });
    expect(clientMock.identify).toHaveBeenCalledWith('user_1', {
      email: 'a@b.dev',
    });

    service.logEvent('purchase', { item: 'seat' });
    expect(clientMock.capture).toHaveBeenCalledWith('purchase', {
      item: 'seat',
    });

    service.logInfo('authentication completed', { tenant_count: 1 });
    expect(clientMock.logger.info).toHaveBeenCalledWith(
      'authentication completed',
      { tenant_count: 1 },
    );

    const failure = new Error('kaput');
    service.logException(failure);
    expect(clientMock.captureException).toHaveBeenCalledWith(failure);

    service.logPageView('/settings', 'Settings');
    expect(clientMock.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: window.location.href,
      page_path: '/settings',
      page_title: 'Settings',
    });

    service.resetUser();
    expect(clientMock.reset).toHaveBeenCalled();
  });

  it('drops events fired while unconfigured, without throwing', async () => {
    const service = setup();

    service.logEvent('early_event', { a: 1 });

    await service.initialize();
    await Promise.resolve();

    expect(clientMock.capture).not.toHaveBeenCalled();
  });

  it('delivers events queued before initialization once the client is ready', async () => {
    const service = setup({ token: 't', host: 'h' });

    service.logEvent('queued', { q: 1 });

    await service.initialize();
    await Promise.resolve();

    expect(clientMock.capture).toHaveBeenCalledWith('queued', { q: 1 });
  });
});
