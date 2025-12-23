import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TriggeredAcuteSymptom } from './entities/triggered-acute-symptom.entity';
import { In, Repository } from 'typeorm';
import { CreateAcuteSymptomDto } from './dto/create-triggered-acute-symptom.dto';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { AcuteSymptomService } from '../acute-symptom/acute-symptom.service';
import { AthleteService } from '../athlete/athlete.service';
import { NotFoundError } from '../exception';
import { TRIGGERED_ACUTE_SYMPTOM_TRANSLATION_CODES } from '../exception/translation-codes';
import { TriggeredAcuteSymptomStatus } from './enums/triggered-acute-symptom-status.enum';
// import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class TriggeredAcuteSymptomService {
  constructor(
    @InjectRepository(TriggeredAcuteSymptom)
    private acuteSymptomRepository: Repository<TriggeredAcuteSymptom>,
    private symptomService: AcuteSymptomService,
    private athleteService: AthleteService,
  ) {}

  /**
   * Gets the triggered acute symptoms for the my team
   * @param athleteIds - The IDs of the athletes to get the triggered acute symptoms for
   * @returns The triggered acute symptoms for the my team
   */
  async getMyTeamTriggeredAcuteSymptoms(athleteIds: string[]): Promise<TriggeredAcuteSymptom[]> {
    return await this.acuteSymptomRepository.find({
      where: { athleteId: In(athleteIds) },
      relations: ['symptom', 'athlete'],
    });
  }

  /**
   * Creates a triggered acute symptom
   * @param dto - The data transfer object containing the symptom ID and athlete ID
   * @returns The created triggered acute symptom
   */
  async createAcuteSymptom(dto: CreateAcuteSymptomDto): Promise<TriggeredAcuteSymptom> {
    // validate existence; these can throw NotFoundError
    await this.symptomService.getAcuteSymptom(dto.symptomId);
    await this.athleteService.getAthlete(dto.athleteId);

    const acuteSymptom = this.acuteSymptomRepository.create({
      id: generateUuidv7(),
      symptomId: dto.symptomId,
      athleteId: dto.athleteId,
      severityScore: Math.round(dto.severityScore * 10) / 10, // round to 1 decimal place
      status: TriggeredAcuteSymptomStatus.UNACTIONED,
      createdAt: new Date(),
      resolved: false, // not resolved by default
    });

    return this.acuteSymptomRepository.save(acuteSymptom);
  }

  /**
   * Assigns a notification to a triggered acute symptom
   * @param triggeredAcuteSymptomId - The ID of the triggered acute symptom to assign the notification to
   * @param notificationId - The ID of the notification to assign to the triggered acute symptom
   * @returns The triggered acute symptom with the assigned notification
   */
  async assignNotification(triggeredAcuteSymptomId: string, notificationId: string): Promise<TriggeredAcuteSymptom> {
    const triggeredAcuteSymptom = await this.acuteSymptomRepository.findOne({ where: { id: triggeredAcuteSymptomId } });
    if (!triggeredAcuteSymptom) {
      throw new NotFoundError(TRIGGERED_ACUTE_SYMPTOM_TRANSLATION_CODES.triggeredAcuteSymptomNotFound);
    }
    triggeredAcuteSymptom.notificationId = notificationId;
    return await this.acuteSymptomRepository.save(triggeredAcuteSymptom);
  }

  /**
   * Resolves a triggered acute symptom
   * @param id - The ID of the triggered acute symptom to resolve
   * @returns The resolved triggered acute symptom
   */
  async resolveTriggeredAcuteSymptoms(ids: string[]): Promise<TriggeredAcuteSymptom[]> {
    const triggeredAcuteSymptoms = await this.acuteSymptomRepository.find({ where: { id: In(ids) } });
    for (const triggeredAcuteSymptom of triggeredAcuteSymptoms) {
      triggeredAcuteSymptom.resolved = true;
      await this.acuteSymptomRepository.save(triggeredAcuteSymptom);
    }
    return triggeredAcuteSymptoms;
  }

  async takeActionOnTriggeredAcuteSymptoms(
    ids: string[],
    status: TriggeredAcuteSymptomStatus,
  ): Promise<TriggeredAcuteSymptom[]> {
    const triggeredAcuteSymptoms = await this.acuteSymptomRepository.find({ where: { id: In(ids) } });

    const updatedTriggeredAcuteSymptoms: TriggeredAcuteSymptom[] = [];

    for (const triggeredAcuteSymptom of triggeredAcuteSymptoms) {
      triggeredAcuteSymptom.status = status;
      triggeredAcuteSymptom.statusChangedAt = new Date();
      updatedTriggeredAcuteSymptoms.push(triggeredAcuteSymptom);
    }
    return await this.acuteSymptomRepository.save(updatedTriggeredAcuteSymptoms);
  }
}
