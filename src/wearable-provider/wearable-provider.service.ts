import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WearableProvider } from './entities/wearable-provider.entity';
import { NotFoundError } from '../exception/exceptions';
import { WEARABLE_PROVIDER_TRANSLATION_CODES } from '../exception/translation-codes';
@Injectable()
export class WearableProviderService {
  constructor(
    @InjectRepository(WearableProvider)
    private wearableProviderRepository: Repository<WearableProvider>,
  ) {}

  async createWearableProvider(name: string): Promise<WearableProvider> {
    const wearableProvider = this.wearableProviderRepository.create({ name });
    return await this.wearableProviderRepository.save(wearableProvider);
  }

  async getWearableProvider(id: string): Promise<WearableProvider> {
    const wearableProvider = await this.wearableProviderRepository.findOne({ where: { id } });

    if (!wearableProvider) {
      throw new NotFoundError(
        WEARABLE_PROVIDER_TRANSLATION_CODES.wearableProviderNotFound,
        `Wearable provider not found for ID ${id}`,
      );
    }
    return wearableProvider;
  }
}
