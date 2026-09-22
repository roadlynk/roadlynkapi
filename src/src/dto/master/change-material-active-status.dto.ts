import { IsBoolean } from 'class-validator';

export class ChangeMaterialActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
