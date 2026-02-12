import { GenerationPlan, Explanation, ComponentNode } from '../types';

/* ============================================
   EXPLAINER AGENT
   ============================================ */

/**
 * Generate detailed explanation for the generation
 */
export function generateExplanation(
  userMessage: string,
  plan: GenerationPlan,
  jsxCode: string
): Explanation {
  return {
    layoutReasoning: generateLayoutReasoning(plan, userMessage),
    componentSelectionReasoning: generateComponentReasoning(plan),
    modificationReasoning: generateModificationReasoning(plan),
    tradeoffs: generateTradeoffs(plan),
    constraints: generateConstraints()
  };
}

/**
 * Explain layout decisions
 */
function generateLayoutReasoning(plan: GenerationPlan, userMessage: string): string {
  const direction = plan.layout?.direction || 'vertical';
  const spacing = plan.layout?.spacing || 'md';

  let reasoning = `Applied ${direction} layout `;

  if (direction === 'vertical') {
    reasoning += 'to create a natural top-to-bottom flow, which improves readability and is mobile-friendly.';
  } else {
    reasoning += 'to arrange components side-by-side, optimizing space usage for larger screens.';
  }

  reasoning += ` Used ${spacing === 'sm' ? 'compact' : spacing === 'lg' ? 'spacious' : 'default'} spacing `;

  if (spacing === 'sm') {
    reasoning += 'to create a dense, information-rich layout.';
  } else if (spacing === 'lg') {
    reasoning += 'to provide breathing room and improve visual hierarchy.';
  } else {
    reasoning += 'for balanced visual separation.';
  }

  return reasoning;
}

/**
 * Explain component selection
 */
function generateComponentReasoning(plan: GenerationPlan): Record<string, string> {
  const reasoning: Record<string, string> = {};

  // Group components by type
  const componentsByType = groupComponentsByType(plan.components);

  for (const [type, components] of Object.entries(componentsByType)) {
    reasoning[type] = getComponentExplanation(type, components.length);
  }

  return reasoning;
}

/**
 * Get explanation for specific component
 */
function getComponentExplanation(type: string, count: number): string {
  const explanations: Record<string, string> = {
    Header:
      'Provides clear page title and navigation context at the top of the layout.',
    Card: `Encapsulates content in visually distinct ${count > 1 ? 'containers' : 'container'} for better visual hierarchy and organization.`,
    Button:
      'Enables user interaction with clear call-to-action. Different variants (primary/secondary) guide visual hierarchy.',
    Input:
      'Collects specific text input from users. Type variants (email, password) provide semantic meaning and appropriate keyboard on mobile.',
    Select:
      'Provides constrained selection from predefined options, reducing input errors compared to free-text input.',
    TextArea:
      'Allows multi-line text input for longer content like messages, comments, or descriptions.',
    Modal:
      'Focuses user attention on critical actions or information by overlaying on the page content.',
    List: 'Displays multiple items in a scannable, organized format. Improves readability for iterable data.',
    Grid: 'Creates responsive multi-column layouts. Naturally adapts to available screen width.',
    Stack: 'Provides flexible directional layout component for organizing content in rows or columns.',
    Alert:
      'Communicates status messages, warnings, or errors with color-coded visual indicators for quick recognition.',
    Divider: 'Provides visual separation between content sections without adding layout complexity.',
    Text: 'Ensures semantic text content with consistent typography scaling.'
  };

  return explanations[type] || `Included in layout (${count} instance${count !== 1 ? 's' : ''})`;
}

/**
 * Group components by type
 */
function groupComponentsByType(
  components: ComponentNode[]
): Record<string, ComponentNode[]> {
  const grouped: Record<string, ComponentNode[]> = {};

  for (const component of components) {
    if (!grouped[component.type]) {
      grouped[component.type] = [];
    }
    grouped[component.type].push(component);

    // Also group children
    if (component.children) {
      const childComponents = component.children.filter(c => typeof c === 'object');
      const childGrouped = groupComponentsByType(childComponents);
      for (const [type, comps] of Object.entries(childGrouped)) {
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(...comps);
      }
    }
  }

  return grouped;
}

/**
 * Explain modifications from previous version
 */
function generateModificationReasoning(plan: GenerationPlan): string {
  if (plan.intent === 'create') {
    return 'Generated new UI based on your requirements.';
  }

  if (plan.intent === 'modify') {
    return 'Updated component props and layout to reflect your requested changes while preserving existing structure.';
  }

  if (plan.intent === 'remove') {
    return 'Removed specified components from layout and reorganized remaining components for balanced composition.';
  }

  if (plan.intent === 'regenerate') {
    return 'Regenerated UI with fresh component configuration based on original request and your feedback.';
  }

  if (plan.intent === 'rollback') {
    return 'Restored previous version to specified point in generation history.';
  }

  return 'Applied modifications to your UI.';
}

/**
 * Generate list of tradeoffs made
 */
function generateTradeoffs(plan: GenerationPlan): string[] {
  const tradeoffs: string[] = [];

  const totalComponents = countTotalComponents(plan.components);

  if (totalComponents > 5) {
    tradeoffs.push(
      'Multiple components increase visual complexity. Consider grouping into Cards for better organization.'
    );
  }

  if (plan.layout?.direction === 'horizontal' && totalComponents > 3) {
    tradeoffs.push(
      'Horizontal layout with many components may overflow on smaller screens. Consider responsive breakpoints.'
    );
  }

  // Check for forms
  const hasInputs = containsComponentType(plan.components, 'Input');
  const hasTextAreas = containsComponentType(plan.components, 'TextArea');
  if (hasInputs || hasTextAreas) {
    tradeoffs.push(
      'Form components use standard HTML inputs. Add form state management and validation in parent component.'
    );
  }

  // Check for modals
  if (containsComponentType(plan.components, 'Modal')) {
    tradeoffs.push('Modals require state management. Initialize with open={false} and add close handler.');
  }

  // Check for lists
  if (containsComponentType(plan.components, 'List')) {
    tradeoffs.push(
      'Lists require data array. Bind items prop to dynamic data and implement renderItem template.'
    );
  }

  if (tradeoffs.length === 0) {
    tradeoffs.push('All components use standard library props. No external dependencies required.');
  }

  return tradeoffs;
}

/**
 * Generate constraints and limitations
 */
function generateConstraints(): string[] {
  return [
    'Only whitelisted deterministic components are used. Custom components cannot be added.',
    'No inline styles allowed. Use component library\' built-in theming system.',
    'No external JavaScript libraries injected. All interactivity requires parent component handlers.',
    'Generated code is static JSX. Add event handlers and state management in parent component.',
    'Component nesting respects allowedChildren constraints defined in component schemas.',
    'All props are validated against component schema during generation.'
  ];
}

/**
 * Count total components including nested
 */
function countTotalComponents(components: ComponentNode[]): number {
  let count = 0;

  for (const component of components) {
    count++;
    if (component.children) {
      const childComponents = component.children.filter(c => typeof c === 'object');
      count += countTotalComponents(childComponents);
    }
  }

  return count;
}

/**
 * Check if component tree contains specific type
 */
function containsComponentType(components: ComponentNode[], type: string): boolean {
  for (const component of components) {
    if (component.type === type) {
      return true;
    }

    if (component.children) {
      const childComponents = component.children.filter(c => typeof c === 'object');
      if (containsComponentType(childComponents, type)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Format explanation for display
 */
export function formatExplanationForDisplay(explanation: Explanation): string {
  let formatted = '## Generation Explanation\n\n';

  formatted += `### Layout Reasoning\n${explanation.layoutReasoning}\n\n`;

  formatted += `### Component Selection\n`;
  for (const [component, reason] of Object.entries(explanation.componentSelectionReasoning)) {
    formatted += `- **${component}**: ${reason}\n`;
  }

  if (explanation.modificationReasoning) {
    formatted += `\n### Modifications\n${explanation.modificationReasoning}\n`;
  }

  formatted += `\n### Tradeoffs & Considerations\n`;
  for (const tradeoff of explanation.tradeoffs) {
    formatted += `- ${tradeoff}\n`;
  }

  formatted += `\n### Constraints\n`;
  for (const constraint of explanation.constraints) {
    formatted += `- ${constraint}\n`;
  }

  return formatted;
}
