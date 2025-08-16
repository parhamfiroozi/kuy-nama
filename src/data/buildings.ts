// src/data/buildings.ts
export const buildingsGeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: "B-ERAM",
          name: "Eram Garden Residences",
          type: "Residential",
          height: 22,
          floors: 6,
          price: 78000000000,
          image: "/images/eram.jpg",
          description: "Modern apartments near Eram Garden with lush courtyards."
        },
        // Near Eram Garden
        geometry: { type: "Point", coordinates: [52.5079, 29.6349] }
      },
      {
        type: "Feature",
        properties: {
          id: "B-VAKIL",
          name: "Vakil Bazaar Lofts",
          type: "Mixed-use",
          height: 28,
          floors: 8,
          price: 92000000000,
          image: "/images/vakil.jpg",
          description: "Loft-style units steps from Vakil Bazaar."
        },
        // By Vakil Bazaar
        geometry: { type: "Point", coordinates: [52.5417, 29.6193] }
      },
      {
        type: "Feature",
        properties: {
          id: "B-QURAN",
          name: "Quran Gate Business Center",
          type: "Office",
          height: 40,
          floors: 11,
          price: 115000000000,
          image: "/images/quran.jpg",
          description: "Grade‑A offices with views towards Quran Gate."
        },
        // Near Quran Gate
        geometry: { type: "Point", coordinates: [52.5632, 29.6510] }
      }
    ]
  } as const;
  