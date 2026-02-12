import { ComponentLibrary, ComponentSchema } from './index';

/* ============================================
   FIXED DETERMINISTIC COMPONENT LIBRARY
   ============================================ */

export const COMPONENT_LIBRARY: ComponentLibrary = {
  // Layout Components
  Stack: {
    displayName: 'Stack',
    description: 'Directional layout container',
    props: {
      direction: {
        type: 'enum',
        required: true,
        values: ['horizontal', 'vertical'],
        description: 'Flex direction'
      },
      spacing: {
        type: 'enum',
        required: false,
        values: ['sm', 'md', 'lg'],
        default: 'md',
        description: 'Gap between children'
      },
      children: {
        type: 'array',
        required: false,
        description: 'Child components'
      }
    },
    constraints: {
      allowedChildren: [
        'Button', 'Card', 'Input', 'Select', 'TextArea',
        'Header', 'Modal', 'List', 'Grid', 'Text'
      ]
    }
  },

  Grid: {
    displayName: 'Grid',
    description: 'CSS Grid layout',
    props: {
      columns: {
        type: 'number',
        required: true,
        description: 'Number of columns'
      },
      gap: {
        type: 'enum',
        required: false,
        values: ['sm', 'md', 'lg'],
        default: 'md',
        description: 'Grid gap'
      },
      children: {
        type: 'array',
        required: false,
        description: 'Child components'
      }
    },
    constraints: {
      allowedChildren: ['Card', 'Button', 'Input', 'Header']
    }
  },

  // Content Components
  Header: {
    displayName: 'Header',
    description: 'Page header with optional navigation',
    props: {
      title: {
        type: 'string',
        required: true,
        description: 'Header title text'
      },
      subtitle: {
        type: 'string',
        required: false,
        description: 'Optional subtitle'
      },
      showNav: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show navigation bar'
      }
    },
    constraints: {
      allowedParents: ['Stack', 'Grid']
    }
  },

  Card: {
    displayName: 'Card',
    description: 'Content container with elevation',
    props: {
      title: {
        type: 'string',
        required: false,
        description: 'Card title'
      },
      subtitle: {
        type: 'string',
        required: false,
        description: 'Card subtitle'
      },
      children: {
        type: 'array',
        required: false,
        description: 'Card content'
      }
    },
    constraints: {
      allowedChildren: [
        'Button', 'Input', 'Select', 'TextArea',
        'Stack', 'List', 'Text'
      ]
    }
  },

  Text: {
    displayName: 'Text',
    description: 'Text content component',
    props: {
      content: {
        type: 'string',
        required: true,
        description: 'Text content'
      },
      variant: {
        type: 'enum',
        required: false,
        values: ['body', 'small', 'large'],
        default: 'body',
        description: 'Text size variant'
      }
    }
  },

  // Form Components
  Input: {
    displayName: 'Input',
    description: 'Text input field',
    props: {
      label: {
        type: 'string',
        required: false,
        description: 'Input label'
      },
      type: {
        type: 'enum',
        required: false,
        values: ['text', 'email', 'password', 'number'],
        default: 'text',
        description: 'Input type'
      },
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text'
      },
      required: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Required field'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Disabled state'
      }
    }
  },

  TextArea: {
    displayName: 'TextArea',
    description: 'Multi-line text input',
    props: {
      label: {
        type: 'string',
        required: false,
        description: 'TextArea label'
      },
      placeholder: {
        type: 'string',
        required: false,
        description: 'Placeholder text'
      },
      rows: {
        type: 'number',
        required: false,
        default: 4,
        description: 'Number of rows'
      },
      required: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Required field'
      }
    }
  },

  Select: {
    displayName: 'Select',
    description: 'Dropdown selector',
    props: {
      label: {
        type: 'string',
        required: false,
        description: 'Select label'
      },
      options: {
        type: 'array',
        required: true,
        description: 'Array of option strings'
      },
      required: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Required field'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Disabled state'
      }
    }
  },

  // Interactive Components
  Button: {
    displayName: 'Button',
    description: 'Interactive button',
    props: {
      children: {
        type: 'string',
        required: true,
        description: 'Button text'
      },
      variant: {
        type: 'enum',
        required: false,
        values: ['primary', 'secondary', 'danger'],
        default: 'primary',
        description: 'Visual variant'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Disabled state'
      },
      fullWidth: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Full width button'
      }
    }
  },

  // Modal/Overlay
  Modal: {
    displayName: 'Modal',
    description: 'Dialog overlay',
    props: {
      title: {
        type: 'string',
        required: true,
        description: 'Modal title'
      },
      open: {
        type: 'boolean',
        required: true,
        description: 'Modal visibility state'
      },
      children: {
        type: 'array',
        required: false,
        description: 'Modal content'
      }
    },
    constraints: {
      allowedChildren: ['Card', 'Stack', 'Button', 'Text']
    }
  },

  // List Component
  List: {
    displayName: 'List',
    description: 'Iterable list component',
    props: {
      items: {
        type: 'array',
        required: true,
        description: 'Array of items to render'
      },
      renderItem: {
        type: 'string',
        required: true,
        description: 'Template for each item'
      }
    }
  },

  // Divider
  Divider: {
    displayName: 'Divider',
    description: 'Visual separator',
    props: {
      spacing: {
        type: 'enum',
        required: false,
        values: ['sm', 'md', 'lg'],
        default: 'md',
        description: 'Divider spacing'
      }
    }
  },

  // Alert
  Alert: {
    displayName: 'Alert',
    description: 'Alert/notification message',
    props: {
      message: {
        type: 'string',
        required: true,
        description: 'Alert message text'
      },
      type: {
        type: 'enum',
        required: false,
        values: ['info', 'success', 'warning', 'error'],
        default: 'info',
        description: 'Alert type'
      }
    }
  }
};

// Helper function to get component schema
export function getComponentSchema(componentName: string): ComponentSchema | null {
  return COMPONENT_LIBRARY[componentName] || null;
}

// Helper function to check if component is whitelisted
export function isComponentWhitelisted(componentName: string): boolean {
  return componentName in COMPONENT_LIBRARY;
}

// Get list of all whitelisted components
export function getWhitelistedComponents(): string[] {
  return Object.keys(COMPONENT_LIBRARY);
}
