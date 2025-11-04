export class ThermostatState {
  temperature: number;
  targetTemperature: number;
  mode: 'off' | 'heating' | 'eco';
  isHeating: boolean;
}

export class UpdateTargetDto {
  targetTemperature: number;
}

export class UpdateModeDto {
  mode: 'off' | 'heating' | 'eco';
}
