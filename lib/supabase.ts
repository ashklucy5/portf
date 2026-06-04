// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 1. Initialize the Supabase Client (Browser-safe)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Helper: Parse JSON strings from Supabase back to objects/arrays
 */
const parseSupabaseValue = (value: string | null): any => {
  if (!value) return value;
  
  // Try to parse if it looks like JSON (starts with [ or {)
  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
    try {
      return JSON.parse(value);
    } catch {
      // If parsing fails, return original string
      return value;
    }
  }
  return value;
};

/**
 * 2. Fetch Content from Supabase
 * Transforms flat database rows into a nested object structure
 * and parses JSON strings back to objects/arrays.
 */
export async function getContent(locale: 'en' | 'zh', section?: string) {
  try {
    let query = supabase
      .from('content')
      .select('section, key_path, value')
      .eq('locale', locale)

    if (section) {
      query = query.eq('section', section)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching content:', error)
      return {}
    }

    // Transform flat rows -> nested object + parse JSON values
    // Input:  [{ section: 'hero', key_path: 'title', value: 'Hi' }]
    // Output: { hero: { title: 'Hi' } }
    const result: Record<string, any> = {}

    for (const row of data || []) {
      result[row.section] = result[row.section] || {}
      
      const keys = row.key_path.split('.')
      let target = result[row.section]

      // Navigate/create nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        target[keys[i]] = target[keys[i]] || {}
        target = target[keys[i]]
      }
      
      // ✅ Parse JSON strings to objects/arrays
      target[keys[keys.length - 1]] = parseSupabaseValue(row.value)
    }

    return result
  } catch (error) {
    console.error('Failed to load content:', error)
    return {}
  }
}

/**
 * 3. Save/Update Content
 * Upserts data directly into the Supabase table.
 * Automatically stringifies objects/arrays for storage.
 */
export async function saveContent(
  locale: 'en' | 'zh',
  section: string,
  updates: Record<string, any>
) {
  // Flatten updates into database rows
  const rowsToUpsert = Object.entries(updates).map(([key_path, value]) => ({
    locale,
    section,
    key_path,
    // ✅ Stringify objects/arrays for storage
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('content')
    .upsert(rowsToUpsert, {
      onConflict: 'locale,section,key_path' // Updates if row exists, inserts if not
    })

  if (error) {
    console.error('Error saving content:', error)
    throw error
  }

  return { success: true }
}