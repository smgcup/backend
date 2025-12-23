// Terra sync event names
export const TERRA_SYNC_EVENTS = {
  STARTED: 'terra.sync.started',
  COMPLETED: 'terra.sync.completed',
} as const;

export class TerraSyncStartedEvent {
  constructor(
    public readonly athleteId?: string,
    public readonly syncType: 'all' | 'single' = 'single',
  ) {}
}

export class TerraSyncCompletedEvent {
  constructor(
    public readonly athleteId?: string,
    public readonly syncType: 'all' | 'single' = 'single',
    public readonly success: boolean = true,
    public readonly error?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
