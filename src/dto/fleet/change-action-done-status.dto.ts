import { IsBoolean } from 'class-validator';

export class ChangeActionDoneStatusDto {
  @IsBoolean()
  isDone!: boolean;
}
