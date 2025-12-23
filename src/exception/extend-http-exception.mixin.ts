import { HttpException, Type } from '@nestjs/common';

export interface CustomErrorResponse {
  message: string;
  error: string;
}

export const ExtendException = <T extends HttpException>(exception: Type<T>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class ExtendedException extends (exception as any) {
    constructor(translationCode: string, description?: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super(translationCode, description);
    }

    getResponse(): CustomErrorResponse {
      const response = super.getResponse(); // eslint-disable-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      if (typeof response === 'string') {
        return { message: response, error: '' };
      }
      return response as CustomErrorResponse;
    }
  }

  return ExtendedException as Type<ExtendedException & HttpException>;
};
