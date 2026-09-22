import { IsBoolean } from 'class-validator';

export class ChangeClientBranchActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
