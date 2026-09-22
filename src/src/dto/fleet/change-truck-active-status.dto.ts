import { ArrayNotEmpty, IsArray, IsBoolean, IsMongoId } from 'class-validator';

export class ChangeTruckActiveStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  truckIds!: string[];

  @IsBoolean()
  isActive!: boolean;
}
