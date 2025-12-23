import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { BadRequestError } from '../../exception/exceptions';
import { VALIDATION_TRANSLATION_CODES } from '../../exception/translation-codes';

// We need to create a custom scalar to handle the Date type
@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string | Date): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value; // value from the client
  }

  serialize(value: Date | string): string {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value.toISOString(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    throw new BadRequestError(VALIDATION_TRANSLATION_CODES.invalidDate, 'Invalid date');
  }
}
