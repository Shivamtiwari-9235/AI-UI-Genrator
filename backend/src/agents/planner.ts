import { GenerationPlan, ComponentNode } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { extractEntities } from './intentAnalyzer';

/* ============================================
   PLANNER AGENT
   ============================================ */

/**
 * Generate a structured plan from user request
 */
export function generatePlan(
  userMessage: string,
  desiredComponents?: string[]
): GenerationPlan {
  const entities = extractEntities(userMessage);
  const messageLower = userMessage.toLowerCase();

  // Determine layout direction
  const direction = messageLower.includes('horizontal') ? 'horizontal' : 'vertical';
  const spacing = messageLower.includes('spacious')
    ? 'lg'
    : messageLower.includes('compact')
      ? 'sm'
      : 'md';

  // Select components based on request
  const components = planComponents(
    userMessage,
    desiredComponents || entities.componentsRequested
  );

  return {
    intent: 'create',
    components,
    layout: {
      direction,
      spacing
    },
    description: `Layout with ${components.length} components in ${direction} direction`
  };
}

/**
 * Plan which components to include
 */
function planComponents(message: string, requestedComponents: string[]): ComponentNode[] {
  const components: ComponentNode[] = [];
  const messageLower = message.toLowerCase();

  // Always add header if mentioned
  if (
    messageLower.includes('header') ||
    messageLower.includes('title') ||
    messageLower.includes('top')
  ) {
    components.push({
      id: `header_${uuidv4().substring(0, 8)}`,
      type: 'Header',
      props: {
        title: extractTitleFromMessage(message),
        showNav: messageLower.includes('nav')
      }
    });
  }

  // Add form components if mentioned
  if (messageLower.includes('form') || messageLower.includes('login')) {
    const formComponents = planFormComponents(message);
    components.push(...formComponents);
  }

  // Add specific requested components
  for (const comp of requestedComponents) {
    if (
      !components.some(c => c.type === comp) &&
      messageLower.includes(comp.toLowerCase())
    ) {
      const component = createComponentFromType(comp);
      if (component) {
        components.push(component);
      }
    }
  }

  // Add card if content needs container
  if (components.length > 1 &&!messageLower.includes('card')) {
    components.push({
      id: `card_${uuidv4().substring(0, 8)}`,
      type: 'Card',
      props: {
        title: 'Content'
      },
      children: components.slice(1) // Nest components in card
    });
    return [components[0], components[components.length - 1]]; // Return header and card
  }

  // If no components planned, add a basic card
  if (components.length === 0) {
    components.push({
      id: `card_${uuidv4().substring(0, 8)}`,
      type: 'Card',
      props: {
        title: 'Content'
      }
    });
  }

  return components;
}

/**
 * Plan form-related components
 */
function planFormComponents(message: string): ComponentNode[] {
  const components: ComponentNode[] = [];
  const messageLower = message.toLowerCase();

  // Email field
  if (messageLower.includes('email')) {
    components.push({
      id: `input_email_${uuidv4().substring(0, 8)}`,
      type: 'Input',
      props: {
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email'
      }
    });
  }

  // Password field
  if (messageLower.includes('password')) {
    components.push({
      id: `input_password_${uuidv4().substring(0, 8)}`,
      type: 'Input',
      props: {
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password'
      }
    });
  }

  // Generic fields
  if (messageLower.includes('name')) {
    components.push({
      id: `input_name_${uuidv4().substring(0, 8)}`,
      type: 'Input',
      props: {
        label: 'Name',
        type: 'text',
        placeholder: 'Enter your name'
      }
    });
  }

  // Submit button
  if (messageLower.includes('login') || messageLower.includes('form')) {
    components.push({
      id: `button_submit_${uuidv4().substring(0, 8)}`,
      type: 'Button',
      props: {
        children: 'Submit',
        variant: 'primary',
        fullWidth: true
      }
    });
  }

  return components;
}

/**
 * Create a component from type string
 */
function createComponentFromType(type: string): ComponentNode | null {
  const typeLower = type.toLowerCase();

  const defaults: Record<string, ComponentNode> = {
    button: {
      id: `button_${uuidv4().substring(0, 8)}`,
      type: 'Button',
      props: { children: 'Click Me', variant: 'primary' }
    },
    card: {
      id: `card_${uuidv4().substring(0, 8)}`,
      type: 'Card',
      props: { title: 'Card Title' }
    },
    header: {
      id: `header_${uuidv4().substring(0, 8)}`,
      type: 'Header',
      props: { title: 'Header', showNav: false }
    },
    input: {
      id: `input_${uuidv4().substring(0, 8)}`,
      type: 'Input',
      props: { label: 'Input', type: 'text', placeholder: 'Enter text' }
    },
    select: {
      id: `select_${uuidv4().substring(0, 8)}`,
      type: 'Select',
      props: { label: 'Select', options: ['Option 1', 'Option 2', 'Option 3'] }
    },
    modal: {
      id: `modal_${uuidv4().substring(0, 8)}`,
      type: 'Modal',
      props: { title: 'Modal', open: true }
    },
    list: {
      id: `list_${uuidv4().substring(0, 8)}`,
      type: 'List',
      props: { items: ['Item 1', 'Item 2', 'Item 3'], renderItem: 'item' }
    },
    grid: {
      id: `grid_${uuidv4().substring(0, 8)}`,
      type: 'Grid',
      props: { columns: 2, gap: 'md' }
    },
    stack: {
      id: `stack_${uuidv4().substring(0, 8)}`,
      type: 'Stack',
      props: { direction: 'vertical', spacing: 'md' }
    },
    textarea: {
      id: `textarea_${uuidv4().substring(0, 8)}`,
      type: 'TextArea',
      props: { label: 'Message', placeholder: 'Enter text', rows: 4 }
    },
    alert: {
      id: `alert_${uuidv4().substring(0, 8)}`,
      type: 'Alert',
      props: { message: 'Alert message', type: 'info' }
    }
  };

  return defaults[typeLower] || null;
}

/**
 * Extract title from message
 */
function extractTitleFromMessage(message: string): string {
  // Look for quoted text
  const quoted = message.match(/"([^"]+)"/);
  if (quoted) return quoted[1];

  // Look for title pattern
  const titleMatch = message.match(/(?:title|called|named)\s+(?:")?([^".,]+)/i);
  if (titleMatch) return titleMatch[1].trim();

  // Default
  return 'Application';
}

/**
 * Estimate plan complexity and component count
 */
export function estimatePlanComplexity(plan: GenerationPlan): {
  complexity: 'simple' | 'moderate' | 'complex';
  componentCount: number;
  estimatedLOC: number;
} {
  const componentCount = countComponents(plan.components);
  const complexity =
    componentCount <= 3
      ? 'simple'
      : componentCount <= 8
        ? 'moderate'
        : 'complex';

  const estimatedLOC = componentCount * 8 + 20; // Rough estimation

  return { complexity, componentCount, estimatedLOC };
}

/**
 * Count total components (including nested)
 */
function countComponents(components: ComponentNode[]): number {
  let count = 0;

  for (const component of components) {
    count++;
    if (component.children) {
      const childComponents = component.children.filter(c => typeof c === 'object');
      count += childComponents.length;
    }
  }

  return count;
}
