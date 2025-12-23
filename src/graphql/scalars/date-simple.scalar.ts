import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { BadRequestError } from '../../exception/exceptions';
import { VALIDATION_TRANSLATION_CODES } from '../../exception/translation-codes';

@Scalar('DateSimple')
export class DateSimpleScalar implements CustomScalar<string, Date> {
  description = 'Date simple scalar type (YYYY-MM-DD format)';

  parseValue(value: string | Date): Date {
    if (typeof value === 'string') {
      // Handle YYYY-MM-DD format
      const date = new Date(value + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        throw new BadRequestError(
          VALIDATION_TRANSLATION_CODES.invalidDateFormat,
          'Invalid date format. Expected YYYY-MM-DD',
        );
      }
      return date;
    }
    return value; // value from the client
  }

  serialize(value: Date | string): string {
    if (typeof value === 'string') {
      const date = new Date(value);
      return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
    }
    return value.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        throw new BadRequestError(
          VALIDATION_TRANSLATION_CODES.invalidDateFormat,
          'Invalid date format. Expected YYYY-MM-DD',
        );
      }
      return date;
    }
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
}
