import { InviteService } from './../invite/invite.service';
import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenDto } from './dto/AccessTokenDto';
import { AuthService } from '../../modules/auth/auth.service';
import { UserService } from '../user/user.service';
import { IntegrationService } from '../integration/integration.service';
import { Request } from 'express';

@Controller('oauth')
export class AccessTokenController {
  constructor(
    private readonly AuthService: AuthService,
    public readonly userService: UserService,
    public readonly inviteService: InviteService,
    private readonly integrationService: IntegrationService,
  ) {}
  @Post('token')
  /**
   * Get Access Token to Integrate External APPS
   * @param {} body clientId, clientSecret, redirectUri
   * @param {} req community from request
   * @return Access Token
   */
  async getAccessToken(
    @Body() body: AccessTokenDto,
    @Req() req: Request,
  ): Promise<{}> {
    const findIntegrationOptions = {
      clientId: body.client_id,
      community: req['userData'].currentCommunity,
      redirectUrl: body.redirect_uri,
      user: req['userData'].id,
    };
    const integrationData = await this.integrationService.getIntegrations({
      where: findIntegrationOptions,
    });

    //Autorize Access Only
    if (integrationData.length == 0) {
      throw new UnauthorizedException();
    }

    //Get Access Token
    const accessToken = await this.AuthService.accessToken({
      userId: req['userData'].id,
      community: req['userData'].currentCommunity,
    });

    //Update Newly Created Token
    await this.integrationService.updateIntegration(
      { clinetId: body.client_id },
      { token: accessToken.fullToken, refreshToken: accessToken.refreshToken },
    );
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: accessToken.fullToken,
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: accessToken.refreshToken,
    };
  }
}
