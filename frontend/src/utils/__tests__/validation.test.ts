import { vi } from 'vitest';
import {
  validationPatterns,
  validationMessages,
  createValidationRules,
  validationSchemas,
  validateField,
  validateForm,
  debounce,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validationPatterns', () => {
    it('should validate email patterns correctly', () => {
      expect(validationPatterns.email.test('test@example.com')).toBe(true);
      expect(validationPatterns.email.test('user.name+tag@domain.co.uk')).toBe(true);
      expect(validationPatterns.email.test('invalid-email')).toBe(false);
      expect(validationPatterns.email.test('test@')).toBe(false);
    });

    it('should validate username patterns correctly', () => {
      expect(validationPatterns.username.test('user123')).toBe(true);
      expect(validationPatterns.username.test('user_name')).toBe(true);
      expect(validationPatterns.username.test('user-name')).toBe(false);
      expect(validationPatterns.username.test('user name')).toBe(false);
    });

    it('should validate password patterns correctly', () => {
      expect(validationPatterns.mediumPassword.test('Password123')).toBe(true);
      expect(validationPatterns.mediumPassword.test('password123')).toBe(false);
      expect(validationPatterns.mediumPassword.test('PASSWORD123')).toBe(false);
      expect(validationPatterns.mediumPassword.test('Password')).toBe(false);
    });
  });

  describe('createValidationRules', () => {
    it('should create required validation rule', () => {
      const rule = createValidationRules.required();
      expect(rule.required).toBe(validationMessages.required);
    });

    it('should create email validation rule', () => {
      const rule = createValidationRules.email();
      expect(rule.required).toBe(validationMessages.required);
      expect(rule.pattern?.value).toBe(validationPatterns.email);
    });

    it('should create username validation rule', () => {
      const rule = createValidationRules.username(3, 20);
      expect(rule.minLength?.value).toBe(3);
      expect(rule.maxLength?.value).toBe(20);
      expect(rule.pattern?.value).toBe(validationPatterns.username);
    });

    it('should create password validation rule', () => {
      const rule = createValidationRules.password(8, true);
      expect(rule.minLength?.value).toBe(8);
      expect(rule.pattern?.value).toBe(validationPatterns.strongPassword);
    });

    it('should create confirm password validation rule', () => {
      const rule = createValidationRules.confirmPassword('password123');
      expect(rule.validate?.('password123')).toBe(true);
      expect(rule.validate?.('different')).toBe(validationMessages.passwordsNotMatch);
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const rule = { required: 'Field is required' };
      expect(validateField('', rule)).toBe('Field is required');
      expect(validateField('value', rule)).toBeUndefined();
      expect(validateField(null, rule)).toBe('Field is required');
      expect(validateField(undefined, rule)).toBe('Field is required');
    });

    it('should validate minLength', () => {
      const rule = { minLength: { value: 3, message: 'Too short' } };
      expect(validateField('ab', rule)).toBe('Too short');
      expect(validateField('abc', rule)).toBeUndefined();
      expect(validateField('abcd', rule)).toBeUndefined();
    });

    it('should validate maxLength', () => {
      const rule = { maxLength: { value: 5, message: 'Too long' } };
      expect(validateField('abcdef', rule)).toBe('Too long');
      expect(validateField('abcde', rule)).toBeUndefined();
      expect(validateField('abc', rule)).toBeUndefined();
    });

    it('should validate patterns', () => {
      const rule = { pattern: { value: /^\d+$/, message: 'Numbers only' } };
      expect(validateField('123', rule)).toBeUndefined();
      expect(validateField('abc', rule)).toBe('Numbers only');
      expect(validateField('12a', rule)).toBe('Numbers only');
    });

    it('should validate custom functions', () => {
      const rule = { validate: (value: string) => value === 'valid' || 'Invalid value' };
      expect(validateField('valid', rule)).toBeUndefined();
      expect(validateField('invalid', rule)).toBe('Invalid value');
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const schema = {
        username: createValidationRules.username(),
        email: createValidationRules.email(),
      };

      const validData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const invalidData = {
        username: 'ab',
        email: 'invalid-email',
      };

      expect(Object.keys(validateForm(validData, schema))).toHaveLength(0);
      expect(Object.keys(validateForm(invalidData, schema))).toHaveLength(2);
    });
  });

  describe('validationSchemas', () => {
    it('should have login schema', () => {
      expect(validationSchemas.login).toBeDefined();
      expect(validationSchemas.login.username).toBeDefined();
      expect(validationSchemas.login.password).toBeDefined();
    });

    it('should have register schema', () => {
      expect(validationSchemas.register).toBeDefined();
      expect(validationSchemas.register.username).toBeDefined();
      expect(validationSchemas.register.email).toBeDefined();
      expect(validationSchemas.register.password).toBeDefined();
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });
  });
});