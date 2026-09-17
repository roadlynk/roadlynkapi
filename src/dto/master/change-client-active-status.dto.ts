import { IsBoolean } from 'class-validator';

export class ChangeClientActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
