import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { IsStringNumberOrArray } from './validators/is-string-number-or-array.decorator';

class UpdateMaterialSpecificFieldDto {
  @IsString()
  fieldName!: string;

  @IsString()
  fieldType!: string;

  @IsOptional()
  @IsStringNumberOrArray()
  values?: string | number | Array<string | number>;
}

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category?: string[];

  @IsOptional()
  @IsString()
  quantityType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialSpecificFieldDto)
  materialSpecificFields?: UpdateMaterialSpecificFieldDto[];
}
