import { IsBoolean } from 'class-validator';

export class ChangeCashAccountActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
