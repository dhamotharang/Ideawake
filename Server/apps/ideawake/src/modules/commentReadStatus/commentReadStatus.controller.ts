import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { ThemeService } from './commentReadStatus.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Post()
  async addTheme(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.themeService.addTheme(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllThemes(): Promise<ResponseFormat> {
    const options = {};
    const themes = await this.themeService.getThemes(options);
    return ResponseFormatService.responseOk(themes, 'All');
  }

  @Get(':id')
  async getTheme(@Param('id') id: string): Promise<ResponseFormat> {
    const theme = await this.themeService.getThemes({ id: id });
    return ResponseFormatService.responseOk(theme, 'All');
  }

  @Patch(':id')
  async updateTheme(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateData = await this.themeService.updateTheme({ id: id }, body);
    return ResponseFormatService.responseOk(updateData, '');
  }

  @Delete(':id')
  async removeTheme(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteData = await this.themeService.deleteTheme({ id: id });
    return ResponseFormatService.responseOk(deleteData, '');
  }
}
