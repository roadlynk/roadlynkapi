import { IsBoolean } from 'class-validator';

export class ChangeOwnerActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
