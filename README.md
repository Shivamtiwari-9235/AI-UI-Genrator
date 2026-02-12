# Advanced Deterministic AI UI Generator

Enterprise-grade AI-powered UI generation system with deterministic safety guarantees, multi-step reasoning agents, and version control.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                │
├─────────────────────────────────────────────────────────────┤
│  • Interactive UI Editor                                    │
│  • Version History & Replay                                 │
│  • Diff Viewer                                              │
│  • Sandboxed Preview                                        │
│  • Component Library Browser                                │
└────────────────┬──────────────────────────────────────────┘
                 │ REST API / WebSocket
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Agent Orchestration Pipeline                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  1. Intent Analyzer      (Classify request)        │    │
│  │  2. Planner              (Generate JSON tree)      │    │
│  │  3. Generator            (Convert to JSX)          │    │
│  │  4. Explainer            (Structured reasoning)    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Safety & Validation Layer                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  • Prompt Injection Detector                        │    │
│  │  • Forbidden Keyword Filter                         │    │
│  │  • Schema Validator                                 │    │
│  │  • JSX Static Analyzer                              │    │
│  │  • Component Whitelist Enforcer                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Storage Layer                               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  • Version Control (LocalStorage / DB)              │    │
│  │  • Component Schema Registry                        │    │
│  │  • Generation History                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Agent Orchestration

### Step 1: Intent Analyzer
Detects the type of user request to route through appropriate pipelines:

- **Create**: Generate new UI from scratch
- **Modify**: Update existing component props/layout
- **Remove**: Delete components from layout
- **Regenerate**: Recreate from previous version
- **Rollback**: Restore previous version

### Step 2: Planner
Generates a structured plan as a JSON tree before code generation:

```javascript
{
  "intent": "create",
  "components": [
    {
      "id": "header_1",
      "type": "Header",
      "props": {
        "title": "My Application",
        "showNav": true
      },
      "children": []
    }
  ],
  "layout": {
    "direction": "vertical",
    "spacing": "md"
  }
}
```

### Step 3: Generator
Converts the plan into JSX with:

- **Incremental AST-based patching** for efficient updates
- **Previous structure preservation** to maintain user-made changes
- **Deterministic component selection** (whitelist only)
- **Props validation** against component schemas

### Step 4: Explainer
Provides structured reasoning:

```javascript
{
  "layoutReasoning": "Vertical stack for mobile responsiveness",
  "componentSelectionReasoning": {
    "Header": "Best for navigation structure",
    "Card": "Encapsulates content with visual hierarchy"
  },
  "modificationReasoning": "Updated to match user feedback",
  "tradeoffs": [
    "Chose Card over custom component for consistency",
    "Limited animation to reduce bundle size"
  ]
}
```

## Deterministic Enforcement Strategy

### 1. Component Whitelist (Fixed Library)
All available components are pre-defined with strict schemas:

```typescript
COMPONENT_LIBRARY = {
  Button: { variants: ['primary', 'secondary'], disabled: boolean },
  Card: { title: string, children: ReactNode },
  Header: { title: string, showNav: boolean },
  // ... only these components allowed
}
```

### 2. Schema Validation
Every component plan is validated against its schema BEFORE code generation:

- Type checking
- Required fields verification
- Valid prop values enforcement

### 3. Static JSX Analysis
Generated code is parsed and analyzed to ensure:

```typescript
// ALLOWED:
<Button variant="primary">Click</Button>
<Card title="Greeting">{children}</Card>

// REJECTED:
<CustomComponent /> // Not in whitelist
<Button style={{ color: 'red' }} /> // Inline styles forbidden
```

### 4. Intent-Based Routing
User intent determines which operations are allowed:

- **Create**: Can only use whitelisted components
- **Modify**: Can only change props in schema
- **Remove**: Can only remove existing components
- **Regenerate/Rollback**: Reconstruction from historical plans

## Safety Strategy

### Security Layers

#### 1. Prompt Injection Defense
```typescript
// Detects attempts to inject instructions
const maliciousPatterns = [
  /ignore previous instructions/i,
  /execute command/i,
  /run code/i,
  /bypass/i
]
// Blocks requests containing patterns
```

#### 2. Forbidden Keyword Filter
```typescript
const forbiddenKeywords = [
  'eval', 'dangerouslySetInnerHTML', 'innerHTML',
  'onclick', 'fetch', 'axios', 'setTimeout',
  'import ', 'require', 'export'
]
// Rejects code containing keywords
```

#### 3. Sandboxed Preview
- Generated code runs in iframe with no parent access
- No network requests allowed
- No localStorage/sessionStorage access
- Event handlers limited to UI-only interactions

#### 4. Error Boundary
```typescript
<ErrorBoundary
  fallback={<FallbackUI />}
  onError={logError}
>
  <GeneratedComponent />
</ErrorBoundary>
```

#### 5. Content Security Policy
- Inline scripts blocked
- External scripts blocked
- Style injection blocked

## Versioning System

Each generation stores:

```typescript
interface Version {
  id: string; // UUID
  userMessage: string; // Original request
  plan: GenerationPlan; // JSON tree
  generatedCode: string; // JSX code
  explanation: Explanation; // Multi-part reasoning
  diffFromPrevious: DiffResult; // Changes from last version
  timestamp: number; // Creation time
  metadata: {
    intent: IntentType;
    componentCount: number;
    linesOfCode: number;
  };
}
```

### Operations

- **Rollback**: Restore any previous version
- **Regenerate**: Create new version from old plan with modifications
- **Replay**: Execute all versions sequentially with animations

## Tradeoffs & Design Decisions

### Tradeoff 1: Safety vs Flexibility
**Decision**: Strict component whitelist
- **Benefit**: 100% deterministic, no unexpected behavior
- **Cost**: Cannot custom-style components
- **Rationale**: Enterprise safety > freedom; styling handled by component library

### Tradeoff 2: Planning Overhead
**Decision**: Always generate plan before code
- **Benefit**: Validation, traceability, rollback capability
- **Cost**: 2x latency compared to direct generation
- **Rationale**: Traceability and safety are non-negotiable

### Tradeoff 3: Sandboxed Preview
**Decision**: iframe isolation for previews
- **Benefit**: Prevents XSS, malicious DOM mutations
- **Cost**: Component communication requires controlled channels
- **Rationale**: Security > developer convenience

### Tradeoff 4: No Real-Time Streaming (Phase 1)
**Decision**: Full generation then display
- **Benefit**: Validation pass before user sees code
- **Cost**: No perceived incremental output
- **Rationale**: Safety validation requires complete plan

## Future Improvements

### Phase 2: Advanced Reasoning
- **Multi-modal planning**: Accept wireframes/screenshots
- **Contextual state management**: Suggest state patterns
- **Accessibility audit**: Auto-check WCAG compliance
- **Performance profiling**: Detect render inefficiencies

### Phase 3: Streaming & Real-Time
- **Streaming explanations**: Output reasoning as it happens
- **Live preview updates**: Show components as they're generated
- **Collaborative editing**: Multi-user version branching
- **AI conflict resolution**: Merge divergent UI versions

### Phase 4: Advanced Safety
- **Semantic prompt injection**: ML-based detection
- **Component behavior simulation**: Pre-execution analysis
- **Usage pattern learning**: Detect anomalous generation patterns
- **Formal verification**: Proof of component safety

### Phase 5: Enterprise Features
- **Design system integration**: Auto-apply brand specs
- **Accessibility presets**: Template-based WCAG compliance
- **Performance budgeting**: Component cost estimation
- **Team collaboration**: Shared history, approval workflows

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Project

```bash
# Terminal 1: Start backend (port 5000)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

### Testing the System

1. Navigate to http://localhost:5173
2. Enter a request like: "Create a login form with email and password fields"
3. Observe:
   - Intent detection
   - JSON plan generation
   - JSX code generation
   - Explanation output
   - Sandboxed preview

## Component Library Reference

### Available Components

| Component | Props | Description |
|-----------|-------|-------------|
| **Button** | variant, disabled, onClick | Interactive button |
| **Card** | title, subtitle, children | Content container |
| **Header** | title, showNav | Page header with navigation |
| **Input** | label, type, placeholder, value | Form input field |
| **Select** | label, options, value | Dropdown selector |
| **TextArea** | label, placeholder, value | Multi-line input |
| **Modal** | title, open, onClose, children | Dialog overlay |
| **List** | items, renderItem | Iterable list component |
| **Grid** | columns, gap, children | Layout grid |
| **Stack** | direction, spacing, children | Directional layout |

### Example Component Schema

```typescript
Button: {
  displayName: 'Button',
  props: {
    variant: {
      type: 'enum',
      values: ['primary', 'secondary', 'danger'],
      required: true
    },
    disabled: {
      type: 'boolean',
      required: false,
      default: false
    },
    onClick: {
      type: 'handler',
      required: false
    },
    children: {
      type: 'string | ReactNode',
      required: true
    }
  },
  constraints: {
    maxChildren: 1,
    allowedParents: ['Card', 'Modal', 'Stack']
  }
}
```

## Project Structure

```
AI-UI Generator/
├── backend/
│   ├── src/
│   │   ├── agents/           # Multi-step pipeline
│   │   │   ├── intentAnalyzer.ts
│   │   │   ├── planner.ts
│   │   │   ├── generator.ts
│   │   │   └── explainer.ts
│   │   ├── services/         # Business logic
│   │   │   ├── versionService.ts
│   │   │   ├── validationService.ts
│   │   │   └── jsxAnalyzer.ts
│   │   ├── types/            # TypeScript definitions
│   │   │   ├── index.ts
│   │   │   └── componentLibrary.ts
│   │   ├── utils/            # Helper functions
│   │   │   ├── safety.ts
│   │   │   ├── patching.ts
│   │   │   └── diff.ts
│   │   └── index.ts          # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Editor.tsx
│   │   │   ├── Preview.tsx
│   │   │   ├── DiffViewer.tsx
│   │   │   ├── VersionHistory.tsx
│   │   │   └── ComponentLibrary.tsx
│   │   ├── pages/
│   │   │   └── App.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useGeneration.ts
│   │   │   └── useVersionHistory.ts
│   │   ├── lib/              # Utilities
│   │   │   ├── api.ts
│   │   │   └── storage.ts
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## API Reference

### POST /api/generate
Generate new UI from user request.

**Request:**
```json
{
  "message": "Create a login form",
  "previousVersionId": null
}
```

**Response:**
```json
{
  "id": "uuid",
  "plan": { ... },
  "generatedCode": "...",
  "explanation": { ... },
  "diff": { ... }
}
```

### POST /api/rollback
Restore a previous version.

**Request:**
```json
{
  "versionId": "uuid"
}
```

### GET /api/versions
List all generation versions.

### POST /api/validate
Validate a plan before generation.

## License

Proprietary - Enterprise Use Only

## Author

Senior AI Systems Engineer
Built: February 2026
