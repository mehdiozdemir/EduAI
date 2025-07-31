// Validation utilities for forms
export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Common validation patterns
export const validationPatterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  username: /^[a-zA-Z0-9_]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  mediumPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  phoneNumber: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Common validation messages
export const validationMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir e-posta adresi girin',
  username: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir',
  passwordTooShort: 'Şifre en az {min} karakter olmalıdır',
  passwordTooWeak: 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir',
  passwordsNotMatch: 'Şifreler eşleşmiyor',
  minLength: 'En az {min} karakter olmalıdır',
  maxLength: 'En fazla {max} karakter olabilir',
  invalidFormat: 'Geçersiz format',
  phoneNumber: 'Geçerli bir telefon numarası girin',
  url: 'Geçerli bir URL girin',
};

// Validation rule builders
export const createValidationRules = {
  required: (message?: string): ValidationRule => ({
    required: message || validationMessages.required,
  }),

  email: (message?: string): ValidationRule => ({
    required: validationMessages.required,
    pattern: {
      value: validationPatterns.email,
      message: message || validationMessages.email,
    },
  }),

  username: (minLength = 3, maxLength = 50): ValidationRule => ({
    required: validationMessages.required,
    minLength: {
      value: minLength,
      message: validationMessages.minLength.replace('{min}', minLength.toString()),
    },
    maxLength: {
      value: maxLength,
      message: validationMessages.maxLength.replace('{max}', maxLength.toString()),
    },
    pattern: {
      value: validationPatterns.username,
      message: validationMessages.username,
    },
  }),

  password: (minLength = 8, requireStrong = true): ValidationRule => ({
    required: validationMessages.required,
    minLength: {
      value: minLength,
      message: validationMessages.passwordTooShort.replace('{min}', minLength.toString()),
    },
    pattern: requireStrong
      ? {
          value: validationPatterns.strongPassword,
          message: 'Şifre en az bir küçük harf, bir büyük harf, bir rakam ve bir özel karakter içermelidir',
        }
      : {
          value: validationPatterns.mediumPassword,
          message: validationMessages.passwordTooWeak,
        },
  }),

  confirmPassword: (passwordValue: string): ValidationRule => ({
    required: validationMessages.required,
    validate: (value: string) =>
      value === passwordValue || validationMessages.passwordsNotMatch,
  }),

  phoneNumber: (message?: string): ValidationRule => ({
    pattern: {
      value: validationPatterns.phoneNumber,
      message: message || validationMessages.phoneNumber,
    },
  }),

  url: (message?: string): ValidationRule => ({
    pattern: {
      value: validationPatterns.url,
      message: message || validationMessages.url,
    },
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: {
      value: min,
      message: message || validationMessages.minLength.replace('{min}', min.toString()),
    },
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: {
      value: max,
      message: message || validationMessages.maxLength.replace('{max}', max.toString()),
    },
  }),

  custom: (validator: (value: any) => boolean | string): ValidationRule => ({
    validate: validator,
  }),
};

// Form validation schemas
export const validationSchemas = {
  login: {
    email: createValidationRules.email(),
    password: {
      required: validationMessages.required,
      minLength: {
        value: 6,
        message: validationMessages.passwordTooShort.replace('{min}', '6'),
      },
    },
  },

  register: {
    username: createValidationRules.username(),
    email: createValidationRules.email(),
    password: createValidationRules.password(8, false), // Medium strength for registration
    confirmPassword: (passwordValue: string) => createValidationRules.confirmPassword(passwordValue),
  },

  profile: {
    username: createValidationRules.username(),
    email: createValidationRules.email(),
    firstName: {
      ...createValidationRules.minLength(2),
      ...createValidationRules.maxLength(50),
    },
    lastName: {
      ...createValidationRules.minLength(2),
      ...createValidationRules.maxLength(50),
    },
    phoneNumber: createValidationRules.phoneNumber(),
  },

  changePassword: {
    currentPassword: createValidationRules.required(),
    newPassword: createValidationRules.password(8, true), // Strong password for change
    confirmNewPassword: (passwordValue: string) => createValidationRules.confirmPassword(passwordValue),
  },
};

// Validation helpers
export const validateField = (value: any, rules: ValidationRule): string | undefined => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return typeof rules.required === 'string' ? rules.required : validationMessages.required;
  }

  if (value && rules.minLength && value.length < rules.minLength.value) {
    return rules.minLength.message;
  }

  if (value && rules.maxLength && value.length > rules.maxLength.value) {
    return rules.maxLength.message;
  }

  if (value && rules.pattern && !rules.pattern.value.test(value)) {
    return rules.pattern.message;
  }

  if (value && rules.validate) {
    const result = rules.validate(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return validationMessages.invalidFormat;
    }
  }

  return undefined;
};

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const error = validateField(data[field], rules);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Real-time validation debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};