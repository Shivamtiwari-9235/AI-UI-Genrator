import { ValidationResult, ValidationError, Version } from '../types';
import { isComponentWhitelisted } from '../types/componentLibrary';
import { versionService } from './versionService';
import {
  analyzeJSX,
  validateComponentTree,
  validateComponentProps
} from '../utils/index';
import {
  performSecurityCheck,
  detectForbiddenKeywords
} from '../utils/safety';

/* ============================================
   VALIDATION SERVICE
   ============================================ */

class ValidationService {
  /**
   * Validate entire generation
   */
  validateGeneration(
    userMessage: string,
    generatedCode: string,
    plan: any
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Security checks
    const securityCheck = performSecurityCheck(userMessage, generatedCode);
    if (!securityCheck.safe) {
      for (const violation of securityCheck.violations) {
        errors.push({
          path: 'security',
          message: violation.message,
          severity: 'error'
        });
      }
    }

    // JSX analysis
    const jsxAnalysis = analyzeJSX(generatedCode);
    if (!jsxAnalysis.valid) {
      for (const error of jsxAnalysis.errors) {
        errors.push({
          path: 'jsx',
          message: error,
          severity: 'error'
        });
      }
    }

    // Component tree validation
    if (plan.components) {
      const treeValidation = validateComponentTree(plan.components);
      errors.push(...treeValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate generated code can be executed
   */
  validateCodeSafety(code: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Check for forbidden keywords
    const forbiddenKeywordViolations = detectForbiddenKeywords(code);
    if (forbiddenKeywordViolations.length > 0) {
      for (const violation of forbiddenKeywordViolations) {
        errors.push({
          path: 'code',
          message: violation.message,
          severity: 'error'
        });
      }
    }

    // Check for valid JSX
    const jsxAnalysis = analyzeJSX(code);
    if (!jsxAnalysis.valid) {
      for (const error of jsxAnalysis.errors) {
        errors.push({
          path: 'jsx',
          message: error,
          severity: 'error'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate plan before generation
   */
  validatePlan(plan: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!plan.components || !Array.isArray(plan.components)) {
      errors.push({
        path: 'plan.components',
        message: 'Plan must contain components array',
        severity: 'error'
      });
      return { valid: false, errors };
    }

    if (plan.components.length === 0) {
      errors.push({
        path: 'plan.components',
        message: 'Plan must contain at least one component',
        severity: 'error'
      });
    }

    // Validate components
    for (const component of plan.components) {
      // Check component type is whitelisted
      if (!isComponentWhitelisted(component.type)) {
        errors.push({
          path: `plan.components.${component.id}`,
          message: `Component type "${component.type}" is not whitelisted`,
          severity: 'error'
        });
        continue;
      }

      // Validate props
      const propErrors = validateComponentProps(component.type, component.props);
      errors.push(...propErrors);
    }

    // Validate layout
    if (plan.layout) {
      if (plan.layout.direction && !['horizontal', 'vertical'].includes(plan.layout.direction)) {
        errors.push({
          path: 'plan.layout.direction',
          message: 'Layout direction must be "horizontal" or "vertical"',
          severity: 'error'
        });
      }

      if (plan.layout.spacing && !['sm', 'md', 'lg'].includes(plan.layout.spacing)) {
        errors.push({
          path: 'plan.layout.spacing',
          message: 'Layout spacing must be "sm", "md", or "lg"',
          severity: 'error'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate version exists and is valid
   */
  validateVersionExists(versionId: string): ValidationResult {
    if (!versionService.versionExists(versionId)) {
      return {
        valid: false,
        errors: [
          {
            path: 'versionId',
            message: `Version "${versionId}" not found`,
            severity: 'error'
          }
        ]
      };
    }

    return { valid: true, errors: [] };
  }
}

export const validationService = new ValidationService();
