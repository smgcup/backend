import { registerEnumType } from '@nestjs/graphql';

export enum HealthFactorInputType {
  TEXT = 'text',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  TIME = 'time',
  DATE_TIME = 'date_time',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SLIDER = 'slider',
}

registerEnumType(HealthFactorInputType, {
  name: 'HealthFactorType',
  description: 'Health factor type',
});
