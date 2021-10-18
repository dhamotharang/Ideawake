import { SetMetadata, applyDecorators } from '@nestjs/common';

import { RoleLevelEnum } from '../enum/role-level.enum';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Permissions(
  roleLevel: RoleLevelEnum,
  requestKey: string,
  elementKey: string,
  permissionsToCheck: string[],
  condition: string,
) {
  return applyDecorators(
    SetMetadata('roleLevel', roleLevel),
    SetMetadata('requestKey', requestKey),
    SetMetadata('elementKey', elementKey),
    SetMetadata('permissionsToCheck', permissionsToCheck),
    SetMetadata('condition', condition),
  );
}
