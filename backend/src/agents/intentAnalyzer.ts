import { IntentType, GenerationRequest } from '../types';
import { sanitizeInput, detectPromptInjection } from '../utils/safety';

/* ============================================
   INTENT ANALYZER AGENT
   ============================================ */

const INTENT_KEYWORDS = {
  create: ['create', 'build', 'design', 'make', 'new', 'generate', 'design a', 'build a'],
  modify: ['update', 'change', 'modify', 'edit', 'add', 'remove', 'replace'],
  remove: ['delete', 'remove', 'eliminate', 'drop'],
  regenerate: ['regenerate', 'redo', 'retry', 'again', 'different version'],
  rollback: ['revert', 'rollback', 'go back', 'restore', 'previous']
};

/**
 * Analyze user request to determine intent
 */
export function analyzeIntent(request: GenerationRequest): {
  intent: IntentType;
  confidence: number;
  reasoning: string;
} {
  const message = request.message.toLowerCase();

  // Sanitize input
  const sanitized = sanitizeInput(request.message);

  // Check for injection attempts
  const injections = detectPromptInjection(message);
  if (injections.length > 0) {
    return {
      intent: 'create',
      confidence: 0,
      reasoning: `Potential security violation detected: ${injections[0].message}`
    };
  }

  let topIntent: IntentType = 'create';
  let maxMatches = 0;
  let matchingIntent: IntentType = 'create';

  // Count keyword matches for each intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matches = keywords.filter(kw => message.includes(kw)).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      matchingIntent = intent as IntentType;
    }
  }

  // If previousVersionId exists and no clear modify/remove intent, assume modify
  if (
    request.previousVersionId &&
    matchingIntent === 'create' &&
    !message.includes('rollback') &&
    !message.includes('regenerate')
  ) {
    matchingIntent = 'modify';
  }

  const confidence = Math.min(maxMatches / 3, 1); // Max confidence = 1.0

  return {
    intent: matchingIntent,
    confidence,
    reasoning: generateIntentReasoning(matchingIntent, message, maxMatches)
  };
}

/**
 * Generate explanation for detected intent
 */
function generateIntentReasoning(intent: IntentType, message: string, matches: number): string {
  const reasons: Record<IntentType, string> = {
    create: 'User is requesting a new UI component or layout',
    modify: 'User is requesting changes to existing UI',
    remove: 'User is requesting deletion of components',
    regenerate: 'User is requesting recreation of UI with modifications',
    rollback: 'User is requesting restoration of previous version'
  };

  return `${reasons[intent]}. (Keyword matches: ${matches})`;
}

/**
 * Validate intent-specific requirements
 */
export function validateIntentRequirements(
  intent: IntentType,
  request: GenerationRequest
): { valid: boolean; error?: string } {
  switch (intent) {
    case 'modify':
    case 'regenerate':
    case 'rollback':
      if (!request.previousVersionId) {
        return {
          valid: false,
          error: `Intent "${intent}" requires previousVersionId`
        };
      }
      break;

    case 'create':
      if (!request.message || request.message.trim().length < 10) {
        return {
          valid: false,
          error: 'Create intent requires a descriptive message (min 10 chars)'
        };
      }
      break;

    default:
      return { valid: true };
  }

  return { valid: true };
}

/**
 * Extract key entities from user message
 */
export function extractEntities(message: string): {
  componentsRequested: string[];
  layoutHints: string[];
  contentHints: string[];
} {
  const componentsRequested: string[] = [];
  const layoutHints: string[] = [];
  const contentHints: string[] = [];

  const componentNames = [
    'button', 'card', 'header', 'input', 'select', 'form',
    'modal', 'list', 'grid', 'stack', 'alert', 'divider', 'textarea'
  ];

  const layoutTerms = ['horizontal', 'vertical', 'grid', 'row', 'column', 'center', 'flex'];
  const styleTerms = ['dark', 'light', 'compact', 'spacious', 'minimal', 'bold'];

  const lowerMessage = message.toLowerCase();

  // Extract component references
  for (const component of componentNames) {
    if (lowerMessage.includes(component)) {
      componentsRequested.push(component);
    }
  }

  // Extract layout hints
  for (const term of layoutTerms) {
    if (lowerMessage.includes(term)) {
      layoutHints.push(term);
    }
  }

  // Extract style hints
  for (const term of styleTerms) {
    if (lowerMessage.includes(term)) {
      contentHints.push(term);
    }
  }

  return {
    componentsRequested,
    layoutHints,
    contentHints
  };
}
