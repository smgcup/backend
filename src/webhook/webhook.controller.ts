import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { TerraWebhookService } from './terra/terra-webook.service';
import { TerraWebhookPayload } from './terra/webhook-types';
import { promises as fs } from 'fs';
import { join } from 'path';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly terraWebhookService: TerraWebhookService) {}

  @Get('terra')
  getWebhookInfo(): string {
    return 'Terra webhook service is running';
  }

  @Post('terra')
  async handleTerraWebhook(
    @Body() payload: TerraWebhookPayload,
    @Headers('terra-reference') terraReference?: string,
  ): Promise<void> {
    // Save webhook request to file
    await this.saveWebhookRequest(payload, terraReference);

    // Terra expects a fast response (200 OK)
    await this.terraWebhookService.handleTerraWebhook(payload, terraReference);
  }

  private async saveWebhookRequest(payload: TerraWebhookPayload, terraReference?: string): Promise<void> {
    try {
      // Format timestamp to match existing files: webhook-2025-11-02T23-39-29-387Z.json
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\.(\d{3})Z$/, '-$1Z');
      const filename = `webhook-${timestamp}.json`;
      const webhooksDir = join(process.cwd(), 'webhooks');

      // Ensure webhooks directory exists
      await fs.mkdir(webhooksDir, { recursive: true });

      // Save payload with terra-reference if available
      const dataToSave = terraReference ? { ...payload, _terraReference: terraReference } : payload;

      const filePath = join(webhooksDir, filename);
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (error) {
      // Log error but don't fail the webhook processing
      console.error('Failed to save webhook request:', error);
    }
  }
}
