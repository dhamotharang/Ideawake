import {
  Controller,
  Get,
  Logger,
  Query,
  Req,
  Param,
  Body,
  Patch,
  Post,
} from '@nestjs/common';
import { EmailTemplateService } from './emailTemplate.service';
import { Request } from 'express';
import { ResponseFormatService } from '../../shared/services/response-format.service';
import { ResponseFormat } from '../../interfaces/IResponseFormat';
import { EditEmailTemplateDto, TestEmailTemplateDto } from './dto/';
import { MailService } from '../../shared/services/mailer.service';
import {
  EMAIL_BOOKMARKS,
  TEST_EMAIL_TEMPLATE,
} from '../../common/constants/constants';
import { CommunityService } from '../community/community.service';
import { forEach } from 'lodash';
import { UtilsService } from '../../providers/utils.service';

@Controller('email-templates')
export class EmailTemplatesController {
  private looger = new Logger('Notification Controller');
  constructor(
    private emailTemplateService: EmailTemplateService,
    public readonly mailService: MailService,
    public readonly communityService: CommunityService,
  ) {}

  @Get()
  /**
   * Get community all templates
   * @param {Object} query, req
   * @return List of community template
   */
  async getCommunityEmailTemplates(
    @Query() queryParams,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    this.looger.log('Get all community templates', req['userData'].id);
    const activityData = await this.emailTemplateService.getCommunityEmailTemplates(
      {
        userId: req['userData'].id,
        community: queryParams.community,
      },
    );
    return ResponseFormatService.responseOk(activityData, '');
  }

  @Post('test-email')
  async testEmailTemplate(
    @Body() body: TestEmailTemplateDto,
    @Req() req: Request,
  ): Promise<ResponseFormat> {
    const community = await this.communityService.getOneCommunity({
      where: { id: req['userData'].currentCommunity },
    });

    let emailTemplate = TEST_EMAIL_TEMPLATE;

    const replacements = {
      [EMAIL_BOOKMARKS.BODY]: body.body,
      [EMAIL_BOOKMARKS.FEATURE_IMG]: body.featureImage,
      [EMAIL_BOOKMARKS.FOOTER]: body.footerSection,
      [EMAIL_BOOKMARKS.COMMUNITY_NAME]: community.name,
      [EMAIL_BOOKMARKS.COMPANY_NAME]: community.name,
      [EMAIL_BOOKMARKS.TAG_LINE]: '',
      [EMAIL_BOOKMARKS.LINK_BTN]: UtilsService.generateRedirectEmailButton(
        '#',
        'Sample Link',
      ),
      [EMAIL_BOOKMARKS.VIEW_UPDATE_BTN]: UtilsService.generateRedirectEmailButton(
        '#',
        'View Updates',
      ),
      [EMAIL_BOOKMARKS.VIEW_CHALLENGE_OPPO_BTN]: UtilsService.generateRedirectEmailButton(
        '#',
        'View Challenge / Opportunity',
      ),
    };

    forEach(replacements, (replacement, key) => {
      emailTemplate = emailTemplate.replace(new RegExp(key, 'g'), replacement);
      body.subject = body.subject.replace(new RegExp(key, 'g'), replacement);
    });

    await this.mailService.sendEmail(
      req['userData'].email,
      '',
      emailTemplate,
      body.subject,
    );
    return ResponseFormatService.responseOk([], 'Email Sent Successfully');
  }

  @Patch(':templateId/:communityId')
  async readNotifications(
    @Param('communityId') communityId,
    @Param('templateId') templateId,
    @Req() req,
    @Body() body: EditEmailTemplateDto,
  ): Promise<ResponseFormat> {
    const templateParams = {
      params: {
        community: communityId,
        id: templateId,
        userId: req['userData'].id,
      },
      data: body,
    };
    const updatedEmailTemplate = await this.emailTemplateService.updateCommunityEmailTemplate(
      templateParams,
    );
    return ResponseFormatService.responseOk(updatedEmailTemplate, '');
  }
}
