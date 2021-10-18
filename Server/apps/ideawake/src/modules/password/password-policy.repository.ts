import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { PasswordPolicyEntity } from './password-policy.entity';

@EntityRepository(PasswordPolicyEntity)
export class PasswordPolicyRepository extends Repository<
  PasswordPolicyEntity
> {}
