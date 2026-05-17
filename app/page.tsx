import { fetchLondonJazzEvents, JazzEvent } from '@/lib/ticketmaster'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime(time: string | null) {
  if (!time) return null
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m}${hour >= 12 ? 'pm' : 'am'}`
}

function formatPrice(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return 'Price TBC'
  const sym = currency === 'GBP' ? '£' : currency
  if (min && max && min !== max) return `${sym}${min}–${sym}${max}`
  return `${sym}${min ?? max}`
}

function EventCard({ event }: { event: JazzEvent }) {
  return (
    <a
      href={event.ticketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-amber-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
    >
      {event.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h2 className="text-white font-semibold text-lg leading-snug">{event.title}</h2>
        <div className="text-zinc-400 text-sm space-y-1">
          <p>{event.venue}</p>
          {event.address && <p className="text-zinc-500">{event.address}</p>}
          <p className="text-amber-400">
            {formatDate(event.date)}
            {event.time && ` · ${formatTime(event.time)}`}
          </p>
        </div>
        <div className="mt-auto pt-3">
          <div className="w-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold py-2 rounded-lg text-center transition-colors">
            Get tickets ↗
          </div>
        </div>
      </div>
    </a>
  )
}

function NoApiKey() {
  return (
    <div className="text-center py-24 text-zinc-500">
      <p className="text-5xl mb-4">🎷</p>
      <p className="text-lg font-medium text-zinc-300 mb-2">Add your Ticketmaster API key to see events</p>
      <p className="text-sm">
        Set <code className="text-amber-400">TICKETMASTER_KEY</code> in{' '}
        <code className="text-amber-400">.env.local</code> and restart the server
      </p>
    </div>
  )
}

export default async function Home() {
  const hasKey =
    !!process.env.TICKETMASTER_KEY &&
    process.env.TICKETMASTER_KEY !== 'your_ticketmaster_api_key_here'

  const events = hasKey ? await fetchLondonJazzEvents() : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="text-2xl">🎷</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">London Jazz Night Finder</h1>
            <p className="text-zinc-500 text-sm">Live jazz in London — updated hourly</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {!hasKey ? (
          <NoApiKey />
        ) : events.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-lg">No jazz events found right now. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm mb-6">{events.length} upcoming events</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
