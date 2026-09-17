import { IsBoolean, IsOptional } from 'class-validator';

export class ChangeUserActiveStatusDto {
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  companyId?: string;

}