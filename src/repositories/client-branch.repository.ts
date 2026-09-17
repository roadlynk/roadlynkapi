import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClientBranch,
  ClientBranchDocument,
} from '../schemas/master/company-specific/client-branch.schema';

@Injectable()
export class ClientBranchRepository {
  constructor(
    @InjectModel(ClientBranch.name)
    private readonly clientBranchModel: Model<ClientBranchDocument>,
  ) {}

  create(branch: Partial<ClientBranch>) {
    return this.clientBranchModel.create(branch);
  }

  findById(id: string) {
    return this.clientBranchModel.findById(id).exec();
  }

  findByIds(ids: string[]) {
    return this.clientBranchModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .exec();
  }

  findByClientAndActiveStatus(clientId: string, isActive: boolean) {
    return this.clientBranchModel
      .find({ clientId: new Types.ObjectId(clientId), isActive })
      .sort({ branchName: 1 })
      .exec();
  }

  findByUniqueIdentifier(clientId: string, branchName: string) {
    return this.clientBranchModel
      .findOne({ clientId: new Types.ObjectId(clientId), branchName })
      .exec();
  }

  findByUniqueIdentifierExcludingId(
    id: string,
    clientId: string,
    branchName: string,
  ) {
    return this.clientBranchModel
      .findOne({
        _id: { $ne: id },
        clientId: new Types.ObjectId(clientId),
        branchName,
      })
      .exec();
  }

  updateById(id: string, update: Partial<ClientBranch>) {
    return this.clientBranchModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }
}
