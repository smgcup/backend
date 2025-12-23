export const SCHEDULE_EVENTS_TRANSLATION_CODES = {
  // Bad Request
  scheduleEventStartAtMustBeBeforeEndAt: 'scheduleEventStartAtMustBeBeforeEndAt',
  scheduleEventMissingRequiredFields: 'scheduleEventMissingRequiredFields',
  scheduleEventFieldNotAllowed: 'scheduleEventFieldNotAllowed',
  scheduleEventFieldNoValueProvided: 'scheduleEventFieldNoValueProvided',
  scheduleEventFieldMultipleValuesProvided: 'scheduleEventFieldMultipleValuesProvided',
  scheduleEventFieldExpectsStringValue: 'scheduleEventFieldExpectsStringValue',
  scheduleEventFieldExpectsNumberValue: 'scheduleEventFieldExpectsNumberValue',
  scheduleEventFieldExpectsBooleanValue: 'scheduleEventFieldExpectsBooleanValue',
  scheduleEventFieldExpectsDateTimeValue: 'scheduleEventFieldExpectsDateTimeValue',
  scheduleEventFieldUnsupportedDataType: 'scheduleEventFieldUnsupportedDataType',
  // Not Found
  scheduleEventTypeNotFound: 'scheduleEventTypeNotFound',
} as const;
