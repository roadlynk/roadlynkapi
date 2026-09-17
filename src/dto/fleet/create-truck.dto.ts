import { IsEnum, IsMongoId, IsNumber, IsString } from 'class-validator';
import { Manufacturer } from '../../schemas/fleet/truck.schema';

export class CreateTruckDto {
  @IsString()
  truckNumber!: string;

  @IsString()
  chasisNumber!: string;

  @IsNumber()
  capacity!: number;

  @IsNumber()
  wheelType!: number;

  @IsNumber()
  fuelTankCapacity!: number;

  @IsNumber()
  horsePower!: number;

  @IsEnum(Manufacturer)
  manufacturer!: Manufacturer;

  @IsNumber()
  manufacturingYear!: number;

  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  ownerId!: string;
}
