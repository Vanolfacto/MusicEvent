import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    performance: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock('../services/notification.service.js', () => ({
  notificationService: {
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../utils/access.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/access.js')>();
  return {
    ...actual,
    requireOrganizerProfile: vi.fn().mockResolvedValue({ id: 1, userId: 1 }),
    requireEventOwnership: vi.fn().mockResolvedValue({}),
  };
});

const activeEvent = {
  id: 1,
  status: 'PUBLISHED',
  startDateTime: new Date(Date.now() - 3_600_000),
  endDateTime: new Date(Date.now() + 3_600_000), // still ongoing
};

const endedEvent = {
  id: 2,
  status: 'PUBLISHED',
  startDateTime: new Date(Date.now() - 2 * 3_600_000),
  endDateTime: new Date(Date.now() - 3_600_000), // already ended
};

const fakeUser = { id: 42, role: 'ORGANIZER' } as never;

function existingPerformance(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 10,
    eventId: 1,
    artistId: 5,
    status: 'SCHEDULED',
    startDateTime: new Date(Date.now() + 3_600_000),
    endDateTime: new Date(Date.now() + 7_200_000),
    agreedFee: 1000,
    event: activeEvent,
    artist: { id: 5, isAvailable: true, user: { id: 99 } },
    ...overrides,
  };
}

describe('performanceService.update — event-active guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks rescheduling a performance once its event has ended', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const { performanceService } = await import('../services/performance.service.js');

    vi.mocked(prisma.performance.findUnique).mockResolvedValue(
      existingPerformance({ event: endedEvent }) as never,
    );

    await expect(
      performanceService.update(fakeUser, 10, { startDateTime: new Date(Date.now() + 10_000) }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(prisma.performance.update).not.toHaveBeenCalled();
  });

  it('blocks re-fee-ing a performance once its event has ended', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const { performanceService } = await import('../services/performance.service.js');

    vi.mocked(prisma.performance.findUnique).mockResolvedValue(
      existingPerformance({ event: endedEvent }) as never,
    );

    await expect(
      performanceService.update(fakeUser, 10, { agreedFee: 5000 }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(prisma.performance.update).not.toHaveBeenCalled();
  });

  it('blocks reactivating a cancelled performance once its event has ended', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const { performanceService } = await import('../services/performance.service.js');

    vi.mocked(prisma.performance.findUnique).mockResolvedValue(
      existingPerformance({ event: endedEvent, status: 'CANCELLED' }) as never,
    );

    await expect(
      performanceService.update(fakeUser, 10, { status: 'SCHEDULED' }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(prisma.performance.update).not.toHaveBeenCalled();
  });

  it('still allows marking a performance COMPLETED after its event has ended', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const { performanceService } = await import('../services/performance.service.js');

    vi.mocked(prisma.performance.findUnique).mockResolvedValue(
      existingPerformance({ event: endedEvent }) as never,
    );
    vi.mocked(prisma.performance.update).mockResolvedValue({
      ...existingPerformance({ event: endedEvent }),
      status: 'COMPLETED',
    } as never);

    const result = await performanceService.update(fakeUser, 10, { status: 'COMPLETED' });

    expect(result.status).toBe('COMPLETED');
    expect(prisma.performance.update).toHaveBeenCalled();
  });

  it('allows rescheduling a performance while its event is still active', async () => {
    const { prisma } = await import('../lib/prisma.js');
    const { performanceService } = await import('../services/performance.service.js');

    vi.mocked(prisma.performance.findUnique).mockResolvedValue(existingPerformance() as never);
    vi.mocked(prisma.performance.update).mockResolvedValue(existingPerformance() as never);

    await performanceService.update(fakeUser, 10, {
      startDateTime: new Date(Date.now() + 10_000),
      endDateTime: new Date(Date.now() + 20_000),
    });

    expect(prisma.performance.update).toHaveBeenCalled();
  });
});
