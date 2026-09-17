import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from '../schemas/master/company-specific/client.schema';

@Injectable()
export class ClientRepository {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  create(client: Partial<Client>) {
    return this.clientModel.create(client);
  }

  findById(id: string) {
    return this.clientModel.findById(id).exec();
  }

  findAllByCompanyAndActiveStatus(companyId: string, isActive: boolean) {
    return this.clientModel
      .find({ companyId: new Types.ObjectId(companyId), isActive })
      .sort({ name: 1 })
      .exec();
  }              

  findByUniqueIdentifier(companyId: string, clientCode: string) {
    return this.clientModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        clientCode,
      })
      .exec();
  }

  findByUniqueIdentifierExcludingId(
    id: string,
    companyId: string,
    clientCode: string,
  ) {
    return this.clientModel
      .findOne({
        _id: { $ne: id },
        companyId: new Types.ObjectId(companyId),
        clientCode,
      })
      .exec();
  }

  updateById(id: string, update: Partial<Client>) {
    return this.clientModel
      .findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' })
      .exec();
  }
}
