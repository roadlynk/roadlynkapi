import { IsBoolean } from 'class-validator';

export class ChangeDriverActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
