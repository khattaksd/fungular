import { TestBed } from '@angular/core/testing';
import { ANALYTICS, NoopAnalytics } from './analytics';

describe('ANALYTICS', () => {
  it('resolves to NoopAnalytics when nothing provides it', () => {
    expect(TestBed.inject(ANALYTICS)).toBeInstanceOf(NoopAnalytics);
  });

  it('initializes without a provider, so an app can boot with analytics off', async () => {
    await expect(
      TestBed.inject(ANALYTICS).initialize(),
    ).resolves.toBeUndefined();
  });

  it('swallows events instead of throwing', () => {
    const analytics = TestBed.inject(ANALYTICS);

    expect(() => analytics.logEvent('some_event', { a: 1 })).not.toThrow();
    expect(() =>
      analytics.identifyUser('user_1', { email: 'a@b.dev' }),
    ).not.toThrow();
    expect(() => analytics.logInfo('message', { a: 1 })).not.toThrow();
    expect(() => analytics.logException(new Error('kaput'))).not.toThrow();
    expect(() => analytics.logPageView('/profile', 'Profile')).not.toThrow();
    expect(() => analytics.resetUser()).not.toThrow();
  });

  it('is overridable — this is the seam vendor libraries plug into', () => {
    const stub = { ...new NoopAnalytics(), logEvent: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: ANALYTICS, useValue: stub }],
    });

    TestBed.inject(ANALYTICS).logEvent('checkout');

    expect(stub.logEvent).toHaveBeenCalledWith('checkout');
  });
});
