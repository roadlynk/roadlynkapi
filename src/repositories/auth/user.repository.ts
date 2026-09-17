import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmployeeRole,
  UserCompanyType,
  UserRole,
} from '../../common/enums/user-role.enum';
import { User, UserDocument } from '../../schemas/auth-users/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  findByUsername(username: string) {
    return this.userModel
      .findOne({ username })
      .select('+passwordHash')
      .exec();
  }

  findByEmail(email: string) {
    return this.userModel
      .findOne({ email })
      .select('+passwordHash')
      .exec();
  }

  findByEmailExcludingId(email: string, id: string) {
    return this.userModel
      .findOne({ email, _id: { $ne: id } })
      .select('-passwordHash')
      .exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  findByIdWithPassword(id: string) {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  findProviderEmployees() {
    return this.userModel
      .find({
        userCompanyType: UserCompanyType.PROVIDER,
        userRole: UserRole.EMPLOYEE,
        isActive: true,
      })
      .select('-passwordHash -__v')
      .sort({ username: 1 })
      .lean()
      .exec();
  }

  findProviderEmployeesAndClientAdmins(isActive: boolean) {
    return this.userModel
      .aggregate([
        {
          $match: {
            isActive,
            $or: [
              {
                userCompanyType: UserCompanyType.PROVIDER,
                userRole: UserRole.EMPLOYEE,
              },
              {
                userCompanyType: UserCompanyType.CLIENT,
                userRole: UserRole.ADMIN,
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'company_memberships',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$isActive', true] },
                    ],
                  },
                },
              },
            ],
            as: 'memberships',
          },
        },
        { $unwind: { path: '$memberships', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'companies',
            let: { companyId: '$memberships.companyId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$companyId'] },
                      { $eq: ['$isActive', true] },
                    ],
                  },
                },
              },
            ],
            as: 'company',
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$_id',
            username: { $first: '$username' },
            email: { $first: '$email' },
            userCompanyType: { $first: '$userCompanyType' },
            userRole: { $first: '$userRole' },
            employeeRoles: { $first: '$employeeRoles' },
            isActive: { $first: '$isActive' },
            companies: {
              $addToSet: {
                $cond: [
                  { $ne: ['$company._id', null] },
                  {
                    id: '$company._id',
                    companyName: '$company.companyName',
                  },
                  null,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            email: 1,
            userCompanyType: 1,
            userRole: 1,
            employeeRoles: 1,
            isActive: 1,
            companies: {
              $filter: {
                input: '$companies',
                as: 'company',
                cond: { $ne: ['$$company', null] },
              },
            },
          },
        },
        { $sort: { username: 1 } },
      ])
      .exec();
  }

  findByUsernameOrEmail(username: string, email: string) {
    return this.userModel.findOne({ $or: [{ username }, { email }] }).exec();
  }

  create(user: Partial<User>) {
    return this.userModel.create(user);
  }

  updatePasswordAndIncrementTokenVersion(id: string, passwordHash: string) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { passwordHash }, $inc: { tokenVersion: 1 } },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .exec();
  }

  updateBasicInfo(
    id: string,
    update: Partial<Pick<User, 'username' | 'email' | 'passwordHash'>>,
  ) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $set: update, $inc: { tokenVersion: 1 } },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .exec();
  }

  updateRolesAndIncrementTokenVersion(
    id: string,
    employeeRoles?: EmployeeRole[],
  ) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(employeeRoles !== undefined ? { employeeRoles } : {}),
          },
          $inc: { tokenVersion: 1 },
        },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .exec();
  }

  updateActiveStatusAndIncrementTokenVersion(id: string, isActive: boolean) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive }, $inc: { tokenVersion: 1 } },
        { returnDocument: 'after' },
      )
      .select('-passwordHash')
      .exec();
  }
}