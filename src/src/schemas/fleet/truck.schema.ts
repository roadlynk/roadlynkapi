import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TruckDocument = Truck & Document;

export enum Manufacturer {
  MAHENDRA = 'MAHENDRA',
  TATA = 'TATA',
  EICHER = 'EICHER',
  ASHOK_LEYLAND = 'ASHOK_LEYLAND',
}

@Schema({ _id: false })
export class CertificateValidity {
  @Prop({
    type: Date,
    required: true,
  })
  fromDate!: Date;

  @Prop({
    type: Date,
    required: true,
  })
  toDate!: Date;
}

export const CertificateValiditySchema =
  SchemaFactory.createForClass(CertificateValidity);

@Schema({ _id: false })
export class Certificate {
  @Prop({
    type: CertificateValiditySchema,
    required: true,
  })
  fitnessCertificate!: CertificateValidity;

  @Prop({
    type: CertificateValiditySchema,
    required: true,
  })
  permitDate!: CertificateValidity;

  @Prop({
    type: CertificateValiditySchema,
    required: true,
  })
  insurance!: CertificateValidity;

  @Prop({
    type: CertificateValiditySchema,
    required: true,
  })
  pollutionCertificate!: CertificateValidity;

  @Prop({
    type: CertificateValiditySchema,
    required: true,
  })
  taxCertificate!: CertificateValidity;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

@Schema({
  timestamps: true,
})
export class Truck {
  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  truckNumber!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  chasisNumber!: string;

  @Prop({
    required: true,
    type: Number,
  })
  capacity!: number;

  @Prop({
    type: Number,
    required: true,
  })
  wheelType!: number;

  @Prop({
    required: true,
    type: Number,
  })
  fuelTankCapacity!: number;

  @Prop({
    required: true,
    type: Number,
  })
  horsePower!: number;

  @Prop({
    type: String,
    enum: Manufacturer,
    required: true,
  })
  manufacturer!: Manufacturer;

  @Prop({
    required: true,
    type: Number,
  })
  manufacturingYear!: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Owner',
    required: true,
    index: true,
  })
  ownerId!: Types.ObjectId;

  @Prop({
    type: CertificateSchema,
    required: true,
  })
  certificate!: Certificate;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const TruckSchema = SchemaFactory.createForClass(Truck);
TruckSchema.index({ companyId: 1, truckNumber: 1 }, { unique: true });
TruckSchema.index({ companyId: 1, chasisNumber: 1 }, { unique: true });
