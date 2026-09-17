import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmployeeRole, UserCompanyType, UserRole } from '../../common/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (_doc, ret: Record<string, unknown>) {
      delete ret['passwordHash'];
      delete ret['__v'];
      return ret;
    },
  },
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  username?: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email?: string;

  @Prop({
    required: true,
    select: false,
  })
  passwordHash!: string; 

  @Prop({
    type: String,
    enum: UserCompanyType,
    required: false,
  })
  userCompanyType?: UserCompanyType;

  @Prop({
    type: String,
    enum: UserRole,
    required: false,
  })
  userRole?: UserRole;

  @Prop({
    type: [String],
    enum: EmployeeRole,
    default: [],
  })
  employeeRoles?: EmployeeRole[];

  @Prop({
    type: Number,
    default: 1,
  })
  tokenVersion!: number;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
