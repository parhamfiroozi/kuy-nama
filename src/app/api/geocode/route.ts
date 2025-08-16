import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    if (!q) return NextResponse.json({ results: [] })

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '5')

    const r = await fetch(url.toString(), {
      headers: { 'User-Agent': 'kuy-nama/1.0 (demo)' },
      // mode: 'cors'  // not needed server-side, but harmless
    })
    if (!r.ok) return NextResponse.json({ results: [] }, { status: 200 })

    const ct = r.headers.get('content-type') || ''
    const raw = await r.text()
    const data = ct.includes('application/json') ? JSON.parse(raw) : []

    const results = (Array.isArray(data) ? data : []).map((d: any) => ({
      name: d.display_name,
      lon: parseFloat(d.lon),
      lat: parseFloat(d.lat),
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[geocode] error', err)
    return NextResponse.json({ results: [] })
  }
}
