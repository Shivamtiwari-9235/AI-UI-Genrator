/* ============================================
   CORE TYPE DEFINITIONS
   ============================================ */

// Intent Types
export type IntentType = 'create' | 'modify' | 'remove' | 'regenerate' | 'rollback';

// Component Definition
export interface ComponentNode {
  id: string;
  type: string; // Must be in whitelist
  props: Record<string, any>;
  children?: (ComponentNode | string)[];
}

// Generation Plan
export interface GenerationPlan {
  intent: IntentType;
  components: ComponentNode[];
  layout?: {
    direction?: 'horizontal' | 'vertical';
    spacing?: 'sm' | 'md' | 'lg';
  };
  description?: string;
}

// Explanation Output
export interface Explanation {
  layoutReasoning: string;
  componentSelectionReasoning: Record<string, string>;
  modificationReasoning?: string;
  tradeoffs: string[];
  constraints: string[];
}

// Diff Result
export interface DiffResult {
  added: string[];
  removed: string[];
  modified: string[];
  summary: string;
}

// Full Version
export interface Version {
  id: string;
  userMessage: string;
  plan: GenerationPlan;
  generatedCode: string;
  explanation: Explanation;
  diffFromPrevious?: DiffResult;
  timestamp: number;
  metadata: {
    intent: IntentType;
    componentCount: number;
    linesOfCode: number;
  };
}

// Generation Request
export interface GenerationRequest {
  message: string;
  previousVersionId?: string;
}

// Generation Response
export interface GenerationResponse {
  id: string;
  plan: GenerationPlan;
  generatedCode: string;
  explanation: Explanation;
  diff?: DiffResult;
  preview?: string;
}

// Component Schema
export interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'handler' | 'array' | 'object';
  required?: boolean;
  default?: any;
  values?: any[]; // For enums
  description?: string;
}

export interface ComponentSchema {
  displayName: string;
  description?: string;
  props: Record<string, PropSchema>;
  constraints?: {
    maxChildren?: number;
    minChildren?: number;
    allowedParents?: string[];
    allowedChildren?: string[];
  };
}

export interface ComponentLibrary {
  [key: string]: ComponentSchema;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// Security Check Result
export interface SecurityCheckResult {
  safe: boolean;
  violations: SecurityViolation[];
}

export interface SecurityViolation {
  type: 'injection' | 'forbidden_keyword' | 'invalid_component' | 'invalid_props';
  message: string;
  content: string;
}

// JSX Analysis Result
export interface JSXAnalysisResult {
  components: string[];
  hasUnwhitelistedComponents: boolean;
  hasInlineStyles: boolean;
  hasForbiddenKeywords: boolean;
  valid: boolean;
  errors: string[];
}
