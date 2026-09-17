import { IsBoolean } from 'class-validator';

export class ChangeDealerActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}