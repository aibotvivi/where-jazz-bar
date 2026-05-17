import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const VIBE_SLUGS = [
  'intimate',
  'lively',
  'late-night',
  'cocktail-bar',
  'underground',
  'tourist-friendly',
  'outdoor',
  'family-friendly',
] as const

type VibeSlug = typeof VIBE_SLUGS[number]

export async function POST(req: NextRequest) {
  try {
    const { venueId, description } = await req.json() as { venueId: string; description: string }

    if (!description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    const client = new Anthropic()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: 'Return only valid JSON. No explanation or surrounding text.',
      messages: [
        {
          role: 'user',
          content: `Given this jazz venue description, return a JSON object with a "tags" array containing only the applicable vibe tags from this list: ${VIBE_SLUGS.join(', ')}.\n\nDescription: ${description}`,
        },
      ],
    })

    const raw = response.content.find(b => b.type === 'text')?.text ?? '{}'
    const text = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(text) as { tags: VibeSlug[] }

    return NextResponse.json({ venueId, tags: parsed.tags ?? [] })
  } catch (err) {
    console.error('[tag-venue]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
