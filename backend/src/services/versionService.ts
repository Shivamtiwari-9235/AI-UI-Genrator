import { Version, GenerationResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

/* ============================================
   VERSION SERVICE
   ============================================ */

class VersionService {
  private versions: Map<string, Version> = new Map();
  private versionOrder: string[] = [];

  /**
   * Store a new version
   */
  saveVersion(version: Omit<Version, 'id'>): Version {
    const id = uuidv4();
    const fullVersion: Version = {
      ...version,
      id
    };

    this.versions.set(id, fullVersion);
    this.versionOrder.push(id);

    // Limit to 50 versions
    if (this.versionOrder.length > 50) {
      const oldestId = this.versionOrder.shift();
      if (oldestId) {
        this.versions.delete(oldestId);
      }
    }

    return fullVersion;
  }

  /**
   * Get version by id
   */
  getVersion(id: string): Version | null {
    return this.versions.get(id) || null;
  }

  /**
   * Get all versions in order
   */
  getAllVersions(): Version[] {
    return this.versionOrder
      .map(id => this.versions.get(id))
      .filter((v): v is Version => v !== undefined);
  }

  /**
   * Get version history (latest N versions)
   */
  getVersionHistory(limit: number = 10): Version[] {
    return this.getAllVersions()
      .reverse()
      .slice(0, limit)
      .reverse();
  }

  /**
   * Delete a version
   */
  deleteVersion(id: string): boolean {
    if (this.versions.has(id)) {
      this.versions.delete(id);
      this.versionOrder = this.versionOrder.filter(vid => vid !== id);
      return true;
    }
    return false;
  }

  /**
   * Get version count
   */
  getVersionCount(): number {
    return this.versions.size;
  }

  /**
   * Check if version exists
   */
  versionExists(id: string): boolean {
    return this.versions.has(id);
  }

  /**
   * Get next/previous version
   */
  getAdjacentVersion(
    currentId: string,
    direction: 'next' | 'previous'
  ): Version | null {
    const index = this.versionOrder.indexOf(currentId);
    if (index === -1) return null;

    const nextIndex = direction === 'next' ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= this.versionOrder.length) return null;

    return this.versions.get(this.versionOrder[nextIndex]) || null;
  }

  /**
   * Clear all versions
   */
  clear(): void {
    this.versions.clear();
    this.versionOrder = [];
  }
}

// Singleton instance
export const versionService = new VersionService();

/**
 * Convert version to response format
 */
export function versionToResponse(version: Version): GenerationResponse {
  return {
    id: version.id,
    plan: version.plan,
    generatedCode: version.generatedCode,
    explanation: version.explanation,
    diff: version.diffFromPrevious
  };
}
