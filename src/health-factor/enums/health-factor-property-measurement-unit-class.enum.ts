import { registerEnumType } from '@nestjs/graphql';

export enum HealthFactorPropertyMeasurementUnitClass {
  LENGTH = 'length',
  MASS = 'mass',
  TIME = 'time',
  DURATION = 'duration',
}

registerEnumType(HealthFactorPropertyMeasurementUnitClass, {
  name: 'HealthFactorPropertyMeasurementUnitClass',
  description: 'Health factor property measurement unit class',
});
