/**
 * validationUtils.js
 * Centralized validation rules for forms across the application.
 */

// Password: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return regex.test(password);
};

export const getPasswordError = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must include at least one lowercase letter (a-z).';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must include at least one uppercase letter (A-Z).';
  if (!/(?=.*\d)/.test(password)) return 'Password must include at least one number (0-9).';
  if (!/(?=.*[@$!%*?&#])/.test(password)) return 'Password must include at least one special character (@, #, $, %, &, !, etc.).';
  return '';
};

// Name Fields: Alphabets and spaces only
export const validateName = (name) => {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(name);
};

// City Fields: Alphabets and spaces only
export const validateCity = (city) => {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(city);
};

// Mobile Number: Exactly 10 numeric digits
export const validateMobile = (mobile) => {
  const regex = /^\d{10}$/;
  return regex.test(mobile);
};

export const getMobileError = (mobile) => {
  if (!mobile) return 'Mobile number is required.';
  if (/\D/.test(mobile)) return 'Mobile number must contain only numeric digits.';
  if (mobile.length !== 10) return 'Mobile number must be exactly 10 digits.';
  return '';
};
