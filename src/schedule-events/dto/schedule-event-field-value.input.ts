import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsString } from 'class-validator';

@InputType()
export class ScheduleEventFieldValueInput {
  /**
   * Matches ScheduleEventField.key, e.g.:
   * "opponent_name", "start_time"
   */
  @Field()
  @IsString()
  fieldValue!: string;

  /**
   * The value for this field. The type is determined by ScheduleEventField.dataType:
   * - STRING: string
   * - NUMBER: number
   * - BOOLEAN: boolean
   * - DATETIME: ISO date string or Date
   */
  @Field(() => GraphQLJSON)
  value!: string | number | boolean | Date;
}
