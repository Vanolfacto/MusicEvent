import { describe, it, expect } from 'vitest';
import {
  rangesOverlap,
  isWithinParent,
  checkPerformanceConflicts,
} from '../utils/scheduleConflict.js';

describe('scheduleConflict', () => {
  const base = new Date('2026-08-01T18:00:00Z');
  const baseEnd = new Date('2026-08-01T22:00:00Z');

  it('rangesOverlap detektuje preklapanje', () => {
    const a = { startDateTime: base, endDateTime: new Date('2026-08-01T20:00:00Z') };
    const b = { startDateTime: new Date('2026-08-01T19:00:00Z'), endDateTime: baseEnd };
    expect(rangesOverlap(a, b)).toBe(true);
  });

  it('rangesOverlap ne detektuje preklapanje za uzastopne termine', () => {
    const a = { startDateTime: base, endDateTime: new Date('2026-08-01T19:00:00Z') };
    const b = { startDateTime: new Date('2026-08-01T19:00:00Z'), endDateTime: baseEnd };
    expect(rangesOverlap(a, b)).toBe(false);
  });

  it('isWithinParent proverava da li je nastup unutar događaja', () => {
    const event = { startDateTime: base, endDateTime: baseEnd };
    const valid = {
      startDateTime: new Date('2026-08-01T19:00:00Z'),
      endDateTime: new Date('2026-08-01T20:00:00Z'),
    };
    const invalid = {
      startDateTime: new Date('2026-08-01T17:00:00Z'),
      endDateTime: new Date('2026-08-01T20:00:00Z'),
    };
    expect(isWithinParent(valid, event)).toBe(true);
    expect(isWithinParent(invalid, event)).toBe(false);
  });

  it('checkPerformanceConflicts vraća sve konflikte', () => {
    const performance = {
      startDateTime: new Date('2026-08-01T19:00:00Z'),
      endDateTime: new Date('2026-08-01T20:00:00Z'),
    };
    const event = { startDateTime: base, endDateTime: baseEnd };

    const conflicts = checkPerformanceConflicts({
      performance,
      event,
      artistAvailable: false,
      artistPerformances: [
        {
          startDateTime: new Date('2026-08-01T18:30:00Z'),
          endDateTime: new Date('2026-08-01T19:30:00Z'),
        },
      ],
      eventPerformances: [
        {
          startDateTime: new Date('2026-08-01T19:30:00Z'),
          endDateTime: new Date('2026-08-01T20:30:00Z'),
        },
      ],
    });

    expect(conflicts.some((c) => c.code === 'ARTIST_UNAVAILABLE')).toBe(true);
    expect(conflicts.some((c) => c.code === 'ARTIST_SCHEDULE_CONFLICT')).toBe(true);
    expect(conflicts.some((c) => c.code === 'EVENT_STAGE_CONFLICT')).toBe(true);
  });

  it('checkPerformanceConflicts detektuje nastup van vremena događaja', () => {
    const conflicts = checkPerformanceConflicts({
      performance: {
        startDateTime: new Date('2026-08-01T21:30:00Z'),
        endDateTime: new Date('2026-08-01T23:00:00Z'),
      },
      event: { startDateTime: base, endDateTime: baseEnd },
      artistAvailable: true,
      artistPerformances: [],
      eventPerformances: [],
    });

    expect(conflicts.some((c) => c.code === 'OUTSIDE_EVENT_TIME')).toBe(true);
  });
});
