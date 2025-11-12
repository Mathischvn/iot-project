export class UpdateArmedDto {
  armed!: boolean;
}

export class UpdateSensitivityDto {
  sensitivity!: number;
}

export class TriggerDto {
  detected!: boolean;
}

export interface MotionState {
  detected: boolean;
  armed: boolean;
  sensitivity: number;
  updatedAt?: string;
}
