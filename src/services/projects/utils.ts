
/**
 * Check if a string is a valid UUID
 */
export const isValidUUID = (str: string | null | undefined): boolean => {
  if (!str) return false;
  
  // If it's a sample data ID (starting with 'type-' or 'cat-'), return true
  if (str.startsWith('type-') || str.startsWith('cat-')) {
    return true;  // Consider sample data IDs as valid
  }
  
  // Regular UUID validation (standard UUID v4 format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
