/**
 * Tipos relacionados con el control de versiones
 */

export type VersionDiffType = 'added' | 'deleted' | 'modified' | 'renamed' | 'unchanged';

export interface VersionChange {
  id: string;
  path: string;
  type: VersionDiffType;
  additions: number;
  deletions: number;
  content?: string;
  previousContent?: string;
  diffHtml?: string;
}

export interface VersionInfo {
  id: string;
  documentId: string;
  version: number;
  timestamp: string;
  message: string;
  author?: string | undefined;
  changes: VersionChange[];
  sustainabilityMetrics: {
    diffSize: number;
    compressionRatio: number;
    storageImpact: number;
  };
}


export interface VersionCommitOptions {
  message?: string;
  includeUnchanged?: boolean;
  createBackup?: boolean;
  skipHooks?: boolean;
  stageAll?: boolean;
}

export interface VersionHistoryOptions {
  limit?: number;
  offset?: number;
  includeContent?: boolean;
  includeChanges?: boolean;
}

export interface VersionRestoreOptions {
  createNewVersion?: boolean;
  message?: string;
}

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  description: string;
  documentIds: string[];
  tags: string[];
  author?: string;
}

export interface VersionDiff {
  documentId: string;
  fromVersion: number;
  toVersion: number;
  changes: VersionChange[];
  diffStats: {
    additions: number;
    deletions: number;
    changedFiles: number;
  };
}

export interface VersionBranch {
  name: string;
  description?: string;
  createdAt: string;
  lastCommitId?: string;
  isActive: boolean;
}

export interface GitSyncStatus {
  inSync: boolean;
  pendingChanges: number;
  lastSyncTime?: string;
  activeBranch?: string;
  availableBranches?: string[];
  remoteUrl?: string | undefined;
  remoteBranch?: string;
  errorMessage?: string;
}