export type UserProfileType = 'technical' | 'writer' | 'manager' | 'custom';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  editorMode: 'basic' | 'standard' | 'advanced';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  spellcheck: boolean;
  autosave: boolean;
  autosaveInterval: number;
  lineNumbers: boolean;
  enableAI: boolean;
  energyMode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance';
  sustainabilityMetricsVisible: boolean;
  customUIConfig?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  profileType: UserProfileType;
  preferences: UserPreferences;
  recentDocuments: string[];
  favoriteDocuments: string[];
  customTags: string[];
  usageStatistics?: {
    documentsCreated: number;
    totalEditTime: number;
    lastActive: Date;
    commonWorkflows: string[];
  };
}