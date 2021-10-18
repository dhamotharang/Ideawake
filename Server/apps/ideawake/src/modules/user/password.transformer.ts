import { ValueTransformer } from 'typeorm';
import { UtilsService } from '../../providers/utils.service';

export class PasswordTransformer implements ValueTransformer {
  to(value) {
    if (value) {
      return UtilsService.generateHash(value);
    } else {
      return null;
    }
  }
  from(value) {
    return value;
  }
}
