import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('venue_id, name, city_area, region, website')
    .limit(20)
console.log('venues:', venues)
console.log('error:', error)
  if (error) {
    return <main>Error loading venues: {error.message}</main>
  }

  return (
    <main style={{ padding: '40px' }}>
      <h1>Scene Finder</h1>
      <p>UK lifestyle venues and events.</p>

      <h2>Venues</h2>

      <ul>
        {venues?.map((venue) => (
          <li key={venue.venue_id}>
            <strong>{venue.name}</strong> — {venue.city_area}, {venue.region}
          </li>
        ))}
      </ul>
    </main>
  )
}