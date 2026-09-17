import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ _id: false })
export class Actor {
  @Prop({
    type: Types.ObjectId,
  })
  id?: Types.ObjectId;

  @Prop({
    trim: true,
    lowercase: true,
  })
  email?: string;

  @Prop({
    trim: true,
  })
  name?: string;
}

export const ActorSchema = SchemaFactory.createForClass(Actor);

@Schema({ _id: false })
export class Resource {
  @Prop({
    trim: true,
  })
  type?: string;

  @Prop({
    type: Types.ObjectId,
  })
  id?: Types.ObjectId;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ _id: false })
export class Request {
  @Prop({
    required: true,
    trim: true,
  })
  method!: string;

  @Prop({
    required: true,
    trim: true,
  })
  path!: string;

  @Prop({
    type: Object,
  })
  body?: Record<string, unknown>;
}

export const RequestSchema = SchemaFactory.createForClass(Request);

@Schema({ _id: false })
export class Result {
  @Prop({
    required: true,
    trim: true,
  })
  status!: string;

  @Prop({
    required: true,
  })
  code!: number;

  @Prop({
    trim: true,
  })
  errorCode?: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);

@Schema({
  timestamps: { createdAt: 'timestamp', updatedAt: false },
})
export class AuditLog {
  @Prop({
    required: true,
    trim: true,
  })
  action!: string;

  @Prop({
    type: ActorSchema,
  })
  actor?: Actor;

  @Prop({
    type: ResourceSchema,
  })
  resource?: Resource;

  @Prop({
    trim: true,
  })
  reason?: string;

  @Prop({
    type: RequestSchema,
    required: true,
  })
  request!: Request;

  @Prop({
    type: ResultSchema,
    required: true,
  })
  result!: Result;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);