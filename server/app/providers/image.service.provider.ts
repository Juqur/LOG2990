import { ImageService } from '@app/services/image/image.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageServiceProvider {
    create(): ImageService {
        return new ImageService();
    }
}
