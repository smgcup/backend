import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WearableProvider } from './entities/wearable-provider.entity';
import { WearableProviderService } from './wearable-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([WearableProvider])],
  providers: [WearableProviderService],
  exports: [WearableProviderService],
})
export class WearableProviderModule {}
