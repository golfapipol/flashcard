/**
 * Utility functions for the flashcard application
 */

/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Sanitize text content to prevent XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate deck name
 */
export function validateDeckName(name: string): { valid: boolean; error?: string } {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { valid: false, error: 'Deck name cannot be empty' };
  }
  
  if (trimmedName.length > 50) {
    return { valid: false, error: 'Deck name must be 50 characters or less' };
  }
  
  return { valid: true };
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}