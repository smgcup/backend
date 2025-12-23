import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class SystemAlertsService {
  private readonly logger = new Logger(SystemAlertsService.name);

  private readonly webhookUrl =
    'https://chat.googleapis.com/v1/spaces/AAQAZod-Oo4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=PHizFp-wVsIqhPd957AbG8szJ-ntWFXWYTs0AtD5F-U';

  async sendSystemAlert(message: string) {
    if (!this.webhookUrl) {
      this.logger.error('System Alert webhook URL is not defined');
      return;
    }

    try {
      const res = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({ text: message }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send System Alert: ${res.status} ${errorText}`);
      }

      this.logger.log(`✅ System Alert successfully sent: ${message}`);
    } catch (err) {
      this.logger.error('❌ System Alert failed to send: ', err);
    }
  }
}
