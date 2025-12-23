import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJSON } from 'graphql-type-json';
import { ScheduleEventFieldValue } from './entities/schedule-event-field-value.entity';
import { ScheduleEventFieldDataType } from './enums/schedule-event-field-data-type.enum';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';

@Resolver(() => ScheduleEventFieldValue)
@UseGuards(JwtAuthGuard)
export class ScheduleEventFieldValuesResolver {
  /**
   * Resolver for the computed value field.
   * Returns the appropriate value based on the field's data type.
   * This provides a cleaner API than exposing all value* fields.
   */
  @ResolveField(() => GraphQLJSON, { nullable: true })
  value(@Parent() fieldValue: ScheduleEventFieldValue): string | number | boolean | Date | null {
    if (!fieldValue.field) {
      return null;
    }

    switch (fieldValue.field.dataType) {
      case ScheduleEventFieldDataType.STRING:
        return fieldValue.valueString ?? null;
      case ScheduleEventFieldDataType.NUMBER:
        return fieldValue.valueNumber ?? null;
      case ScheduleEventFieldDataType.BOOLEAN:
        return fieldValue.valueBoolean ?? null;
      case ScheduleEventFieldDataType.DATETIME:
        return fieldValue.valueDateTime ?? null;
      default:
        return null;
    }
  }
}
