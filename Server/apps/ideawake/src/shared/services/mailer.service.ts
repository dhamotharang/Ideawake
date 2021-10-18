import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { UtilsService } from '../../providers/utils.service';
import { EMAIL_TEMPLATE } from '../../common/constants/constants';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendInvite(
    inviteId,
    to,
    originUrl,
    emailBody,
    from?,
    subject?,
    text?,
    html?,
  ): Promise<void> {
    emailBody = emailBody.replace(
      '{{inviteLink}}',
      UtilsService.generateInviteUrl(originUrl, inviteId),
    );
    html = `${EMAIL_TEMPLATE.header}
    ${emailBody}
    ${EMAIL_TEMPLATE.footer}
    `;
    return this.mailerService
      .sendMail({
        to: to,
        from: from || 'noreply@ideawake.com',
        subject: subject || 'User Invite',
        text: text || 'welcome',
        html: html,
      })
      .then(resp => {
        return resp;
      })
      .catch(err => {
        throw err;
      });
  }
  public async sendResetPassword(
    to,
    resetCode,
    originUrl,
    emailBody,
    from?,
    subject?,
    text?,
    html?,
  ): Promise<void> {
    emailBody = emailBody.replace(
      '{{resetLink}}',
      UtilsService.generatePasswordResetUrl(originUrl, resetCode),
    );
    html = `${EMAIL_TEMPLATE.header}
    ${emailBody}
    ${EMAIL_TEMPLATE.footer}
    `;
    await this.mailerService
      .sendMail({
        to: to,
        from: from || 'noreply@ideawake.com',
        subject: subject || 'Reset Password',
        text: text || 'Reset Password',
        html: html,
      })
      .then(resp => resp)
      .catch(err => {
        throw err;
      });
  }
  public async sendEmail(to, from, html, subject): Promise<void> {
    return this.mailerService
      .sendMail({
        to: to,
        from: from || 'noreply@ideawake.com',
        subject: subject || 'Notifications',
        text: 'test text',
        html: html,
      })
      .then(resp => {
        return resp;
      })
      .catch(err => {
        throw err;
      });
  }
}
