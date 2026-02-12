export type ComponentManifestEntry = {
  props: string[]; // allowed props (no inline style/event props)
  children?: 'any' | 'text' | string[];
};

export const componentManifest: {
  allowedComponents: Record<string, ComponentManifestEntry>;
  allowedImports: string[];
} = {
  allowedImports: ['react', 'my-ui-library'],
  allowedComponents: {
    Container: { props: ['className', 'id', 'styleClass'], children: 'any' },
    Text: { props: ['children', 'variant', 'className'], children: 'text' },
    Button: { props: ['children', 'variant', 'onClickHandlerId', 'className'], children: 'text' },
    Row: { props: ['className'], children: 'any' },
    Column: { props: ['className'], children: 'any' },
  },
};

// Export default for ease of import
export default componentManifest;
