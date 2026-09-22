import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bunk, BunkDocument } from '../schemas/master/company-specific/bunk.schema';

@Injectable()
export class BunkRepository {
  constructor(
    @InjectModel(Bunk.name)
    private readonly bunkModel: Model<BunkDocument>,
  ) {}

  findAll(companyId?: string) {
    const filter = companyId
      ? { companyId: new Types.ObjectId(companyId) }
      : {};

    return this.bunkModel.find(filter).sort({ name: 1 }).exec();
  }

  findByCompanyAndName(companyId: string, name: string) {
    return this.bunkModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        name: name.trim(),
      })
      .exec();
  }

  findById(id: string) {
    return this.bunkModel.findById(id).exec();
  }

  create(data: Partial<Bunk>) {
    return this.bunkModel.create(data);
  }
}
