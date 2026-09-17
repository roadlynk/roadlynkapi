import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { ChangeClientBranchActiveStatusDto } from '../../dto/master/change-client-branch-active-status.dto';
import { CreateClientBranchDto } from '../../dto/master/create-client-branch.dto';
import { UpdateClientBranchDto } from '../../dto/master/update-client-branch.dto';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class ClientBranchService {
  constructor(
    private readonly clientBranchRepository: ClientBranchRepository,
    private readonly clientRepository: ClientRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  private async getAuthorizedClient(actor: Actor, clientId: string) {
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

    return client;
  }

  async create(actor: Actor, dto: CreateClientBranchDto) {
    await this.getAuthorizedClient(actor, dto.clientId);

    const existing = await this.clientBranchRepository.findByUniqueIdentifier(
      dto.clientId,
      dto.branchName,
    );

    if (existing) {
      throw new ConflictException({
        message: 'Branch name already exists for this client',
        error_code: errorCode.clientBranch.duplicateBranchIdentifier,
      });
    }

    try {
      return await this.clientBranchRepository.create({
        ...dto,
        clientId: new Types.ObjectId(dto.clientId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'Branch name already exists for this client',
          error_code: errorCode.clientBranch.duplicateBranchIdentifier,
        });
      }

      throw error;
    }
  }

  async update(actor: Actor, branchId: string, dto: UpdateClientBranchDto) {
    const branch = await this.clientBranchRepository.findById(branchId);

    if (!branch) {
      throw new NotFoundException({
        message: 'Client branch not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.getAuthorizedClient(actor, branch.clientId.toString());

    if (dto.branchName) {
      const existing =
        await this.clientBranchRepository.findByUniqueIdentifierExcludingId(
          branchId,
          branch.clientId.toString(),
          dto.branchName,
        );

      if (existing) {
        throw new ConflictException({
          message: 'Branch name already exists for this client',
          error_code: errorCode.clientBranch.duplicateBranchIdentifier,
        });
      }
    }

    try {
      const updated = await this.clientBranchRepository.updateById(
        branchId,
        dto,
      );

      if (!updated) {
        throw new NotFoundException({
          message: 'Client branch not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'Branch name already exists for this client',
          error_code: errorCode.clientBranch.duplicateBranchIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    branchId: string,
    dto: ChangeClientBranchActiveStatusDto,
  ) {
    const branch = await this.clientBranchRepository.findById(branchId);

    if (!branch) {
      throw new NotFoundException({
        message: 'Client branch not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.getAuthorizedClient(actor, branch.clientId.toString());

    const updated = await this.clientBranchRepository.updateById(branchId, {
      isActive: dto.isActive,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'Client branch not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}
