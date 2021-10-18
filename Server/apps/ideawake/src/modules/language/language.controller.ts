import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { LanguageService } from './language.service';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  async addLanguage(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.languageService.addLanguage(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllLanguages(): Promise<ResponseFormat> {
    const options = {};
    const languages = await this.languageService.getLanguages(options);
    return ResponseFormatService.responseOk(languages, 'All');
  }

  @Get(':id')
  async getLanguage(@Param('id') id: string): Promise<ResponseFormat> {
    const language = await this.languageService.getLanguages({ id: id });
    return ResponseFormatService.responseOk(language, '');
  }

  @Patch(':id')
  async updateLanguage(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateResponse = await this.languageService.updateLanguage(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateResponse, '');
  }

  @Delete(':id')
  async removeLanguage(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.languageService.deleteLanguage({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
