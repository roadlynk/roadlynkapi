import { IsBoolean } from 'class-validator';

export class ChangeCompanyActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}