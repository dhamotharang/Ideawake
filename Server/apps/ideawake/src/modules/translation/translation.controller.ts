import { Controller, Post, Body } from '@nestjs/common';

import { TranslationService } from './translation.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { TranslationDto } from './dto';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post('get-translation')
  async getTranslation(@Body() body: TranslationDto): Promise<any> {
    const response = await this.translationService.getTranslation(body);
    return ResponseFormatService.responseOk(response, 'Translation');
  }
}
