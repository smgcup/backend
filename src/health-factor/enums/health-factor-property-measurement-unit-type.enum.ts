import { registerEnumType } from '@nestjs/graphql';

export enum HealthFactorPropertyMeasurementUnitType {
  INTEGER = 'integer',
  FLOAT = 'float',
  STRING = 'string',
  BOOLEAN = 'boolean',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
}

registerEnumType(HealthFactorPropertyMeasurementUnitType, {
  name: 'HealthFactorPropertyMeasurementUnitType',
  description: 'Health factor property measurement unit type',
});
