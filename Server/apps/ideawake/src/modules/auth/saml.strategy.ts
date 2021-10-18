import * as _ from 'lodash';
import { Strategy } from 'passport-saml';

import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';

import { SamlObject } from '../../interfaces';
import { UserService } from '../../modules/user/user.service';
import { UtilsService } from '../../providers/utils.service';
import { ConfigService } from '../../shared/services/config.service';

@Injectable({ scope: Scope.REQUEST })
export class SamlStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('SamlStrategy');

  constructor(
    public readonly configService: ConfigService,
    public readonly userService: UserService,
    @Inject(REQUEST) request,
  ) {
    super({
      ...(request['SAML_ENTRYPOINT'] && {
        entryPoint: request['SAML_ENTRYPOINT'],
      }),
      ...(request['SAML_ISSUER'] && { issuer: request['SAML_ISSUER'] }),
      ...(request['SAML_CALLBACK_URL'] && {
        callbackUrl: request['SAML_CALLBACK_URL'],
      }),

      acceptedClockSkewMs: configService.getNumber(
        'SAML_ACCEPTED_CLOCK_SKEW_MS',
      ),
      identifierFormat: configService.get('SAML_IDENTIFIER_FORMAT') || null,
      signatureAlgorithm: configService.get('SAML_SIGNATURE_ALGORITHM'),
      disableRequestedAuthnContext: configService.getBoolean(
        'SAML_DISABLE_REQUESTED_AUTHN_CONTEXT',
      ),

      passReqToCallBack: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(profile, _done): Promise<SamlObject> {
    try {
      const parsedProfile = this.parseSamlResponse(profile);

      if (!parsedProfile.email) {
        this.logger.error('Error in SAML Login: Email not found:');
        this.logger.error(
          'Parsed Erroronus SAML Response:',
          JSON.stringify(parsedProfile),
        );
        this.logger.error('Erroronus SAML Reseponse:', JSON.stringify(profile));
      }

      return parsedProfile;
    } catch (err) {
      this.logger.error('Error in SAML Login:', err);
      throw err;
    }
  }

  /**
   * Parse user profile in SAML's response.
   * @param profile User's profile returned in SAML response.
   */
  private parseSamlResponse(profile: {}): SamlObject {
    const claimUrl = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/';
    const requiredKeys = [
      'email',
      'name',
      'emailaddress',
      'emailAddress',
      'upn',
      'nameID',
      'surname',
      'given_name',
      'givenname',
      'lastName',
      'firstName',
    ];
    const parsedProfile: SamlObject = {};

    _.forEach(requiredKeys, function(key) {
      parsedProfile[key] =
        key !== 'email'
          ? profile[key] || profile[`${claimUrl}${key}`] || ''
          : '';

      // Parsing valid email (if not already found).
      if (!parsedProfile.email) {
        if (profile[key] && UtilsService.validateEmail(String(profile[key]))) {
          parsedProfile.email = profile[key];
        } else if (
          profile[`${claimUrl}${key}`] &&
          UtilsService.validateEmail(String(profile[`${claimUrl}${key}`]))
        ) {
          parsedProfile.email = profile[`${claimUrl}${key}`];
        }
      }
    });
    parsedProfile.email = String(parsedProfile.email).toLowerCase();

    // Name standardization.
    parsedProfile.firstName =
      parsedProfile.given_name ||
      parsedProfile.givenname ||
      parsedProfile.firstName ||
      _.head(parsedProfile.email.split('@'));
    parsedProfile.lastName =
      parsedProfile.surname || parsedProfile.lastName || '';

    return parsedProfile;
  }
}
