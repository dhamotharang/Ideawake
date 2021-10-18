import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { PasswordResetEntity } from './password-reset.entity';

@EntityRepository(PasswordResetEntity)
export class PasswordResetRepository extends Repository<PasswordResetEntity> {}
