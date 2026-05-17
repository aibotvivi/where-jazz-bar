export type JazzEvent = {
  id: string
  title: string
  date: string
  time: string | null
  venue: string
  address: string | null
  priceMin: number | null
  priceMax: number | null
  currency: string
  ticketUrl: string
  image: string | null
}

export async function fetchLondonJazzEvents(): Promise<JazzEvent[]> {
  const apiKey = process.env.TICKETMASTER_KEY
  if (!apiKey || apiKey === 'your_ticketmaster_api_key_here') return []

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('city', 'London')
  url.searchParams.set('classificationName', 'jazz')
  url.searchParams.set('countryCode', 'GB')
  url.searchParams.set('size', '20')
  url.searchParams.set('sort', 'date,asc')

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) return []

  const data = await res.json()
  const events = data._embedded?.events ?? []

  return events.map((e: Record<string, unknown>) => {
    const dates = e.dates as Record<string, unknown>
    const start = dates?.start as Record<string, unknown>
    const embedded = e._embedded as Record<string, unknown>
    const venues = embedded?.venues as Record<string, unknown>[]
    const venue = venues?.[0]
    const vAddress = venue?.address as Record<string, unknown>
    const priceRanges = e.priceRanges as Record<string, unknown>[]
    const price = priceRanges?.[0]
    const images = e.images as Record<string, unknown>[]

    return {
      id: e.id as string,
      title: e.name as string,
      date: start?.localDate as string,
      time: (start?.localTime as string) ?? null,
      venue: venue?.name as string,
      address: (vAddress?.line1 as string) ?? null,
      priceMin: (price?.min as number) ?? null,
      priceMax: (price?.max as number) ?? null,
      currency: (price?.currency as string) ?? 'GBP',
      ticketUrl: e.url as string,
      image: (images?.[0]?.url as string) ?? null,
    }
  })
}
