import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { ChangeDealerActiveStatusDto } from '../../dto/master/change-dealer-active-status.dto';
import { CreateDealerDto } from '../../dto/master/create-dealer.dto';
import { GetDealersByClientQueryDto } from '../../dto/master/get-dealers-by-client-query.dto';
import { UpdateDealerDto } from '../../dto/master/update-dealer.dto';
import { ClientRepository } from '../../repositories/client.repository';
import { DealerRepository } from '../../repositories/dealer.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class DealerService {
  constructor(
    private readonly dealerRepository: DealerRepository,
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

  async create(actor: Actor, dto: CreateDealerDto) {
    await this.getAuthorizedClient(actor, dto.clientId);

    const existing = await this.dealerRepository.findByUniqueIdentifier(
      dto.clientId,
      dto.code,
    );

    if (existing) {
      throw this.duplicateCodeException();
    }

    try {
      return await this.dealerRepository.create({
        ...dto,
        clientId: new Types.ObjectId(dto.clientId),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw this.duplicateCodeException();
      }

      throw error;
    }
  }

  async findAllByClientId(
    actor: Actor,
    clientId: string,
    query: GetDealersByClientQueryDto,
  ) {
    await this.getAuthorizedClient(actor, clientId);
    return this.dealerRepository.findByClientId(clientId, query.active);
  }

  async update(actor: Actor, dealerId: string, dto: UpdateDealerDto) {
    const dealer = await this.getDealerAndAuthorize(actor, dealerId);

    if (dto.code) {
      const existing =
        await this.dealerRepository.findByUniqueIdentifierExcludingId(
          dealerId,
          dealer.clientId.toString(),
          dto.code,
        );

      if (existing) {
        throw this.duplicateCodeException();
      }
    }

    try {
      const updated = await this.dealerRepository.updateById(dealerId, dto);

      if (!updated) {
        throw this.dealerNotFoundException();
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw this.duplicateCodeException();
      }

      throw error;
    }
  }

  async changeActiveStatus(
    actor: Actor,
    dealerId: string,
    dto: ChangeDealerActiveStatusDto,
  ) {
    await this.getDealerAndAuthorize(actor, dealerId);

    const updated = await this.dealerRepository.updateById(dealerId, {
      isActive: dto.isActive,
    });

    if (!updated) {
      throw this.dealerNotFoundException();
    }

    return updated;
  }

  private async getDealerAndAuthorize(actor: Actor, dealerId: string) {
    const dealer = await this.dealerRepository.findById(dealerId);

    if (!dealer) {
      throw this.dealerNotFoundException();
    }

    await this.getAuthorizedClient(actor, dealer.clientId.toString());
    return dealer;
  }

  private dealerNotFoundException() {
    return new NotFoundException({
      message: 'Dealer not found',
      error_code: errorCode.apiCommon.notFound,
    });
  }

  private duplicateCodeException() {
    return new ConflictException({
      message: 'Dealer code already exists for this client',
      error_code: errorCode.dealer.duplicateDealerCode,
    });
  }
}