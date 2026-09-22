import { IsArray, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsStringNumberOrArray } from './validators/is-string-number-or-array.decorator';

class MaterialSpecificFieldDto {
  @IsString()
  fieldName!: string;

  @IsString()
  fieldType!: string;

  @IsOptional()
  @IsStringNumberOrArray()
  values?: string | number | Array<string | number>;
}

export class CreateMaterialDto {
  @IsMongoId()
  companyId!: string;

  @IsString()
  material!: string;

  @IsArray()
  @IsString({ each: true })
  category!: string[];

  @IsOptional()
  @IsString()
  quantityType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialSpecificFieldDto)
  materialSpecificFields?: MaterialSpecificFieldDto[];
}
