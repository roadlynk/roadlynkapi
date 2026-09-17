import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GstConfigurer,
  GstConfigurerDocument,
} from '../schemas/master/general/gst-configurer.schema';

@Injectable()
export class GstConfigurerRepository {
  constructor(
    @InjectModel(GstConfigurer.name)
    private readonly gstConfigurerModel: Model<GstConfigurerDocument>,
  ) {}

  count() {
    return this.gstConfigurerModel.countDocuments().exec();
  }

  create(gstConfigurer: Partial<GstConfigurer>) {
    return this.gstConfigurerModel.create(gstConfigurer);
  }

  findAll() {
    return this.gstConfigurerModel.find().sort({ createdAt: -1 }).exec();
  }

  findActive() {
    return this.gstConfigurerModel.findOne({ isActive: true }).exec();
  }

  updateById(id: string, update: Partial<GstConfigurer>) {
    return this.gstConfigurerModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  deactivateAll() {
    return this.gstConfigurerModel
      .updateMany({ isActive: true }, { $set: { isActive: false } })
      .exec();
  }

  activateById(id: string) {
    return this.gstConfigurerModel
      .findByIdAndUpdate(id, { $set: { isActive: true } }, { returnDocument: 'after' })
      .exec();
  }
}
