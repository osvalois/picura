import { EnergyMode, OptimizationSuggestion, SustainabilityMetrics } from "./SustainabilityMetrics";
import { UserPreferences, UserProfileType } from "./User";

// IPC Configuration
export interface ElectronAPI {
  // Battery and system monitoring
  updateBatteryStatus: (status: { level: number; isCharging: boolean }) => Promise<void>;
  logError: (error: { message?: string; stack?: string; context?: any,  timestamp?: any }) => Promise<void>;
  
  // User profile and preferences methods
  getUserPreferences: () => Promise<UserPreferences>;
  getUserProfile: () => Promise<{ profileType: UserProfileType }>;
  updateUserProfile: (profile: { profileType: UserProfileType }) => Promise<unknown>;
  updateUserPreferences: (updatedPrefs: UserPreferences) => Promise<unknown>;
  
  // Sustainability-related methods
  getSustainabilityMetrics: () => Promise<SustainabilityMetrics>;
  getEnergyMode: () => Promise<EnergyMode>;
  setEnergyMode: (mode: EnergyMode) => Promise<void>;
  getSustainabilityReport: () => Promise<any>;
  applyOptimizationSuggestion: (id: string) => Promise<boolean>;
  
  // System-related methods
  getSystemInfo: () => Promise<{
    platform: string;
    cpuInfo: { model: string; cores: number; usage: number };
    memoryInfo: { total: number; free: number; usage: number };
    diskInfo: { total: number; free: number; usage: number };
  }>;
  
  // Application-related methods
  checkForUpdates: () => Promise<{ available: boolean; version?: string }>;
  installUpdate: () => Promise<{ success: boolean; message?: string }>;
  restartApplication: () => Promise<void>;
  quitApplication: () => Promise<void>;
  
  // Event listeners
  on: (channel: string, listener: (...args: any[]) => void) => (() => void);
  off: (channel: string, listener: (...args: any[]) => void) => void;
  once: (channel: string, listener: (...args: any[]) => void) => void;
  
  // Optional methods
  getOptimizationSuggestions?: () => Promise<OptimizationSuggestion[]>;
  onEnergyModeChanged?: (callback: (data: { mode: EnergyMode }) => void) => (() => void);
  onBatteryStatusChanged?: (callback: (data: { level: number; isCharging: boolean }) => void) => (() => void);
  onNetworkStatusChanged?: (callback: (data: { online: boolean; connectionType?: string }) => void) => (() => void);
  onIdleStateChanged?: (callback: (data: { idle: boolean; idleTime: number }) => void) => (() => void);
  
  // File-system related methods
  readFileContent: (path: string) => Promise<string>;
  writeFileContent: (path: string, content: string) => Promise<boolean>;
  showOpenDialog: (options: { 
    title?: string; 
    defaultPath?: string; 
    filters?: { name: string; extensions: string[] }[]; 
    properties?: string[] 
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (options: { 
    title?: string; 
    defaultPath?: string; 
    filters?: { name: string; extensions: string[] }[]; 
  }) => Promise<{ canceled: boolean; filePath?: string }>;
}