import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcuteSymptom } from './entities/acute-symptom.entity';
import { NotFoundError } from '../exception';
import { SYMPTOM_TRANSLATION_CODES } from '../exception/translation-codes';
@Injectable()
export class AcuteSymptomService {
  constructor(
    @InjectRepository(AcuteSymptom)
    private symptomRepository: Repository<AcuteSymptom>,
  ) {}

  async getAcuteSymptom(id: string): Promise<AcuteSymptom> {
    const symptom = await this.symptomRepository.findOne({ where: { id } });

    if (!symptom) {
      throw new NotFoundError(SYMPTOM_TRANSLATION_CODES.symptomNotFound);
    }

    return symptom;
  }
}
