import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Manufacturer } from '../../schemas/fleet/truck.schema';

export class UpdateTruckDto {
  @IsOptional()
  @IsString()
  truckNumber?: string;

  @IsOptional()
  @IsString()
  chasisNumber?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  wheelType?: number;

  @IsOptional()
  @IsNumber()
  fuelTankCapacity?: number;

  @IsOptional()
  @IsNumber()
  horsePower?: number;

  @IsOptional()
  @IsEnum(Manufacturer)
  manufacturer?: Manufacturer;

  @IsOptional()
  @IsNumber()
  manufacturingYear?: number;
}
