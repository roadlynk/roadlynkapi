import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGstConfigurerDto {
  @IsString()
  code!: string;

  @IsNumber()
  @Min(0)
  percentage!: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
