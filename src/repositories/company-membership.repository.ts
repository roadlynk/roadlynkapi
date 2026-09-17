import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CompanyMembership,
  CompanyMembershipDocument,
} from '../schemas/auth-users/company-membership.schema';
import { EmployeeRole } from '../common/enums/user-role.enum';

@Injectable()
export class CompanyMembershipRepository {
  constructor(
    @InjectModel(CompanyMembership.name)
    private readonly companyMembershipModel: Model<CompanyMembershipDocument>,
  ) {}

  findActiveUniqueCompaniesByUserId(userId: string) {
    return this.companyMembershipModel
      .aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            isActive: true,
          },
        },
        { $group: { _id: '$companyId', membership: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$membership' } },
        {
          $lookup: {
            from: 'companies',
            localField: 'companyId',
            foreignField: '_id',
            as: 'companyId',
          },
        },
        { $unwind: { path: '$companyId', preserveNullAndEmptyArrays: true } },
        { $match: { 'companyId.isActive': true } },
      ])
      .exec();
  }

  async findActiveUniqueCompaniesPaginated(
    userId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const result = await this.companyMembershipModel
      .aggregate<{
        data: Record<string, unknown>[];
        total: Array<{ count: number }>;
      }>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            isActive: true,
          },
        },
        { $group: { _id: '$companyId' } },
        {
          $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        { $match: { 'company.isActive': true } },
        { $replaceRoot: { newRoot: '$company' } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    const data = result[0]?.data ?? [];
    const total = result[0]?.total[0]?.count ?? 0;

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  hasActiveMembership(
    userId: string,
    companyId: string,
    employeeRole?: EmployeeRole,
  ) {
    return this.companyMembershipModel.exists({
      userId: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      isActive: true,
      ...(employeeRole ? { employeeRole } : {}),
    });
  }

  findUniqueCompaniesByUserAndRoles(
    userId: string,
    employeeRoles: EmployeeRole[],
  ) {
    return this.companyMembershipModel
      .aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            employeeRole: { $in: employeeRoles },
            isActive: true,
          },
        },
        { $group: { _id: '$companyId' } },
        {
          $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        { $match: { 'company.isActive': true } },
        { $replaceRoot: { newRoot: '$company' } },
        { $sort: { companyName: 1 } },
      ])
      .exec();
  }

  async deleteByUserAndRoles(userId: string, employeeRoles: EmployeeRole[]) {
    const result = await this.companyMembershipModel.deleteMany({
      userId: new Types.ObjectId(userId),
      employeeRole: { $in: employeeRoles },
    });

    return result.deletedCount;
  }

  async addMissingRoles(
    userId: string,
    companyId: string,
    employeeRoles: EmployeeRole[],
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const companyObjectId = new Types.ObjectId(companyId);

    const existing = await this.companyMembershipModel.find({
      userId: userObjectId,
      companyId: companyObjectId,
      employeeRole: { $in: employeeRoles },
    });
    const existingRoles = new Set(existing.map((membership) => membership.employeeRole));

    const rolesToAdd = employeeRoles.filter((role) => !existingRoles.has(role));

    if (!rolesToAdd.length) {
      return [];
    }

    return this.companyMembershipModel.insertMany(
      rolesToAdd.map((employeeRole) => ({
        userId: userObjectId,
        companyId: companyObjectId,
        employeeRole,
        isActive: true,
      })),
    );
  }

  async findUsersForCompany(companyId: string, isActive: boolean) {
    return this.companyMembershipModel
      .aggregate([
        {
          $match: {
            companyId: new Types.ObjectId(companyId),
            isActive,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.isActive': isActive } },
        {
          $group: {
            _id: '$userId',
            hasEmployeeRole: {
              $max: {
                $cond: [
                  { $and: [{ $ne: ['$employeeRole', null] }, { $ne: ['$employeeRole', ''] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            category: { $cond: ['$hasEmployeeRole', 'employee', 'admin'] },
            user: {
              _id: '$user._id',
              username: '$user.username',
              email: '$user.email',
              userCompanyType: '$user.userCompanyType',
              userRole: '$user.userRole',
              employeeRoles: '$user.employeeRoles',
              isActive: '$user.isActive',
            },
          },
        },
        { $sort: { 'user.username': 1 } },
      ])
      .exec();
  }

  findProviderEmployees() {
    return this.companyMembershipModel
      .aggregate([
        {
          $match: {
            isActive: true,
            isClient: false,
            employeeRole: { $in: Object.values(EmployeeRole) },
          },
        },
        {
          $group: {
            _id: { employeeRole: '$employeeRole', userId: '$userId' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id.userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.isActive': true } },
        {
          $project: {
            _id: 0,
            employeeRole: '$_id.employeeRole',
            user: {
              _id: '$user._id',
              username: '$user.username',
              email: '$user.email',
              userCompanyType: '$user.userCompanyType',
              userRole: '$user.userRole',
              isActive: '$user.isActive',
            },
          },
        },
        { $sort: { 'user.username': 1 } },
      ])
      .exec();
  }

  findAssignedUsersByCompanyId(companyId: string) {
    return this.companyMembershipModel
      .aggregate([
        {
          $match: {
            companyId: new Types.ObjectId(companyId),
            isActive: true,
            employeeRole: { $in: Object.values(EmployeeRole) },
          },
        },
        {
          $group: {
            _id: { employeeRole: '$employeeRole', userId: '$userId' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id.userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $match: { 'user.isActive': true } },
        {
          $project: {
            _id: 0,
            employeeRole: '$_id.employeeRole',
            userId: '$_id.userId',
            user: {
              _id: '$user._id',
              username: '$user.username',
              email: '$user.email',
              userCompanyType: '$user.userCompanyType',
              userRole: '$user.userRole',
              isActive: '$user.isActive',
            },
          },
        },
        { $sort: { 'user.username': 1 } },
      ])
      .exec();
  }

  async syncUsersToCompany(
    companyId: string,
    assignments: Array<{ userId: string; employeeRole: EmployeeRole }>,
  ) {
    const companyObjectId = new Types.ObjectId(companyId);
    const deleteResult = await this.companyMembershipModel.deleteMany({
      companyId: companyObjectId,
    });

    const inserted = await this.companyMembershipModel.insertMany(
      assignments.map(({ userId, employeeRole }) => ({
        companyId: companyObjectId,
        userId: new Types.ObjectId(userId),
        employeeRole,
        isActive: true,
        isClient: false,
      })),
    );

    return {
      deleted: deleteResult.deletedCount,
      created: inserted.length,
    };
  }

  createMany(memberships: Partial<CompanyMembership>[]) {
    return this.companyMembershipModel.insertMany(memberships);
  }
}