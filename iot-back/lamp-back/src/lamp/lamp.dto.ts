// DTOs pour les entrées/sorties de la lampe

export class UpdatePowerDto {
  power: boolean;
}

export class UpdateBrightnessDto {
  brightness: number;
}

export class UpdateModeDto {
  mode: 'normal' | 'eco' | 'comfort';
}

export class LampState {
  power: boolean;
  brightness: number;
  mode: 'normal' | 'eco' | 'comfort';
  updatedAt: string;
}
