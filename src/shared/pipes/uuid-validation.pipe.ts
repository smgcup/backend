import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      throw new BadRequestException('UUID is required');
    }

    // Convert to string if it's not already
    const stringValue = String(value).trim();

    // Check for empty string
    if (!stringValue) {
      throw new BadRequestException('UUID cannot be empty');
    }

    // General UUID regex pattern (accepts any valid UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(stringValue)) {
      throw new BadRequestException('Invalid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    }

    return stringValue;
  }
}
