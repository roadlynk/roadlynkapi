import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { ChangeCashAccountActiveStatusDto } from '../../dto/payment/change-cash-account-active-status.dto';
import { CreateCashAccountDto } from '../../dto/payment/create-cash-account.dto';
import { GetCashAccountsQueryDto } from '../../dto/payment/get-cash-accounts-query.dto';
import { UpdateCashAccountDto } from '../../dto/payment/update-cash-account.dto';
import { CashAccountRepository } from '../../repositories/cash-account.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class CashAccountService {
  constructor(
    private readonly cashAccountRepository: CashAccountRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getAll(actor: Actor, query: GetCashAccountsQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.cashAccountRepository.findAllByCompany(
      query.companyId,
      query.active,
    );
  }

  async create(actor: Actor, dto: CreateCashAccountDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    return this.cashAccountRepository.create({
      ...dto,
      companyId: new Types.ObjectId(dto.companyId),
    });
  }

  async update(actor: Actor, id: string, dto: UpdateCashAccountDto) {
    const cashAccount = await this.cashAccountRepository.findById(id);

    if (!cashAccount) {
      throw new NotFoundException({
        message: 'Cash account not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      cashAccount.companyId.toString(),
    );

    const updated = await this.cashAccountRepository.updateById(id, dto);

    if (!updated) {
      throw new NotFoundException({
        message: 'Cash account not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }

  async changeActiveStatus(
    actor: Actor,
    id: string,
    dto: ChangeCashAccountActiveStatusDto,
  ) {
    const cashAccount = await this.cashAccountRepository.findById(id);

    if (!cashAccount) {
      throw new NotFoundException({
        message: 'Cash account not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      cashAccount.companyId.toString(),
    );

    const updated = await this.cashAccountRepository.updateActiveStatus(
      id,
      dto.isActive,
    );

    if (!updated) {
      throw new NotFoundException({
        message: 'Cash account not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}
