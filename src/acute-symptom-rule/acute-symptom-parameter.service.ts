import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcuteSymptomParameter } from './entities/acute-symptom-parameter.entity';

@Injectable()
export class AcuteSymptomParameterService {
  constructor(
    @InjectRepository(AcuteSymptomParameter)
    private acuteSymptomParameterRepository: Repository<AcuteSymptomParameter>,
  ) {}

  /**
   * Gets all acute symptom parameters
   * @returns All acute symptom parameters
   */
  async getAcuteSymptomParameters(): Promise<AcuteSymptomParameter[]> {
    return await this.acuteSymptomParameterRepository.find();
  }
}
