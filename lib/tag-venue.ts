/**
 * Calls /api/ai/tag-venue and upserts results into venue_vibe_tags.
 * Use this in your ingestion pipeline after scraping a new venue.
 *
 * Prerequisites:
 *  - ANTHROPIC_API_KEY in .env.local
 *  - SUPABASE_URL + SUPABASE_ANON_KEY in .env.local (for the upsert step)
 */

export type VibeSlug =
  | 'intimate'
  | 'lively'
  | 'late-night'
  | 'cocktail-bar'
  | 'underground'
  | 'tourist-friendly'
  | 'outdoor'
  | 'family-friendly'

export async function tagVenueIfNeeded(
  venueId: string,
  description: string,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
) {
  const res = await fetch(`${baseUrl}/api/ai/tag-venue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ venueId, description }),
  })

  if (!res.ok) throw new Error(`tag-venue failed: ${res.status}`)

  const { tags } = (await res.json()) as { venueId: string; tags: VibeSlug[] }

  // Upsert into venue_vibe_tags via Supabase
  // Uncomment once SUPABASE_URL + SUPABASE_ANON_KEY are set:
  //
  // const { createClient } = await import('@supabase/supabase-js')
  // const supabase = createClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!,
  // )
  // await supabase.from('venue_vibe_tags').upsert(
  //   tags.map(tag => ({ venue_id: venueId, vibe_slug: tag })),
  //   { onConflict: 'venue_id,vibe_slug' },
  // )

  return tags
}
