import { registerEnumType } from '@nestjs/graphql';

export enum ScheduleEventFieldDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATETIME = 'DATETIME',
}

registerEnumType(ScheduleEventFieldDataType, {
  name: 'ScheduleEventFieldDataType',
});
