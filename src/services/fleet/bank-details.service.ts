import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateBankDetailsDto } from '../../dto/fleet/create-bank-details.dto';
import { GetBankDetailsByHolderDto } from '../../dto/fleet/get-bank-details-by-holder.dto';
import { SetActiveBankDetailsDto } from '../../dto/fleet/set-active-bank-details.dto';
import { BankDetailsRepository } from '../../repositories/bank-details.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class BankDetailsService {
  constructor(
    private readonly bankDetailsRepository: BankDetailsRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async create(actor: Actor, dto: CreateBankDetailsDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const existing = await this.bankDetailsRepository.findByHolderAndAccount(
      dto.holderId,
      dto.holderType,
      dto.bankName,
      dto.accountNumber,
    );

    if (existing) {
      throw new ConflictException({
        message:
          'Bank account with the same bank name and account number already exists for this holder',
        error_code: errorCode.bankDetails.duplicateBankAccount,
      });
    }

    const allAcounts = await this.bankDetailsRepository.findByHolder(
      dto.holderId,
      dto.holderType,
    );

    try {
      return await this.bankDetailsRepository.create({
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        ifscCode: dto.ifscCode,
        branchName: dto.branchName,
        accountType: dto.accountType,
        holderType: dto.holderType,
        holderId: new Types.ObjectId(dto.holderId),
        isActive: allAcounts.length === 0,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Bank account with the same bank name and account number already exists for this holder',
          error_code: errorCode.bankDetails.duplicateBankAccount,
        });
      }

      throw error;
    }
  }

  async getByHolder(actor: Actor, dto: GetBankDetailsByHolderDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    return this.bankDetailsRepository.findByHolder(
      dto.holderId,
      dto.holderType,
    );
  }

  async setActiveBankDetails(actor: Actor, dto: SetActiveBankDetailsDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      dto.companyId,
    );

    const entries = await this.bankDetailsRepository.findByHolder(
      dto.holderId,
      dto.holderType,
    );

    const target = entries.find(
      (entry) => entry._id.toString() === dto.bankDetailsId,
    );

    if (!target) {
      throw new NotFoundException({
        message: 'Bank details not found for the given holder',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.bankDetailsRepository.deactivateByHolder(
      dto.holderId,
      dto.holderType,
    );

    return this.bankDetailsRepository.activateById(dto.bankDetailsId);
  }
}
