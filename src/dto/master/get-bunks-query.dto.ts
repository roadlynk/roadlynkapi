import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class GetBunksQueryDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsString()
  search?: string;
}
