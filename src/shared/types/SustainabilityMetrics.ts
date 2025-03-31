export interface ResourceMetric {
  current: number;
  average: number;
  peak: number;
}

export interface IOMetric {
  reads: number;
  writes: number;
}

export interface NetworkMetric {
  sent: number;
  received: number;
}

export interface BatteryMetric {
  isCharging: boolean;
  level: number;
}

export interface EnergyMetric {
  current: number; // Current power consumption in mW
  total: number;   // Total energy consumed in session in mWh
}

export interface SustainabilityMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: IOMetric;
  network: NetworkMetric;
  battery: BatteryMetric;
  estimatedEnergy: EnergyMetric;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'memory' | 'cpu' | 'disk' | 'network' | 'general';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  autoApplicable: boolean;
}

export type EnergyMode = 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance';

// Estructura para métricas de uso de recursos
export interface ResourceUsageMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk?: {
    reads: number;
    writes: number;
  };
  network?: {
    sent: number;
    received: number;
  };
  timestamp: number;
}

// Estructura para métricas de consumo energético
export interface PowerConsumptionMetrics {
  totalPower: number;
  components: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    display: number;
  };
  co2Equivalent: number;
  energyEfficiencyRatio: number;
  batteryImpact?: string;
}

// Estado energético del sistema
export interface SystemEnergyState {
  currentMode: EnergyMode;
  batteryStatus: {
    level: number;
    charging: boolean;
    lowPowerMode: boolean;
  };
  recommendedMode: EnergyMode;
  availableModes: EnergyMode[];
  autoModeEnabled: boolean;
}