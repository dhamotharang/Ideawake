import { Repository } from 'typeorm';
import { EntityRepository } from 'typeorm/decorator/EntityRepository';
import { ShortcutEntity } from './shortcut.entity';

@EntityRepository(ShortcutEntity)
export class ShortcutRepository extends Repository<ShortcutEntity> {}
