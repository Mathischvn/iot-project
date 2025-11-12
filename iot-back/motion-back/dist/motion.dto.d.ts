export declare class UpdateArmedDto {
    armed: boolean;
}
export declare class UpdateSensitivityDto {
    sensitivity: number;
}
export declare class TriggerDto {
    detected: boolean;
}
export interface MotionState {
    detected: boolean;
    armed: boolean;
    sensitivity: number;
    updatedAt?: string;
}
