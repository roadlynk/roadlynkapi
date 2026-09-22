import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EmployeeRole } from '../../common/enums/user-role.enum';
import { User } from './user.schema';
import { Company } from '../fleet/company.schema';

export type CompanyMembershipDocument = HydratedDocument<CompanyMembership>;

@Schema({
  timestamps: true,
  collection: 'company_memberships',
})
export class CompanyMembership {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Company.name,
    required: true,
    index: true,
  })
  companyId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: EmployeeRole,
  })
  employeeRole?: EmployeeRole;

  @Prop({
    default: true,
  })
  isActive?: boolean;

  @Prop({
    default: false,
  })
  isClient!: boolean;
}

export const CompanyMembershipSchema =
  SchemaFactory.createForClass(CompanyMembership);

CompanyMembershipSchema.index(
  { companyId: 1, employeeRole: 1, userId: 1 },
  { unique: true },
);
