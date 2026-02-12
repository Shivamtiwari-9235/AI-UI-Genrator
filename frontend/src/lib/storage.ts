export interface GenerationState {
  message: string;
  code?: string;
  explanation?: any;
  diff?: any;
  error?: string;
  isLoading: boolean;
}

export function saveGenerationHistory(generation: any): void {
  try {
    const history = JSON.parse(localStorage.getItem('generation_history') || '[]');
    history.unshift({
      ...generation,
      savedAt: new Date().toISOString()
    });
    // Keep last 20
    localStorage.setItem('generation_history', JSON.stringify(history.slice(0, 20)));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function getGenerationHistory(): any[] {
  try {
    return JSON.parse(localStorage.getItem('generation_history') || '[]');
  } catch {
    return [];
  }
}

export function clearGenerationHistory(): void {
  localStorage.removeItem('generation_history');
}
