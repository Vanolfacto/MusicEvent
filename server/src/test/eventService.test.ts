import { describe, it, expect, vi, beforeEach } from 'vitest';

const tx = {
  event: { update: vi.fn() },
  eventGenre: { deleteMany: vi.fn(), createMany: vi.fn() },
  application: { findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
  performance: { findMany: vi.fn().mockResolvedValue([]), updateMany: vi.fn() },
};

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb(tx)),
  },
}));

vi.mock('../utils/access.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/access.js')>();
  return {
    ...actual,
    requireEventOwnershipOrAdmin: vi.fn(),
  };
});

vi.mock('../services/notification.service.js', () => ({
  notificationService: {
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

const currentEvent = {
  id: 1,
  status: 'PUBLISHED',
  startDateTime: new Date(Date.now() + 3_600_000),
  endDateTime: new Date(Date.now() + 7_200_000),
  minimumBudget: 100,
  maximumBudget: 1000,
};

const fakeUser = { id: 1, role: 'ORGANIZER' } as never;

describe('eventService.update — cancel cascade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.application.findMany.mockResolvedValue([]);
    tx.performance.findMany.mockResolvedValue([]);
  });

  it('cascades cancellation to pending/accepted applications and scheduled/confirmed performances, and notifies the artists', async () => {
    const { requireEventOwnershipOrAdmin } = await import('../utils/access.js');
    const { notificationService } = await import('../services/notification.service.js');
    const { eventService } = await import('../services/event.service.js');

    vi.mocked(requireEventOwnershipOrAdmin).mockResolvedValue(currentEvent as never);
    tx.event.update.mockResolvedValue({ ...currentEvent, status: 'CANCELLED', title: 'Test Event' });
    tx.application.findMany.mockResolvedValue([
      { id: 1, artist: { user: { id: 501 } } },
      { id: 2, artist: { user: { id: 502 } } },
    ] as never);
    tx.performance.findMany.mockResolvedValue([
      { id: 1, artist: { user: { id: 502 } } }, // overlaps with an application artist — should dedupe
      { id: 2, artist: { user: { id: 503 } } },
    ] as never);

    const result = await eventService.update(fakeUser, 1, { status: 'CANCELLED' as never });

    expect(result.status).toBe('CANCELLED');
    expect(tx.application.updateMany).toHaveBeenCalledWith({
      where: { eventId: 1, status: { in: ['PENDING', 'ACCEPTED'] } },
      data: { status: 'CANCELLED' },
    });
    expect(tx.performance.updateMany).toHaveBeenCalledWith({
      where: { eventId: 1, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
      data: { status: 'CANCELLED' },
    });

    // 3 unique artist users (501, 502, 503) — 502 appears in both lists, should notify once
    expect(notificationService.create).toHaveBeenCalledTimes(3);
    const notifiedIds = vi.mocked(notificationService.create).mock.calls.map((c) => c[0]);
    expect(new Set(notifiedIds)).toEqual(new Set([501, 502, 503]));
  });

  it('rejects trying to change the status of an already-cancelled event', async () => {
    const { requireEventOwnershipOrAdmin } = await import('../utils/access.js');
    const { notificationService } = await import('../services/notification.service.js');
    const { eventService } = await import('../services/event.service.js');

    vi.mocked(requireEventOwnershipOrAdmin).mockResolvedValue({
      ...currentEvent,
      status: 'CANCELLED',
    } as never);

    await expect(
      eventService.update(fakeUser, 1, { status: 'PUBLISHED' as never }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(tx.application.updateMany).not.toHaveBeenCalled();
    expect(tx.performance.updateMany).not.toHaveBeenCalled();
    expect(notificationService.create).not.toHaveBeenCalled();
  });

  it('does not touch applications/performances for a normal (non-cancelling) update', async () => {
    const { requireEventOwnershipOrAdmin } = await import('../utils/access.js');
    const { notificationService } = await import('../services/notification.service.js');
    const { eventService } = await import('../services/event.service.js');

    vi.mocked(requireEventOwnershipOrAdmin).mockResolvedValue(currentEvent as never);
    tx.event.update.mockResolvedValue({ ...currentEvent, title: 'Updated title' });

    await eventService.update(fakeUser, 1, { title: 'Updated title' });

    expect(tx.application.updateMany).not.toHaveBeenCalled();
    expect(tx.performance.updateMany).not.toHaveBeenCalled();
    expect(notificationService.create).not.toHaveBeenCalled();
  });
});
