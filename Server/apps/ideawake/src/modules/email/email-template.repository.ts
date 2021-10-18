import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { EmailTemplateEntity } from './email-template.entity';

@EntityRepository(EmailTemplateEntity)
export class EmailTemplateRepository extends Repository<EmailTemplateEntity> {}
