export declare class ThermostatState {
    temperature: number;
    targetTemperature: number;
    mode: 'off' | 'heating' | 'eco';
    isHeating: boolean;
}
export declare class UpdateTargetDto {
    targetTemperature: number;
}
export declare class UpdateModeDto {
    mode: 'off' | 'heating' | 'eco';
}
