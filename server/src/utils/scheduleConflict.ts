export interface TimeRange {
  startDateTime: Date;
  endDateTime: Date;
}

export interface ScheduleConflict {
  code: string;
  message: string;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startDateTime < b.endDateTime && b.startDateTime < a.endDateTime;
}

export function isWithinParent(child: TimeRange, parent: TimeRange): boolean {
  return child.startDateTime >= parent.startDateTime && child.endDateTime <= parent.endDateTime;
}

export function checkPerformanceConflicts(params: {
  performance: TimeRange;
  event: TimeRange;
  artistAvailable: boolean;
  artistPerformances: TimeRange[];
  eventPerformances: TimeRange[];
}): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  if (!params.artistAvailable) {
    conflicts.push({
      code: 'ARTIST_UNAVAILABLE',
      message: 'Izvođač je označen kao nedostupan.',
    });
  }

  if (!isWithinParent(params.performance, params.event)) {
    conflicts.push({
      code: 'OUTSIDE_EVENT_TIME',
      message: 'Vreme nastupa mora biti unutar vremena održavanja događaja.',
    });
  }

  for (const existing of params.artistPerformances) {
    if (rangesOverlap(params.performance, existing)) {
      conflicts.push({
        code: 'ARTIST_SCHEDULE_CONFLICT',
        message: 'Izvođač već ima nastup u istom vremenskom periodu.',
      });
      break;
    }
  }

  for (const existing of params.eventPerformances) {
    if (rangesOverlap(params.performance, existing)) {
      conflicts.push({
        code: 'EVENT_STAGE_CONFLICT',
        message: 'Dva nastupa na istom događaju se preklapaju u vremenu.',
      });
      break;
    }
  }

  return conflicts;
}
