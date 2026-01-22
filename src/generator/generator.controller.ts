import { Controller, Get } from '@nestjs/common';
import * as translationCodes from '../exception/translation-codes';

@Controller('generator')
export class GeneratorController {
  @Get('translation-codes')
  getCodes() {
    // Collect all values from all exported code objects
    const codes: string[] = [];

    for (const exportedItem of Object.values(translationCodes)) {
      if (typeof exportedItem === 'object' && exportedItem !== null) {
        codes.push(...Object.values(exportedItem));
      }
    }

    return [...new Set(codes)].sort(); // dedupe and sort
  }
}
