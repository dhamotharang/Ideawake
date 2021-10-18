import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { PasswordPolicyService } from './password-policy.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';

@Controller('password-policy')
export class PasswordPolicyController {
  constructor(private readonly passwordPolicyService: PasswordPolicyService) {}

  @Post()
  async addPasswordPolicy(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.passwordPolicyService.addPasswordPolicy(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get()
  async getAllPasswordPolicies(): Promise<ResponseFormat> {
    const options = {};
    const passowrdPolicies = await this.passwordPolicyService.getPasswordPolicies(
      options,
    );
    return ResponseFormatService.responseOk(passowrdPolicies, 'All');
  }

  @Get(':id')
  async getPasswordPolicy(@Param('id') id: string): Promise<ResponseFormat> {
    const passPolicy = await this.passwordPolicyService.getPasswordPolicies({
      id: id,
    });
    return ResponseFormatService.responseOk(passPolicy, '');
  }

  @Patch(':id')
  async updatePasswordPolicy(
    @Param('id') id: string,
    @Body() body: {},
  ): Promise<ResponseFormat> {
    const updateResponse = this.passwordPolicyService.updatePasswordPolicy(
      { id: id },
      body,
    );
    return ResponseFormatService.responseOk(updateResponse, '');
  }

  @Delete(':id')
  async removePasswordPolicy(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = this.passwordPolicyService.deletePasswordPolicy({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
