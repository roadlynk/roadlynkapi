import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from '../schemas/master/company-specific/material.schema';

@Injectable()
export class MaterialRepository {
  constructor(
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  create(material: Partial<Material>) {
    return this.materialModel.create(material);
  }

  findById(id: string) {
    return this.materialModel.findById(id).exec();
  }

  findAll(companyId: string, isActive: boolean) {
    return this.materialModel
      .find({ companyId: new Types.ObjectId(companyId), isActive })
      .sort({ material: 1 })
      .exec();
  }

  updateById(id: string, update: Partial<Material>) {
    return this.materialModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  updateActiveStatus(id: string, isActive: boolean) {
    return this.materialModel
      .findByIdAndUpdate(id, { $set: { isActive } }, { returnDocument: 'after' })
      .exec();
  }
}
