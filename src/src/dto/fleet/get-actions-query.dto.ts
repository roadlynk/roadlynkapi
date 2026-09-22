import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId } from 'class-validator';

export class GetActionsQueryDto {
  @IsMongoId()
  companyId!: string;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isDone!: boolean;
}
