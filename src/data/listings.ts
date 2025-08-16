export type ListingType = 'sale' | 'rent'

export interface ListingFeatureProps {
  id: string
  title: string
  listingType: ListingType
  price: number
  currency: 'IRR'
  beds: number
  baths: number
  area_m2: number
  history: { date: string; price: number }[]
}

export const listingsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'S-1001',
        title: 'Apartment near Zand Blvd',
        listingType: 'sale',
        price: 8200000000,
        currency: 'IRR',
        beds: 2, baths: 1, area_m2: 85,
        history: [
          { date: '2025-02-01', price: 7800000000 },
          { date: '2025-05-01', price: 8000000000 },
          { date: '2025-08-01', price: 8200000000 },
        ],
      } as ListingFeatureProps,
      geometry: { type: 'Point', coordinates: [52.5325, 29.6167] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'R-2203',
        title: 'Flat by Eram Garden',
        listingType: 'rent',
        price: 18000000,
        currency: 'IRR',
        beds: 1, baths: 1, area_m2: 60,
        history: [
          { date: '2025-01-01', price: 15000000 },
          { date: '2025-04-01', price: 17000000 },
          { date: '2025-07-01', price: 18000000 },
        ],
      } as ListingFeatureProps,
      geometry: { type: 'Point', coordinates: [52.5079, 29.6347] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'S-1107',
        title: 'House near Quran Gate',
        listingType: 'sale',
        price: 12500000000,
        currency: 'IRR',
        beds: 3, baths: 2, area_m2: 140,
        history: [
          { date: '2025-03-01', price: 11800000000 },
          { date: '2025-06-01', price: 12200000000 },
          { date: '2025-08-01', price: 12500000000 },
        ],
      } as ListingFeatureProps,
      geometry: { type: 'Point', coordinates: [52.5636, 29.6501] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'R-2309',
        title: 'Studio near Vakil Bazaar',
        listingType: 'rent',
        price: 12000000,
        currency: 'IRR',
        beds: 0, baths: 1, area_m2: 40,
        history: [
          { date: '2025-02-01', price: 10000000 },
          { date: '2025-05-01', price: 11000000 },
          { date: '2025-08-01', price: 12000000 },
        ],
      } as ListingFeatureProps,
      geometry: { type: 'Point', coordinates: [52.5449, 29.6196] },
    },
  ],
}
