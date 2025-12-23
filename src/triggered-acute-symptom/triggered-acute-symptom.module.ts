import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TriggeredAcuteSymptom } from './entities/triggered-acute-symptom.entity';
import { TriggeredAcuteSymptomService } from './triggered-acute-symptom.service';
import { AcuteSymptomModule } from '../acute-symptom/acute-symptom.module';
import { AthleteModule } from '../athlete/athlete.module';
import { TriggeredAcuteSymptomResolver } from './triggered-acute-symptom.resolver';
import { TeamModule } from '../team/team.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TriggeredAcuteSymptom]),
    AcuteSymptomModule,
    forwardRef(() => AthleteModule),
    forwardRef(() => TeamModule),
    forwardRef(() => UserModule),
  ],
  controllers: [],
  providers: [TriggeredAcuteSymptomService, TriggeredAcuteSymptomResolver],
  exports: [TriggeredAcuteSymptomService],
})
export class TriggeredAcuteSymptomModule {}
