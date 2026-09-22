import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateBunkDto } from '../../dto/master/create-bunk.dto';
import { GetBunksQueryDto } from '../../dto/master/get-bunks-query.dto';
import { BunkRepository } from '../../repositories/bunk.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class BunkService {
  constructor(
    private readonly bunkRepository: BunkRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAll(actor: Actor, query: GetBunksQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.bunkRepository.findAll(query.companyId);
  }

  async create(actor: Actor, dto: CreateBunkDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const name = dto.name.trim();
    const existing = await this.bunkRepository.findByName(name);

    if (existing) {
      return existing;
    }

    return this.bunkRepository.create({
      companyId: new Types.ObjectId(dto.companyId),
      name,
    });
  }
}
