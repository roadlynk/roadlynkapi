import { Matches } from 'class-validator';

export class GetPincodeQueryDto {
  @Matches(/^\d{6}$/, { message: 'pincode must be a valid 6-digit number' })
  pincode!: string;
}
