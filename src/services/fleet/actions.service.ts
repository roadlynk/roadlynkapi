import { Injectable, NotFoundException } from '@nestjs/common';
import { errorCode } from '../../common/error.index';
import { ChangeActionDoneStatusDto } from '../../dto/fleet/change-action-done-status.dto';
import { GetActionsQueryDto } from '../../dto/fleet/get-actions-query.dto';
import { GetAllActionsQueryDto } from '../../dto/fleet/get-all-actions-query.dto';
import { ActionRepository } from '../../repositories/action.repository';
import { Actor, RegistrationAuthorizationService } from '../auth/authorization.service';

@Injectable()
export class ActionsService {
  constructor(
    private readonly actionRepository: ActionRepository,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async getByCompany(actor: Actor, query: GetActionsQueryDto) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      query.companyId,
    );

    return this.actionRepository.findByCompanyAndDoneStatus(
      query.companyId,
      query.isDone,
    );
  }

  async getAll(actor: Actor, companyId: string) {
    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      companyId,
    );

    return this.actionRepository.findActiveByCompany(companyId);
  }

  getAllByDoneStatus(query: GetAllActionsQueryDto) {
    return this.actionRepository.findAllByDoneStatus(query.isDone);
  }

  async changeDoneStatus(
    actor: Actor,
    actionId: string,
    dto: ChangeActionDoneStatusDto,
  ) {
    const action = await this.actionRepository.findById(actionId);

    if (!action) {
      throw new NotFoundException({
        message: 'Action not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorisedtoAccessCompany(
      actor,
      action.companyId.toString(),
    );

    const updated = await this.actionRepository.updateById(actionId, {
      isDone: dto.isDone,
    });

    if (!updated) {
      throw new NotFoundException({
        message: 'Action not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return updated;
  }
}