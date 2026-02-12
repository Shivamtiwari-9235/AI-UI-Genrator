export type GenerationOutput = {
  plan: Record<string, any>;
  generatedCode: string;
  explanation: string;
};

export function validateGenerationOutput(obj: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    errors.push('Output must be an object');
    return { valid: false, errors };
  }
  if (!obj.plan) errors.push('Missing plan');
  if (!obj.generatedCode || typeof obj.generatedCode !== 'string') errors.push('Missing generatedCode string');
  if (!obj.explanation || typeof obj.explanation !== 'string') errors.push('Missing explanation string');

  return { valid: errors.length === 0, errors };
}

export default validateGenerationOutput;
