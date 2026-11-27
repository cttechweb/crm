export interface PhoneValidationResult {
  isValid: boolean;
  message?: string;
  type?: 'mobile' | 'landline' | 'toll-free' | 'general';
}

/**
 * Validates international and UAE phone/mobile numbers with comprehensive
 * country-specific rules and ITU-T E.164 standards.
 */
export function validateCustomerPhone(
  val: string,
  countryCode: string = '+971',
  isRequired: boolean = false
): PhoneValidationResult {
  const trimmed = (val || '').trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, message: 'Phone / mobile number is required.' };
    }
    return { isValid: true };
  }

  // Check character set: only numbers, spaces, hyphens, and parentheses
  if (!/^[0-9\s\-()+]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: 'Only numbers, spaces, and hyphens are allowed.',
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 0) {
    return { isValid: false, message: 'Please enter a valid phone number.' };
  }

  // ─────────────────────────────────────────────────────────────
  // 1. UNITED ARAB EMIRATES (+971)
  // ─────────────────────────────────────────────────────────────
  if (countryCode === '+971') {
    // UAE Mobile with leading 0 (e.g. 050, 052, 054, 055, 056, 058) -> 10 digits
    if (/^05[024568]/.test(digits) || digits.startsWith('05')) {
      if (digits.length !== 10) {
        return {
          isValid: false,
          message: `UAE mobile with '0' must be exactly 10 digits (e.g. 050 123 4567). Currently: ${digits.length} digits.`,
          type: 'mobile',
        };
      }
      return { isValid: true, type: 'mobile' };
    }

    // UAE Mobile without leading 0 (e.g. 50, 52, 54, 55, 56, 58) -> 9 digits
    if (/^5[024568]/.test(digits) || digits.startsWith('5')) {
      if (digits.length !== 9) {
        return {
          isValid: false,
          message: `UAE mobile must be exactly 9 digits (e.g. 50 123 4567). Currently: ${digits.length} digits.`,
          type: 'mobile',
        };
      }
      return { isValid: true, type: 'mobile' };
    }

    // UAE Landline with leading 0: 02 (Abu Dhabi), 03 (Al Ain), 04 (Dubai), 06 (Sharjah/Ajman), 07 (RAK), 09 (Fujairah) -> 9 digits
    if (/^0[234679]/.test(digits)) {
      if (digits.length !== 9) {
        return {
          isValid: false,
          message: `UAE landline with '0' must be exactly 9 digits (e.g. 02 123 4567 or 04 123 4567). Currently: ${digits.length} digits.`,
          type: 'landline',
        };
      }
      return { isValid: true, type: 'landline' };
    }

    // UAE Landline without leading 0: 2 (Abu Dhabi), 3 (Al Ain), 4 (Dubai), 6 (Sharjah/Ajman), 7 (RAK), 9 (Fujairah) -> 8 digits
    if (/^[234679]/.test(digits)) {
      if (digits.length !== 8) {
        return {
          isValid: false,
          message: `UAE landline must be exactly 8 digits (e.g. 2 123 4567 or 4 123 4567). Currently: ${digits.length} digits.`,
          type: 'landline',
        };
      }
      return { isValid: true, type: 'landline' };
    }

    // UAE Toll-free / Corporate: 800 or 600 or 200 (7 to 9 digits)
    if (/^(800|600|200)/.test(digits)) {
      if (digits.length < 7 || digits.length > 9) {
        return {
          isValid: false,
          message: `UAE toll-free number must be 7-9 digits (e.g. 800 1234). Currently: ${digits.length} digits.`,
          type: 'toll-free',
        };
      }
      return { isValid: true, type: 'toll-free' };
    }

    // If it doesn't match valid UAE prefix rules:
    return {
      isValid: false,
      message: 'Invalid UAE number. Mobile starts with 5 (9 digits, e.g. 50 123 4567) or Landline with 2-9 (8 digits, e.g. 2 123 4567).',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SAUDI ARABIA (+966)
  // ─────────────────────────────────────────────────────────────
  if (countryCode === '+966') {
    if (digits.startsWith('05')) {
      if (digits.length !== 10) {
        return { isValid: false, message: 'Saudi mobile with 0 must be 10 digits (e.g. 050 123 4567).' };
      }
      return { isValid: true, type: 'mobile' };
    }
    if (digits.startsWith('5')) {
      if (digits.length !== 9) {
        return { isValid: false, message: 'Saudi mobile must be 9 digits (e.g. 50 123 4567).' };
      }
      return { isValid: true, type: 'mobile' };
    }
    if (digits.length < 8 || digits.length > 10) {
      return { isValid: false, message: 'Saudi phone number must be 8-10 digits.' };
    }
    return { isValid: true, type: 'general' };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. QATAR (+974), OMAN (+968), KUWAIT (+965), BAHRAIN (+973)
  // ─────────────────────────────────────────────────────────────
  if (['+974', '+968', '+965', '+973'].includes(countryCode)) {
    if (digits.length !== 8) {
      return { isValid: false, message: `Phone number for ${countryCode} must be 8 digits.` };
    }
    return { isValid: true, type: 'general' };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. INDIA (+91)
  // ─────────────────────────────────────────────────────────────
  if (countryCode === '+91') {
    if (digits.length !== 10) {
      return { isValid: false, message: `Indian mobile number must be 10 digits. Currently: ${digits.length} digits.` };
    }
    if (!/^[6-9]/.test(digits)) {
      return { isValid: false, message: 'Indian mobile number must start with 6, 7, 8, or 9.' };
    }
    return { isValid: true, type: 'mobile' };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. UNITED STATES / CANADA (+1)
  // ─────────────────────────────────────────────────────────────
  if (countryCode === '+1') {
    if (digits.length !== 10) {
      return { isValid: false, message: `US/Canada phone number must be 10 digits (e.g. 202 555 0123). Currently: ${digits.length} digits.` };
    }
    return { isValid: true, type: 'general' };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. UNITED KINGDOM (+44)
  // ─────────────────────────────────────────────────────────────
  if (countryCode === '+44') {
    if (digits.length < 9 || digits.length > 11) {
      return { isValid: false, message: 'UK phone number must be 9-11 digits (e.g. 7911 123456).' };
    }
    return { isValid: true, type: 'general' };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. GENERAL INTERNATIONAL (ITU-T E.164: 7 to 15 digits)
  // ─────────────────────────────────────────────────────────────
  if (digits.length < 7) {
    return { isValid: false, message: 'Contact number is too short (min 7 digits required).' };
  }
  if (digits.length > 15) {
    return { isValid: false, message: 'Contact number cannot exceed 15 digits.' };
  }

  return { isValid: true, type: 'general' };
}

