import express, { Request, Response } from 'express';
import { createServer as createNetServer } from 'net';
import cors from 'cors';
import { GenerationRequest, GenerationResponse, Version } from './types';
import { analyzeIntent, validateIntentRequirements } from './agents/intentAnalyzer';
import { generatePlan, estimatePlanComplexity } from './agents/planner';
import { generateJSX, extractMetadata } from './agents/generator';
import { generateExplanation } from './agents/explainer';
import { versionService, versionToResponse } from './services/versionService';
import { validationService } from './services/validationService';
import { jsxAnalyzerService } from './services/jsxAnalyzer';
import { performSecurityCheck } from './utils/safety';
import { calculateDiff } from './utils/patching';

/* ============================================
   EXPRESS SERVER & ORCHESTRATION
   ============================================ */

const app = express();
const PORT = process.env.PORT ? parseInt(String(process.env.PORT), 10) : 5000;

async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = createNetServer()
      .once('error', () => {
        resolve(false);
      })
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function findAvailablePort(preferred: number, maxOffset = 10): Promise<number> {
  for (let p = preferred; p <= preferred + maxOffset; p++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(p);
    if (free) return p;
  }
  // fallback: return 0 to let OS pick an ephemeral port
  return 0;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    versions: versionService.getVersionCount()
  });
});

/* ============================================
   MAIN GENERATION ENDPOINT
   ============================================ */

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const request: GenerationRequest = req.body;

    // Validate request
    if (!request.message || request.message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required'
      });
    }

    console.log(`📝 Generation request: "${request.message}"`);

    // STEP 1: INTENT ANALYSIS
    console.log('⏳ Step 1: Analyzing intent...');
    const intentResult = analyzeIntent(request);
    console.log(`✅ Detected intent: ${intentResult.intent} (confidence: ${(intentResult.confidence * 100).toFixed(0)}%)`);

    // Validate intent requirements
    const intentValidation = validateIntentRequirements(intentResult.intent, request);
    if (!intentValidation.valid) {
      return res.status(400).json({
        error: 'Invalid intent',
        message: intentValidation.error
      });
    }

    // STEP 2: PLANNING
    console.log('⏳ Step 2: Creating plan...');
    const plan = generatePlan(request.message);
    const planComplexity = estimatePlanComplexity(plan);
    console.log(`✅ Plan created: ${planComplexity.complexity} complexity, ${planComplexity.componentCount} components`);

    // Validate plan
    const planValidation = validationService.validatePlan(plan);
    if (!planValidation.valid) {
      return res.status(400).json({
        error: 'Invalid plan',
        errors: planValidation.errors
      });
    }

    // STEP 3: CODE GENERATION
    console.log('⏳ Step 3: Generating JSX...');
    const generatedCode = generateJSX(plan);
    const metadata = extractMetadata(generatedCode);
    console.log(`✅ JSX generated: ${metadata.linesOfCode} lines`);

    // STEP 4: SECURITY & VALIDATION
    console.log('⏳ Step 4: Security checks...');
    const securityCheck = performSecurityCheck(request.message, generatedCode);
    if (!securityCheck.safe) {
      console.warn('⚠️ Security violations detected:', securityCheck.violations);
      return res.status(400).json({
        error: 'Security validation failed',
        violations: securityCheck.violations
      });
    }
    console.log('✅ Security checks passed');

    // Code safety validation
    const codeSafetyValidation = validationService.validateCodeSafety(generatedCode);
    if (!codeSafetyValidation.valid) {
      console.warn('⚠️ Code safety issues:', codeSafetyValidation.errors);
      return res.status(400).json({
        error: 'Code safety validation failed',
        errors: codeSafetyValidation.errors
      });
    }

    // STEP 5: EXPLANATION
    console.log('⏳ Step 5: Generating explanation...');
    let explanation;
    try {
      explanation = generateExplanation(request.message, plan, generatedCode);
      // Ensure explanation is serializable
      JSON.stringify(explanation);
    } catch (e) {
      console.error('Error in explanation generation:', e);
      explanation = {
        layoutReasoning: 'Generated layout structure',
        componentSelectionReasoning: {},
        tradeoffs: [],
        constraints: []
      };
    }
    console.log('✅ Explanation generated');

    // STEP 6: DIFF CALCULATION
    let diffFromPrevious = undefined;
    if (request.previousVersionId) {
      const previousVersion = versionService.getVersion(request.previousVersionId);
      if (previousVersion) {
        diffFromPrevious = calculateDiff(previousVersion.generatedCode, generatedCode);
      }
    }

    // STEP 7: STORE VERSION
    console.log('⏳ Step 7: Storing version...');
    const version: Omit<Version, 'id'> = {
      userMessage: request.message,
      plan,
      generatedCode,
      explanation,
      diffFromPrevious,
      timestamp: Date.now(),
      metadata: {
        intent: intentResult.intent,
        componentCount: metadata.componentCount,
        linesOfCode: metadata.linesOfCode
      }
    };

    const savedVersion = versionService.saveVersion(version);
    console.log(`✅ Version saved: ${savedVersion.id}`);

    // Build response
    let response: GenerationResponse;
    try {
      response = versionToResponse(savedVersion);
      // Ensure response is serializable
      JSON.stringify(response);
    } catch (e) {
      console.error('Error building response:', e);
      return res.status(500).json({
        error: 'Generation failed',
        message: 'Error preparing response'
      });
    }

    res.json({
      success: true,
      data: response,
      metadata: {
        intent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        complexity: planComplexity.complexity,
        generationTime: Date.now()
      }
    });

    console.log('✅ Generation complete\n');
  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/* ============================================
   VERSION MANAGEMENT ENDPOINTS
   ============================================ */

app.get('/api/versions', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const versions = versionService.getVersionHistory(limit);

    res.json({
      success: true,
      data: versions.map(v => ({
        id: v.id,
        timestamp: v.timestamp,
        userMessage: v.userMessage,
        metadata: v.metadata
      })),
      total: versionService.getVersionCount()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

app.get('/api/versions/:id', (req: Request, res: Response) => {
  try {
    const version = versionService.getVersion(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({
      success: true,
      data: versionToResponse(version)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

app.post('/api/rollback/:id', (req: Request, res: Response) => {
  try {
    const version = versionService.getVersion(req.params.id);

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Create new version from rollback
    const newVersion: Omit<Version, 'id'> = {
      userMessage: `[ROLLBACK] ${version.userMessage}`,
      plan: version.plan,
      generatedCode: version.generatedCode,
      explanation: version.explanation,
      timestamp: Date.now(),
      metadata: {
        intent: 'rollback',
        componentCount: version.metadata.componentCount,
        linesOfCode: version.metadata.linesOfCode
      }
    };

    const savedVersion = versionService.saveVersion(newVersion);

    res.json({
      success: true,
      data: versionToResponse(savedVersion),
      message: 'Rolled back successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Rollback failed' });
  }
});

/* ============================================
   VALIDATION & ANALYSIS ENDPOINTS
   ============================================ */

app.post('/api/validate-plan', (req: Request, res: Response) => {
  try {
    const plan = req.body;
    const validation = validationService.validatePlan(plan);

    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.post('/api/analyze-code', (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const analysis = jsxAnalyzerService.analyzeCode(code);
    const metrics = jsxAnalyzerService.calculateMetrics(code);
    const patterns = jsxAnalyzerService.detectPatterns(code);

    res.json({
      success: true,
      analysis,
      metrics,
      patterns
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/* ============================================
   COMPONENT LIBRARY ENDPOINT
   ============================================ */

app.get('/api/components', (req: Request, res: Response) => {
  try {
    const { getWhitelistedComponents } = require('./types/componentLibrary');
    const components = getWhitelistedComponents();

    res.json({
      success: true,
      components,
      count: components.length,
      description: 'Whitelisted deterministic components'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

app.get('/api/components/:name', (req: Request, res: Response) => {
  try {
    const { getComponentSchema } = require('./types/componentLibrary');
    const schema = getComponentSchema(req.params.name);

    if (!schema) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json({
      success: true,
      component: req.params.name,
      schema
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

/* ============================================
   ERROR HANDLING
   ============================================ */

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

/* ============================================
   START SERVER
   ============================================ */

(async () => {
  try {
    const chosen = await findAvailablePort(PORT, 10);
    const listenPort = chosen === 0 ? undefined : chosen;

    const server = app.listen(listenPort, () => {
      const actualPort = (server.address() && typeof server.address() === 'object') ? (server.address() as any).port : PORT;
      console.log(`\n${'='.repeat(50)}`);
      console.log('🚀 AI UI Generator Backend');
      console.log(`${'='.repeat(50)}`);
      console.log(`Server running on http://localhost:${actualPort}`);
      console.log('\nAvailable endpoints:');
      console.log('  POST   /api/generate           - Generate UI');
      console.log('  GET    /api/versions           - List versions');
      console.log('  GET    /api/versions/:id       - Get specific version');
      console.log('  POST   /api/rollback/:id       - Rollback to version');
      console.log('  POST   /api/validate-plan      - Validate plan');
      console.log('  POST   /api/analyze-code       - Analyze generated code');
      console.log('  GET    /api/components         - List all components');
      console.log('  GET    /api/components/:name   - Get component schema');
      console.log(`${'='.repeat(50)}\n`);
    });
    server.on('error', (err: any) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} in use and fallback also failed. Start server with a free port or set PORT env var.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
