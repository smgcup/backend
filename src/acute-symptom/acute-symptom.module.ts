import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcuteSymptom } from './entities/acute-symptom.entity';
import { AcuteSymptomService } from './acute-symptom.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcuteSymptom])],
  controllers: [],
  providers: [AcuteSymptomService],
  exports: [AcuteSymptomService],
})
export class AcuteSymptomModule {}
