import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryChallanDocument = DeliveryChallan & Document;

@Schema({ _id: false })
export class CompanyDetails {
  @Prop({
    required: true,
    trim: true,
  })
  invoice!: string;

  @Prop({
    required: true,
    trim: true,
  })
  shipmentNumber!: string;

  @Prop({
    type: Date,
    required: true,
  })
  date!: Date;
}

export const CompanyDetailsSchema = SchemaFactory.createForClass(CompanyDetails);

@Schema({ _id: false })
export class Consignment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Client',
    required: true,
  })
  consignorId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClientBranch',
    required: true,
  })
  consignorBranchId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Client',
    required: true,
  })
  consigneeId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClientBranch',
    required: true,
  })
  consigneeBranchId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Bunk',
    required: true,
  })
  bunkId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CashAccount',
  })
  account?: Types.ObjectId;
}

export const ConsignmentSchema = SchemaFactory.createForClass(Consignment);

@Schema({ _id: false })
export class DealerDetails {
  @Prop({
    type: Types.ObjectId,
    ref: 'Dealer',
    required: true,
  })
  invoiceDealerId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Dealer',
    required: true,
  })
  shipToDealerId!: Types.ObjectId;

  @Prop({
    default: false,
  })
  isSame!: boolean;
}

export const DealerDetailsSchema = SchemaFactory.createForClass(DealerDetails);

@Schema({ _id: false })
export class MaterialDetails {
  @Prop({
    type: Types.ObjectId,
    ref: 'Material',
    required: true,
  })
  materialId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  deliveryCategory!: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  loadingQuantity!: number;

  @Prop({
    type: Object,
    default: {},
  })
  dynamicFields?: Record<string, unknown>;
}

export const MaterialDetailsSchema = SchemaFactory.createForClass(MaterialDetails);

@Schema({ _id: false })
export class RateDetails {
  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  transportRate!: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  transportIncentive?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  biddingAmount?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  totalTransportRate?: number;
}

export const RateDetailsSchema = SchemaFactory.createForClass(RateDetails);

@Schema({ _id: false })
export class DistanceDetails {
  @Prop({
    required: true,
    trim: true,
  })
  odomenterImageUrl!: string;
  
  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  odometerDistance?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  calculatedDistance?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  companyDistance?: number;
}

export const DistanceDetailsSchema = SchemaFactory.createForClass(DistanceDetails);

@Schema({ _id: false })
export class AdvanceDetails {
  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  cashAdvance?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  dieselAdvance?: number;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  bankAdvance?: number;

  @Prop({
    default: false,
  })
  bankPaymentDone?: boolean;

  @Prop({
    default: false,
  })
  bunkCreditUsed?: boolean;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  totalAdvance?: number;
}

export const AdvanceDetailsSchema = SchemaFactory.createForClass(AdvanceDetails);

@Schema({ _id: false })
export class AdditionalInformation {

  @Prop({
    trim: true,
  })
  notes?: string;
}

export const AdditionalInformationSchema =
  SchemaFactory.createForClass(AdditionalInformation);

@Schema({ _id: false })
export class TruckDetails {
  @Prop({
    type: Types.ObjectId,
    ref: 'Truck',
    required: true,
  })
  truckId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Driver',
    required: true,
  })
  driverId!: Types.ObjectId;
}

export const TruckDetailsSchema = SchemaFactory.createForClass(TruckDetails);

@Schema({
  timestamps: true,
})
export class DeliveryChallan {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    required: true,
    type: Number,
    min: 1,
  })
  sequence!: number;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  })
  dcNumber!: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  dcDate?: Date;

  @Prop({
    type: CompanyDetailsSchema,
    required: true,
  })
  companyDetails!: CompanyDetails;

  @Prop({
    type: ConsignmentSchema,
    required: true,
  })
  consignment!: Consignment;

  @Prop({
    type: TruckDetailsSchema,
    required: true,
  })
  truckDetails!: TruckDetails;

  @Prop({
    type: DealerDetailsSchema,
    required: true,
  })
  dealerDetails!: DealerDetails;

  @Prop({
    type: MaterialDetailsSchema,
    required: true,
  })
  material!: MaterialDetails;

  @Prop({
    type: RateDetailsSchema,
    required: true,
  })
  rate!: RateDetails;

  @Prop({
    type: DistanceDetailsSchema,
    required: true,
  })
  distance!: DistanceDetails;

  @Prop({
    type: AdvanceDetailsSchema,
    required: true,
  })
  advance!: AdvanceDetails;

  @Prop({
    type: AdditionalInformationSchema,
    default: {},
  })
  additionalInformation?: AdditionalInformation;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const DeliveryChallanSchema = SchemaFactory.createForClass(DeliveryChallan);
DeliveryChallanSchema.index({ companyId: 1, sequence: 1 }, { unique: true });
DeliveryChallanSchema.index({ companyId: 1, dcNumber: 1 }, { unique: true });
