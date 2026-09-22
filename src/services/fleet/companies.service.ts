import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import { CreateCompanyDto } from '../../dto/fleet/create-company.dto';
import { CompanyRepository } from '../../repositories/company.repository';
import { UserCompanyType, UserRole } from '../../common/enums/user-role.enum';
import { CompanyMembershipsService } from '../auth/company-memberships.service';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';
import { GetCompaniesQueryDto } from '../../dto/fleet/get-companies-query.dto';
import { ChangeCompanyActiveStatusDto } from '../../dto/fleet/change-company-active-status.dto';
import { UpdateCompanyDto } from '../../dto/fleet/update-company.dto';
import { OwnerRepository } from '../../repositories/owner.repository';
import {
  AccountGroup,
  OpeningBalanceType,
} from '../../schemas/fleet/owner.schema';

interface CompanyListActor {
  sub?: string;
  userCompanyType?: UserCompanyType;
  userRole?: UserRole;
}

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly ownerRepository: OwnerRepository,
    private readonly companyMembershipsService: CompanyMembershipsService,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getCompanies(actor: CompanyListActor, query: GetCompaniesQueryDto) {
    const canViewAllCompanies =
      actor.userCompanyType === UserCompanyType.PROVIDER &&
      [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(actor.userRole!);
    const active = query.active ?? true;
    const { page, limit } = query;

    if (canViewAllCompanies) {
      return this.companyRepository.findAllPaginatedByActiveStatus(
        active,
        page,
        limit,
      );
    }

    if (!active) {
      throw new ForbiddenException({
        message: 'Only provider admins can view inactive companies',
        error_code: errorCode.apiCommon.forbidden,
      });
    }

    if (!actor.sub) {
      return { data: [], total: 0, currentPage: page, totalPages: 0 };
    }

    return this.companyMembershipsService.getUserCompaniesPaginated(
      actor.sub,
      page,
      limit,
    );
  }

  getActiveSaasClients() {
    return this.companyRepository.findActiveSaasClients();
  }

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepository.findByUniqueIdentifier(
      dto.companyCode,
      dto.contactEmail,
      dto.contactNumber,
    );

    if (existing) {
      throw new ConflictException({
        message: 'Company code, contact email, or contact number already exists',
        error_code: errorCode.company.duplicateCompanyIdentifier,
      });
    }

    try {
      const company = await this.companyRepository.create(dto);

      await this.ownerRepository.create({
        name: dto.companyName,
        phoneNumber: dto.contactNumber,
        email: dto.contactEmail,
        aadharNumber: dto.companyCode,
        address: dto.address,
        companyId: new Types.ObjectId(company._id),
        panNumber: dto.pan,
        gstin: dto.gstin,
        isRental: false,
        accountGroup: AccountGroup.ASSET,
        openingBalance: 0,
        openingBalanceType: OpeningBalanceType.DEBIT,
        isActive: company.isActive ?? true,
      });

      return company;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Company code, contact email, or contact number already exists',
          error_code: errorCode.company.duplicateCompanyIdentifier,
        });
      }

      throw error;
    }
  }

  async changeActiveStatus(
    companyId: string,
    dto: ChangeCompanyActiveStatusDto,
  ) {
    const company = await this.companyRepository.updateActiveStatus(
      companyId,
      dto.isActive,
    );

    if (!company) {
      throw new NotFoundException({
        message: 'Company not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return {
      id: company._id.toString(),
      isActive: company.isActive,
    };
  }

  async update(actor: Actor, companyId: string, dto: UpdateCompanyDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
      undefined,
      true,
    );

    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException({
        message: 'Company not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    try {
      const updated = await this.companyRepository.updateById(
        companyId,
        dto as unknown as Partial<import('../../schemas/fleet/company.schema').Company>,
      );

      if (!updated) {
        throw new NotFoundException({
          message: 'Company not found',
          error_code: errorCode.apiCommon.notFound,
        });
      }

      return updated;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message:
            'Company code, contact email, contact number, GSTIN, or PAN already exists',
          error_code: errorCode.company.duplicateCompanyIdentifier,
        });
      }

      throw error;
    }
  }
}