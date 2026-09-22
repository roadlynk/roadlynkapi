import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HolderType } from '../../common/enums/bank-details.enum';
import { PaymentResourceType } from '../../common/enums/pending-payment.enum';

export type CashPaymentDocument = CashPayment & Document;

@Schema({ _id: false })
export class CashPaymentResource {
  @Prop({
    type: String,
    enum: PaymentResourceType,
    required: true,
  })
  resourceType!: PaymentResourceType;

  // References DeliveryChallan or GoodsReceiptNote collection decash on resourceType
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'fromResource.resourceType',
  })
  id!: Types.ObjectId;
}

export const CashPaymentResourceSchema = SchemaFactory.createForClass(
  CashPaymentResource,
);

@Schema({ _id: false })
export class CashPaymentReceiver {
  @Prop({
    type: String,
    enum: HolderType,
    required: true,
  })
  type!: HolderType;

  // References Company, Owner, or Driver collection decash on type
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'receiver.type',
  })
  id!: Types.ObjectId;
}

export const CashPaymentReceiverSchema = SchemaFactory.createForClass(
  CashPaymentReceiver,
);

@Schema({
  timestamps: true,
})
export class CashPayment {
  @Prop({
    required: true,
  })
  date!: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'CashAccount',
    required: true,
  })
  cashAccountId!: Types.ObjectId;

  @Prop({
    type: CashPaymentResourceSchema,
    required: true,
  })
  fromResource!: CashPaymentResource;

  @Prop({
    required: true,
  })
  amount!: number;

  @Prop({
    type: CashPaymentReceiverSchema,
    required: true,
  })
  receiver!: CashPaymentReceiver;
}

export const CashPaymentSchema =
  SchemaFactory.createForClass(CashPayment);
