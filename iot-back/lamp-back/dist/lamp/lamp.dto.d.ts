export declare class UpdatePowerDto {
    power: boolean;
}
export declare class UpdateBrightnessDto {
    brightness: number;
}
export declare class UpdateModeDto {
    mode: 'normal' | 'eco' | 'comfort';
}
export declare class LampState {
    power: boolean;
    brightness: number;
    mode: 'normal' | 'eco' | 'comfort';
    updatedAt: string;
}
