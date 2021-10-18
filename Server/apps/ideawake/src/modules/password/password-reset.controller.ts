import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { PasswordResetService } from './password-reset.service';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { ResetUserPasswordDto } from './dto';
import { UserService } from '../user/user.service';
@Controller('password-reset')
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async addPasswordReset(@Body() body: {}): Promise<ResponseFormat> {
    const response = await this.passwordResetService.addPasswordReset(body);
    return ResponseFormatService.responseOk(response, 'Created Successfully');
  }

  @Get(':resetCode')
  async getPasswordReset(
    @Param('resetCode') resetCode: string,
  ): Promise<ResponseFormat> {
    const passwortReset = await this.passwordResetService.getPasswordResets({
      resetCode: resetCode,
    });
    return ResponseFormatService.responseOk(passwortReset, '');
  }

  @Patch('user')
  async resetUserPass(
    @Body() body: ResetUserPasswordDto,
  ): Promise<ResponseFormat> {
    const passwortReset = await this.passwordResetService.getPasswordReset({
      resetCode: body.resetCode,
    });
    const updateRes = await this.userService.updateUser(
      { id: passwortReset.userId },
      { password: body.password },
    );
    return ResponseFormatService.responseOk(updateRes, 'Password Updated!');
  }

  @Delete(':id')
  async removePasswordReset(@Param('id') id: string): Promise<ResponseFormat> {
    const deleteResponse = await this.passwordResetService.deletePasswordReset({
      id: id,
    });
    return ResponseFormatService.responseOk(deleteResponse, '');
  }
}
