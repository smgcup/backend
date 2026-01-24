import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ImageService } from './image.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadResponse } from './types/upload-response.type';

@Resolver()
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Mutation(() => UploadResponse, { name: 'uploadFile' })
  async uploadFile(@Args('uploadFileDto') uploadFileDto: UploadFileDto): Promise<UploadResponse> {
    return await this.imageService.uploadFile(uploadFileDto);
  }
}
