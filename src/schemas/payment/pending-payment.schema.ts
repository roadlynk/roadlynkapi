import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HolderType } from '../../common/enums/bank-details.enum';
import { PaymentResourceType } from '../../common/enums/pending-payment.enum';

export type PendingPaymentDocument = PendingPayment & Document;

@Schema({ _id: false })
export class PendingPaymentResource {
  @Prop({
    type: String,
    enum: PaymentResourceType,
    required: true,
  })
  resourceType!: PaymentResourceType;

  // References DeliveryChallan or GoodsReceiptNote collection depending on resourceType
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'fromResource.resourceType',
  })
  id!: Types.ObjectId;
}

export const PendingPaymentResourceSchema = SchemaFactory.createForClass(
  PendingPaymentResource,
);

@Schema({ _id: false })
export class PendingPaymentReceiver {
  @Prop({
    type: String,
    enum: HolderType,
    required: true,
  })
  type!: HolderType;

  // References Company, Owner, or Driver collection depending on type
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'receiver.type',
  })
  id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'BankDetails',
  })
  bankId!: Types.ObjectId;
}

export const PendingPaymentReceiverSchema = SchemaFactory.createForClass(
  PendingPaymentReceiver,
);

@Schema({
  timestamps: true,
})
export class PendingPayment {
  @Prop({
    required: true,
  })
  date!: Date;

  @Prop({
    type: PendingPaymentResourceSchema,
    required: true,
  })
  fromResource!: PendingPaymentResource;

  @Prop({
    required: true,
  })
  amount!: number;

  @Prop({
    type: PendingPaymentReceiverSchema,
    required: true,
  })
  receiver!: PendingPaymentReceiver;
}

export const PendingPaymentSchema =
  SchemaFactory.createForClass(PendingPayment);