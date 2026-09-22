import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateClientDto } from '../../dto/master/create-client.dto';
import { GetClientsQueryDto } from '../../dto/master/get-clients-query.dto';
import { ChangeClientActiveStatusDto } from '../../dto/master/change-client-active-status.dto';
import { UpdateClientDto } from '../../dto/master/update-client.dto';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly clientBranchRepository: ClientBranchRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAll(actor: Actor, query: GetClientsQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    const clients = await this.clientRepository.findAllByCompanyAndActiveStatus(
      query.companyId,
      query.active,
    );

    return Promise.all(
      clients.map(async (client) => ({
        ...client.toObject(),
        branches: await this.clientBranchRepository.findByClientAndActiveStatus(
          client._id.toString(),
          query.active,
        ),
      })),
    );
  }

  async create(actor: Actor, dto: CreateClientDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.clientRepository.findByUniqueIdentifier(
      dto.companyId,
      dto.clientCode,
    );

    if (existing) {
      throw new ConflictException({
        message: 'Client code already exists for this company',
        error_code: errorCode.client.duplicateClientIdentifier,
      });
    }

    try {
      return await this.clientRepository.create({
        ...dto,
        companyId: new Types.ObjectId(dto.companyId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'Client code already exists for this company',
          error_code: errorCode.client.duplicateClientIdentifier,
        });
      }

      throw error;
    }
  }

  async update(actor: Actor, clientId: string, dto: UpdateClientDto) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException({
        message: 'Client not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    const companyId = client.companyId.toString();

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    if (dto.clientCode) {
      const existing = await this.clientRepository.findByUniqueIdentifierExcludingId(
        clientId,
        companyId,
        dto.clientCode,
      );

      if (existing) {
        throw new ConflictException({
          message: 'Client code already exists for this company',
          error_code: errorCode.client.duplicateClientIdentifier,
        });
      }
    }

    try {
      const updated = await this.clientRepository.updateById(clientId, dto);

      if (!updated) {
        throw new NotFoundException({
          message: 'Client not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'Client code already exists for this company',
          error_code: errorCode.client.duplicateClientIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    clientId: string,
    dto: ChangeClientActiveStatusDto,
  ) {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new NotFoundException({
        message: 'Client not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      client.companyId.toString(),
    );

    const updated = await this.clientRepository.updateById(clientId, {
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'Client not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}
