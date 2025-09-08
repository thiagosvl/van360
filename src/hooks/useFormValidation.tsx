import { useState } from "react";

interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return "Este campo é obrigatório";
    }

    if (value && rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Email inválido";
      }
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      return `Mínimo de ${rule.minLength} caracteres`;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      return "Formato inválido";
    }

    if (value && rule.custom) {
      return rule.custom(value);
    }

    return null;
  };

  const validate = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === null;
  };

  const validateAll = (data: Record<string, string>) => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, data[name] || "");
      newErrors[name] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearErrors = () => setErrors({});

  return { errors, validate, validateAll, clearErrors };
};