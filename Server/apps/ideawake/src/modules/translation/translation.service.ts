import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../../../../elastic/src/shared/services/config.service';
import { TranslationDto } from './dto';

@Injectable()
export class TranslationService {
  private configService = new ConfigService();
  private translationUrl;

  constructor(private readonly httpService: HttpService) {
    this.translationUrl =
      'https://translation.googleapis.com/language/translate/v2?key=' +
      this.configService.get('GOOGLE_TRANSLATE_KEY');
  }

  /**
   * Get translations
   */
  async getTranslation(data: TranslationDto): Promise<any> {
    const headersRequest = {
      'Content-Type': 'application/json',
      Origin: this.configService.get('GOOGLE_TRANSLATE_ORIGIN'),
    };
    const res = await this.httpService
      .post(this.translationUrl, data, { headers: headersRequest })
      .toPromise();
    return res.data;
  }
}
