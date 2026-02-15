import { v4 as uuidv4 } from 'uuid';
import { getSlug } from './db';

export async function generateSlug(name: string): Promise<string> {
  // Format: "Felix Mueller" → "felix-mueller"
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug || baseSlug.length === 0) {
    return generateRandomSlug();
  }

  // Check if available
  const existing = await getSlug(baseSlug);
  if (!existing) {
    return baseSlug;
  }

  // Collision: append unique suffix (first 4 chars of UUID)
  const suffix = uuidv4().split('-')[0].substring(0, 4);
  return `${baseSlug}-${suffix}`;
}

export function generateRandomSlug(): string {
  // Fallback if name is empty
  return `user-${uuidv4().split('-')[0].substring(0, 6)}`;
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const existing = await getSlug(slug);
  return !existing;
}

export async function validateSlugFormat(slug: string): Promise<boolean> {
  // Only lowercase letters, numbers, hyphens, 3-50 chars
  return /^[a-z0-9-]{3,50}$/.test(slug);
}
