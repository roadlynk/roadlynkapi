import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from '../schemas/fleet/company.schema';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  create(company: Partial<Company>) {
    return this.companyModel.create(company);
  }

  findById(id: string) {
    return this.companyModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<Company>) {
    return this.companyModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  async incrementDcSequence(id: string) {
    const company = await this.companyModel
      .findByIdAndUpdate(
        id,
        { $inc: { lastDcSequence: 1 } },
        { returnDocument: 'after' },
      )
      .exec();

    return company!.lastDcSequence;
  }

  async findAllPaginatedByActiveStatus(
    isActive: boolean,
    page: number,
    limit: number,
  ) {
    const filter = { isActive };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.companyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.companyModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findActiveSaasClients() {
    return this.companyModel
      .find({ isActive: true, isSaasClient: true })
      .sort({ companyName: 1 })
      .exec();
  }

  findByUniqueIdentifier(
    companyCode: string,
    contactEmail: string,
    contactNumber: string,
  ) {
    return this.companyModel
      .findOne({
        $or: [{ companyCode }, { contactEmail }, { contactNumber }],
      })
      .exec();
  }

  updateActiveStatus(id: string, isActive: boolean) {
    return this.companyModel
      .findByIdAndUpdate(
        id,
        { $set: { isActive } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}