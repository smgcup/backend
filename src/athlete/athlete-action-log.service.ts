import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AthleteActionLog } from './entities/athlete-action-log.entity';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';

@Injectable()
export class AthleteActionLogService {
  constructor(
    @InjectRepository(AthleteActionLog)
    private athleteActionLogRepository: Repository<AthleteActionLog>,
  ) {}

  async createAthleteActionLog(actionLog: Omit<AthleteActionLog, 'id' | 'timestamp'>): Promise<AthleteActionLog> {
    const newActionLog = this.athleteActionLogRepository.create({
      ...actionLog,
      id: generateUuidv7(),
      timestamp: new Date(),
    });
    await this.athleteActionLogRepository.save(newActionLog);
    return newActionLog;
  }
}
