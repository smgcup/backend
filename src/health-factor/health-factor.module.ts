import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthFactor } from './entities/health-factor.entity';
import { HealthFactorProperty } from './entities/health-factor-property.entity';
import { HealthFactorProperties } from './entities/health-factor-properties.entity';
import { HealthFactorPropertyMeasurementUnit } from './entities/health-factor-property-measurement-unit.entity';
import { Account } from '../account/entities/account.entity';
import { HealthFactorService } from './health-factor.service';
import { HealthFactorResolver } from './health-factor.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HealthFactor,
      HealthFactorProperty,
      HealthFactorProperties,
      HealthFactorPropertyMeasurementUnit,
      Account,
    ]),
  ],
  providers: [HealthFactorService, HealthFactorResolver],
  exports: [HealthFactorService],
})
export class HealthFactorModule {}
