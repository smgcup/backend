import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
