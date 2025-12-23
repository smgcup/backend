export const ACUTE_SYMPTOM_RULESET_CHECK_EVENTS = {
  CHECK_REQUESTED: 'acute-symptom-ruleset.check.requested',
} as const;

export class AcuteSymptomRulesetCheckRequestedEvent {
  constructor(
    public readonly values: Record<string, number>,
    public readonly athleteId: string,
  ) {}
}
