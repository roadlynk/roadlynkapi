import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as CloudinaryType,
} from 'cloudinary';
import { CLOUDINARY } from '../../config/cloudinary.config';

type MulterFile = { buffer: Buffer; originalname: string; mimetype: string; size: number };

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: typeof CloudinaryType) {}

  async uploadImage(file: MulterFile, folder = 'my-app') {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder },
        (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              new InternalServerErrorException(
                error?.message ?? 'Failed to upload image to Cloudinary',
              ),
            );
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });

    return { secure_url: result.secure_url, public_id: result.public_id };
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
