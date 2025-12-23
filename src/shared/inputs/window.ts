import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';
import { Window } from '../enums/window.enum';
import { BadRequestError } from '../../exception/exceptions';
import { VALIDATION_TRANSLATION_CODES } from '../../exception/translation-codes';

export type WindowType = Window;

@Scalar('Window')
export class WindowScalar implements CustomScalar<string, WindowType> {
  description = 'Window scalar: day | week | month';

  private readonly allowedValues: WindowType[] = [Window.DAY, Window.WEEK, Window.MONTH];

  parseValue(value: string): WindowType {
    if (this.allowedValues.includes(value as WindowType)) {
      return value as WindowType;
    }
    throw new BadRequestError(
      VALIDATION_TRANSLATION_CODES.invalidWindowValue,
      `Invalid window value: ${value}. Allowed: ${Object.values(Window).join(', ')}`,
    );
  }

  serialize(value: WindowType): string {
    return value;
  }

  parseLiteral(ast: ValueNode): WindowType {
    if (ast.kind === Kind.STRING && this.allowedValues.includes(ast.value as WindowType)) {
      return ast.value as WindowType;
    }
    throw new BadRequestError(
      VALIDATION_TRANSLATION_CODES.invalidWindowValue,
      `Invalid window literal. Allowed: ${Object.values(Window).join(', ')}`,
    );
  }
}
