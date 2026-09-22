import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { DealerType } from '../../common/enums/dealer-type.enum';
import { ChangeClientBranchActiveStatusDto } from '../../dto/master/change-client-branch-active-status.dto';
import { CreateClientBranchDto } from '../../dto/master/create-client-branch.dto';
import { UpdateClientBranchDto } from '../../dto/master/update-client-branch.dto';
import { ClientRepository } from '../../repositories/client.repository';
import { ClientBranchRepository } from '../../repositories/client-branch.repository';
import { DealerRepository } from '../../repositories/dealer.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class ClientBranchService {
  constructor(
    private readonly clientBranchRepository: ClientBranchRepository,
    private readonly clientRepository: ClientRepository,
    private readonly dealerRepository: DealerRepository,
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
      const branch = await this.clientBranchRepository.create({
        ...dto,
        clientId: new Types.ObjectId(dto.clientId),
      });

      await this.dealerRepository.create({
        clientId: new Types.ObjectId(dto.clientId),
        dealerName: dto.branchName,
        code: branch._id.toString(),
        address: dto.address,
        dealerType: DealerType.COMPANY,
      });

      return branch;
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

      if (dto.branchName || dto.address) {
        const dealer = await this.dealerRepository.findByUniqueIdentifier(
          branch.clientId.toString(),
          branchId,
        );

        if (dealer) {
          await this.dealerRepository.updateById(dealer._id.toString(), {
            ...(dto.branchName ? { dealerName: dto.branchName } : {}),
            ...(dto.address ? { address: dto.address } : {}),
          });
        }
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
