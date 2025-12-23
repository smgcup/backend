import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleEventTypeField } from './entities/schedule-event-type-field.entity';
import { ScheduleEventFieldValue } from './entities/schedule-event-field-value.entity';
import { ScheduleEventFieldDataType } from './enums/schedule-event-field-data-type.enum';
import { ScheduleEventFieldValueInput } from './dto/schedule-event-field-value.input';
import { BadRequestError } from '../exception/exceptions';
import { SCHEDULE_EVENTS_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class ScheduleEventFieldsService {
  constructor(
    @InjectRepository(ScheduleEventTypeField)
    private readonly typeFieldRepo: Repository<ScheduleEventTypeField>,
  ) {}

  async loadEventTypeFields(typeId: string): Promise<Map<string, ScheduleEventTypeField>> {
    const typeFields = await this.typeFieldRepo.find({
      where: { typeId },
      relations: ['field'],
      order: { sortOrder: 'ASC' },
    });

    const typeFieldByKey = new Map<string, ScheduleEventTypeField>();
    for (const tf of typeFields) {
      typeFieldByKey.set(tf.field.key, tf);
    }
    return typeFieldByKey;
  }

  /**
   * Validate that the required fields for the eventType were provided in the input
   * @param eventTypeFields The fields that belong to the eventType
   * @param providedFields The fields that were provided in the input
   * @throws BadRequestError if the required fields were not provided
   */
  validateRequiredFields(
    eventTypeFields: ScheduleEventTypeField[],
    providedFields: ScheduleEventFieldValueInput[],
  ): void {
    const missingRequired: string[] = [];
    for (const eventTypeField of eventTypeFields) {
      if (!eventTypeField.required) continue;
      const exists = providedFields.some((f) => f.fieldValue === eventTypeField.field.key);
      if (!exists) {
        missingRequired.push(eventTypeField.field.key);
      }
    }

    if (missingRequired.length > 0) {
      throw new BadRequestError(
        SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventMissingRequiredFields,
        `Missing required fields: ${missingRequired.join(', ')}`,
      );
    }
  }

  /**
   * Validate and normalize the field inputs
   * @param providedFields The fields that were provided in the input
   * @param typeFieldByKey The fields that belong to the eventType and mapped by key (ScheduleEventTypeField.field.key)
   * @returns An array of objects with the typeField and the value
   * @throws BadRequestError if the field is not allowed for this event type or if the value is not provided
   */
  validateAndNormalizeFieldInputs(
    providedFields: ScheduleEventFieldValueInput[],
    typeFieldByKey: Map<string, ScheduleEventTypeField>,
  ): Array<{ typeField: ScheduleEventTypeField; value: Partial<ScheduleEventFieldValue> }> {
    const normalizedFieldInputs: Array<{
      typeField: ScheduleEventTypeField;
      value: Partial<ScheduleEventFieldValue>;
    }> = [];

    for (const fieldInput of providedFields) {
      const typeField = typeFieldByKey.get(fieldInput.fieldValue);
      if (!typeField) {
        throw new BadRequestError(
          SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldNotAllowed,
          `Field "${fieldInput.fieldValue}" is not allowed for this event type`,
        );
      }

      const value = this.validateAndNormalizeFieldValue(fieldInput, typeField);
      normalizedFieldInputs.push({ typeField, value });
    }

    return normalizedFieldInputs;
  }

  /**
   * Validate and normalize the value of a field
   * @param fieldInput The field that was provided in the input
   * @param typeField The field that belongs to the eventType
   * @returns The value of the field
   * @throws BadRequestError if the value is not provided or if multiple values are provided
   */
  private validateAndNormalizeFieldValue(
    fieldInput: ScheduleEventFieldValueInput,
    typeField: ScheduleEventTypeField,
  ): Partial<ScheduleEventFieldValue> {
    const { field } = typeField;
    const dataType = field.dataType;

    if (fieldInput.value === undefined || fieldInput.value === null) {
      throw new BadRequestError(
        SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldNoValueProvided,
        `No value provided for field "${fieldInput.fieldValue}"`,
      );
    }

    return this.extractValueByDataType(fieldInput.value, dataType, field.key);
  }

  /**
   * Extract the value of a field based on the data type
   * @param rawValue The raw value from the input
   * @param dataType The data type of the field
   * @param fieldKey The key of the field
   * @returns The value of the field
   */
  private extractValueByDataType(
    rawValue: string | number | boolean | Date,
    dataType: ScheduleEventFieldDataType,
    fieldKey: string,
  ): Partial<ScheduleEventFieldValue> {
    const value: Partial<ScheduleEventFieldValue> = {};

    switch (dataType) {
      case ScheduleEventFieldDataType.STRING: {
        if (typeof rawValue !== 'string') {
          throw new BadRequestError(
            SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldExpectsStringValue,
            `Field "${fieldKey}" expects a string value (STRING data type), got ${typeof rawValue}`,
          );
        }
        value.valueString = rawValue;
        break;
      }
      case ScheduleEventFieldDataType.NUMBER: {
        if (typeof rawValue !== 'number') {
          throw new BadRequestError(
            SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldExpectsNumberValue,
            `Field "${fieldKey}" expects a number value (NUMBER data type), got ${typeof rawValue}`,
          );
        }
        value.valueNumber = rawValue;
        break;
      }
      case ScheduleEventFieldDataType.BOOLEAN: {
        if (typeof rawValue !== 'boolean') {
          throw new BadRequestError(
            SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldExpectsBooleanValue,
            `Field "${fieldKey}" expects a boolean value (BOOLEAN data type), got ${typeof rawValue}`,
          );
        }
        value.valueBoolean = rawValue;
        break;
      }
      case ScheduleEventFieldDataType.DATETIME: {
        // Handle both Date objects and ISO date strings
        let dateValue: Date;
        if (rawValue instanceof Date) {
          dateValue = rawValue;
        } else if (typeof rawValue === 'string') {
          dateValue = new Date(rawValue);
          if (isNaN(dateValue.getTime())) {
            throw new BadRequestError(
              SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldExpectsDateTimeValue,
              `Field "${fieldKey}" expects a valid date/time value (DATETIME data type), got invalid date string`,
            );
          }
        } else {
          throw new BadRequestError(
            SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldExpectsDateTimeValue,
            `Field "${fieldKey}" expects a date/time value (DATETIME data type), got ${typeof rawValue}`,
          );
        }
        value.valueDateTime = dateValue;
        break;
      }
      default: {
        throw new BadRequestError(
          SCHEDULE_EVENTS_TRANSLATION_CODES.scheduleEventFieldUnsupportedDataType,
          `Unsupported data type for field "${fieldKey}"`,
        );
      }
    }

    return value;
  }
}
