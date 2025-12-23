import { registerEnumType } from '@nestjs/graphql';

export enum ComparisonOperator {
  GREATER_THAN = '>',
  LESS_THAN = '<',
  EQUAL = '=',
}

registerEnumType(ComparisonOperator, {
  name: 'ComparisonOperator',
  description: 'Comparison operator for acute symptom rules',
});
