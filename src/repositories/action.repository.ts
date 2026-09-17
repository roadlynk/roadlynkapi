import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Action, ActionDocument } from '../schemas/fleet/action.schema';

@Injectable()
export class ActionRepository {
  constructor(
    @InjectModel(Action.name)
    private readonly actionModel: Model<ActionDocument>,
  ) {}

  create(action: Partial<Action>) {
    return this.actionModel.create(action);
  }

  findById(id: string) {
    return this.actionModel.findById(id).exec();
  }

  updateById(id: string, update: Partial<Action>) {
    return this.actionModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }

  findByCompanyAndDoneStatus(companyId: string, isDone?: boolean) {
    const filter: { companyId: Types.ObjectId; isDone?: boolean } = {
      companyId: new Types.ObjectId(companyId),
    };

    if (isDone !== undefined) {
      filter.isDone = isDone;
    }

    return this.actionModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  findActiveByCompany(companyId: string) {
    return this.actionModel
      .find({ companyId: new Types.ObjectId(companyId), isDone: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  findAllByDoneStatus(isDone: boolean) {
    return this.actionModel.find({ isDone }).sort({ createdAt: -1 }).exec();
  }
}
