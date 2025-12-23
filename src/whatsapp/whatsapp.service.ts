import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

// whatsapp.service.ts (sketch)
@Injectable()
export class WhatsappService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get() {
    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    return `https://graph.facebook.com/v21.0/${phoneNumberId}`;
  }

  private get accessToken() {
    return this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
  }

  async sendTextMessage(to: string, body: string) {
    const url = `${this.get()}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    };

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    const res = await lastValueFrom(this.http.post(url, payload, { headers }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res.data; // contains message id, etc.
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode = 'en_US', components?: any[]) {
    const url = `${this.get()}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components ?? [],
      },
    };

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    const res = await lastValueFrom(this.http.post(url, payload, { headers }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res.data;
  }
}
