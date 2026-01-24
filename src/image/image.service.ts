import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadResponse } from './types/upload-response.type';
import { BadRequestError, InternalServerError } from '../exception/exceptions';
import { IMAGE_TRANSLATION_CODES } from '../exception/translation-codes/image.translation-codes';
import { generateUuidv7 } from '../shared/utils';

@Injectable()
export class ImageService {
  private readonly supabase: SupabaseClient;
  private readonly signedUrlExpiresIn: number = 60 * 60 * 24 * 400; // 400 days in seconds

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async uploadFile(uploadFileDto: UploadFileDto): Promise<UploadResponse> {
    const { fileBase64, fileName, mimeType, bucket } = uploadFileDto;

    if (!bucket) {
      throw new BadRequestError(IMAGE_TRANSLATION_CODES.bucketNotFound);
    }

    const fileBuffer = this.decodeBase64(fileBase64);
    const uniqueFileName = this.generateUniqueFileName(fileName);

    const { data, error } = await this.supabase.storage.from(bucket).upload(uniqueFileName, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      throw new InternalServerError(IMAGE_TRANSLATION_CODES.uploadFailed, error.message);
    }

    const signedUrl = await this.createSignedUrl(bucket, data.path);

    return {
      path: data.path,
      signedUrl,
    };
  }

  async createSignedUrl(bucket: string, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage.from(bucket).createSignedUrl(path, this.signedUrlExpiresIn);

    if (error) {
      throw new InternalServerError(IMAGE_TRANSLATION_CODES.uploadFailed, error.message);
    }

    return data.signedUrl;
  }

  private decodeBase64(base64String: string): Buffer {
    try {
      const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
      return Buffer.from(base64Data, 'base64');
    } catch {
      throw new BadRequestError(IMAGE_TRANSLATION_CODES.invalidBase64);
    }
  }

  private generateUniqueFileName(originalFileName: string): string {
    const extension = originalFileName.split('.').pop() || '';
    const uuid = generateUuidv7();
    return extension ? `${uuid}.${extension}` : uuid;
  }
}
