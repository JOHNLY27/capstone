export interface Province {
  name: string;
  cities: City[];
}

export interface City {
  name: string;
  barangays: string[];
}

export const philippinesData: Province[] = [
  {
    name: "Metro Manila",
    cities: [
      {
        name: "Manila",
        barangays: ["Ermita", "Intramuros", "Malate", "Paco", "Pandacan", "Port Area", "Quiapo", "Sampaloc", "San Miguel", "San Nicolas", "Santa Ana", "Santa Cruz", "Tondo"],
      },
      {
        name: "Quezon City",
        barangays: ["Batasan Hills", "Commonwealth", "Cubao", "Diliman", "Fairview", "Kamuning", "Libis", "Novaliches", "Project 4", "Tandang Sora", "UP Campus"],
      },
      {
        name: "Makati",
        barangays: ["Bel-Air", "Cembo", "Dasmarinas", "Forbes Park", "Guadalupe Nuevo", "Guadalupe Viejo", "Magallanes", "Poblacion", "Rockwell", "Salcedo", "San Lorenzo", "Urdaneta"],
      },
      {
        name: "Pasig",
        barangays: ["Bagong Ilog", "Kapitolyo", "Manggahan", "Maybunga", "Oranbo", "Pinagbuhatan", "Rosario", "San Joaquin", "Ugong"],
      },
      {
        name: "Taguig",
        barangays: ["Bagumbayan", "Bambang", "BGC", "Fort Bonifacio", "Hagonoy", "Ibayo-Tipas", "Ligid-Tipas", "Lower Bicutan", "Maharlika Village", "Signal Village", "Upper Bicutan", "Western Bicutan"],
      },
      {
        name: "Mandaluyong",
        barangays: ["Addition Hills", "Bagong Silang", "Barangka", "Buayang Bato", "Highway Hills", "Mauway", "Namayan", "Plainview", "Pleasant Hills", "Poblacion", "Vergara", "Wack-Wack"],
      },
      {
        name: "Parañaque",
        barangays: ["BF Homes", "Baclaran", "Don Bosco", "Don Galo", "La Huerta", "Marcelo Green", "Merville", "Moonwalk", "San Antonio", "San Dionisio", "Tambo", "Vitalez"],
      },
      {
        name: "Las Piñas",
        barangays: ["Almanza", "BF International", "Daniel Fajardo", "Elias Aldana", "Manuyo", "Pamplona", "Pulanlupa", "Talon", "Zapote"],
      },
      {
        name: "Muntinlupa",
        barangays: ["Alabang", "Ayala Alabang", "Bayanan", "Buli", "Cupang", "Poblacion", "Putatan", "Sucat", "Tunasan"],
      },
    ],
  },
  {
    name: "Cavite",
    cities: [
      {
        name: "Bacoor",
        barangays: ["Alima", "Aniban", "Banalo", "Digman", "Habay", "Maliksi", "Molino", "Niog", "Panapaan", "Queens Row", "San Nicolas", "Tabing Dagat", "Talaba"],
      },
      {
        name: "Dasmariñas",
        barangays: ["Burol", "Datu Esmael", "Emmanuel Bergado", "Langkaan", "Paliparan", "Salawag", "Sampaloc", "San Agustin", "San Andres", "Victoria Reyes"],
      },
      {
        name: "Imus",
        barangays: ["Alapan", "Anabu", "Bagong Silang", "Bayan Luma", "Bucandala", "Magdalo", "Malagasang", "Medicion", "Poblacion", "Tanzang Luma"],
      },
      {
        name: "Cavite City",
        barangays: ["Caridad", "Dalahican", "San Antonio", "San Roque", "Santa Cruz"],
      },
      {
        name: "Tagaytay",
        barangays: ["Bagong Tubig", "Calabuso", "Guinhawa", "Kaybagal", "Maitim", "Maharlika", "Neogan", "Sungay", "Tolentino"],
      },
    ],
  },
  {
    name: "Cebu",
    cities: [
      {
        name: "Cebu City",
        barangays: ["Apas", "Banilad", "Basak San Nicolas", "Busay", "Capitol Site", "Fuente Osmeña", "Guadalupe", "Labangon", "Lahug", "Mabolo", "Pardo", "Pit-os", "Talamban", "Tisa"],
      },
      {
        name: "Mandaue",
        barangays: ["Alang-Alang", "Banilad", "Basak", "Cabancalan", "Canduman", "Centro", "Guizo", "Jagobiao", "Labogon", "Mantuyong", "Tipolo", "Umapad"],
      },
      {
        name: "Lapu-Lapu",
        barangays: ["Agus", "Babag", "Bankal", "Basak", "Buaya", "Canjulao", "Caubian", "Gun-ob", "Ibo", "Looc", "Mactan", "Maribago", "Pajo", "Poblacion", "Pusok", "Soong"],
      },
      {
        name: "Talisay",
        barangays: ["Bulacao", "Camp IV", "Cansojong", "Dumlog", "Jaclupan", "Lagtang", "Lawaan", "Linao", "Mohon", "Poblacion", "Tabunoc", "Tangke"],
      },
    ],
  },
  {
    name: "Davao del Sur",
    cities: [
      {
        name: "Davao City",
        barangays: ["Agdao", "Bankerohan", "Buhangin", "Bunawan", "Calinan", "Catalunan Grande", "Lanang", "Ma-a", "Matina", "Poblacion", "Panacan", "Sasa", "Talomo", "Toril", "Tugbok"],
      },
      {
        name: "Digos",
        barangays: ["Aplaya", "Balabag", "Colorado", "Dawis", "Dulangan", "Goma", "Igpit", "Kiagot", "Lungag", "Mahayahay", "Rizal", "San Jose", "Sinawilan", "Tres de Mayo"],
      },
    ],
  },
  {
    name: "Laguna",
    cities: [
      {
        name: "Santa Rosa",
        barangays: ["Aplaya", "Balibago", "Caingin", "Dila", "Don Jose", "Ibaba", "Labas", "Macabling", "Malitlit", "Malusak", "Market Area", "Pook", "Pulong Santa Cruz", "Sinalhan", "Tagapo"],
      },
      {
        name: "Biñan",
        barangays: ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz", "Ganado", "Langkiwa", "Loma", "Malaban", "Malamig", "Platero", "Poblacion", "San Antonio", "San Francisco", "San Jose", "San Vicente", "Santo Domingo", "Santo Niño", "Santo Tomas", "Soro-Soro", "Timbao", "Tubigan", "Zapote"],
      },
      {
        name: "Calamba",
        barangays: ["Bagong Kalsada", "Banadero", "Banlic", "Barandal", "Batino", "Bubuyan", "Bucal", "Bunggo", "Burol", "Camaligan", "Canlubang", "Halang", "Hornalan", "Kay-Anlog", "La Mesa", "Laguerte", "Lawa", "Lecheria", "Lingga", "Looc", "Mabato", "Majada Labas", "Makiling", "Mapagong", "Masili", "Maunong", "Mayapa", "Milagrosa", "Paciano Rizal", "Palingon", "Palo-Alto", "Pansol", "Parian", "Prinza", "Punta", "Puting Lupa", "Real", "Saimsim", "Sampiruhan", "San Cristobal", "San Jose", "San Juan", "Sirang Lupa", "Sucol", "Turbina", "Ulango", "Uwisan"],
      },
      {
        name: "San Pedro",
        barangays: ["Bagong Silang", "Calendola", "Chrysanthemum", "Cuyab", "Estrella", "G.S.I.S.", "Landayan", "Langgam", "Laram", "Magsaysay", "Maharlika", "Narra", "Nueva", "Pacita", "Poblacion", "Riverside", "Rosario", "Sampaguita Village", "San Antonio", "San Lorenzo Ruiz", "San Roque", "San Vicente", "Santo Niño", "United Bayanihan", "United Better Living"],
      },
    ],
  },
  {
    name: "Bulacan",
    cities: [
      {
        name: "Malolos",
        barangays: ["Anilao", "Atlag", "Babatnin", "Bagna", "Bagong Bayan", "Balayong", "Balite", "Bangkal", "Barihan", "Bulihan", "Bungahan", "Caingin", "Calero", "Caliligawan", "Calumpang", "Canalate", "Caniogan", "Catmon", "Cofradia", "Dakila", "Guinhawa", "Ligas", "Liyang", "Longos", "Look", "Lugam", "Mabolo", "Mambog", "Masile", "Matimbo", "Mojon", "Namayan", "Niugan", "Pamarawan", "Panasahan", "Pinagbakahan", "San Agustin", "San Gabriel", "San Juan", "San Pablo", "San Vicente", "Santiago", "Santisima Trinidad", "Santo Cristo", "Santo Niño", "Santo Rosario", "Santor", "Sumapang Bata", "Sumapang Matanda", "Taal", "Tikay"],
      },
      {
        name: "Meycauayan",
        barangays: ["Bagbaguin", "Bahay Pare", "Bancal", "Banga", "Bayugo", "Bisig", "Calvario", "Camalig", "Hulo", "Iba", "Langka", "Lias", "Libtong", "Liputan", "Malhacan", "Pandayan", "Pantoc", "Perez", "Poblacion", "Saluysoy", "St. Francis", "Tugatog", "Ubihan", "Zamora"],
      },
      {
        name: "San Jose del Monte",
        barangays: ["Assumption", "Bagong Buhay", "Citrus", "Ciudad Real", "Dulong Bayan", "Emerald", "Fatima", "Francisco Homes", "Gaya-Gaya", "Graceville", "Gumaoc", "Kaybanban", "Kaypian", "Lawang Pari", "Maharlika", "Minuyan", "Muzon", "Poblacion", "San Isidro", "San Manuel", "San Martin", "San Pedro", "San Rafael", "San Roque", "Santa Cruz", "Santo Cristo", "Sapang Palay", "Tungkong Mangga"],
      },
    ],
  },
  {
    name: "Agusan del Norte",
    cities: [
      {
        name: "Butuan City",
        barangays: [
          "Agao", "Agusan Pequeño", "Ambago", "Amparo", "Ampayon", "Anticala", "Antongalon", "Aupagan", "Baan KM 3", "Baan Riverside", "Babag", "Bading", "Bancasi", "Banza", "Baobaoan", "Basag", "Bayanihan", "Bilay", "Bitan-agan", "Bit-os", "Boding", "Bugabus", "Buhangin", "Bunga", "Cabcabon", "Camayahan", "Dagohoy", "Dankias", "De Oro", "Diego Silang", "Doongan", "Dulag", "Dumalagan", "Florida", "Golden Ribbon", "Guingona", "Holy Redeemer", "Humabon", "Iguig", "Imadejas", "Kinamlutan", "Lapu-lapu", "Lema", "Leon Kilat", "Libertad", "Limaha", "Los Angeles", "Lumbocan", "Maguinda", "Mahay", "Mahogany", "Maibu", "Mandamo", "Manila de Bugabus", "Maon", "Masao", "Maug", "New Society Village", "Nong-nong", "Obrero", "Ong Yiu", "Pagatpatan", "Pangabugan", "Pigdaulan", "Pinamanculan", "Rajah Soliman", "San Ignacio", "San Mateo", "San Vicente", "Sikatuna", "Silongan", "Sumile", "Sumilihon", "Tagabaca", "Taguibo", "Taligaman", "Tandang Sora", "Tiniwisan", "Tungao", "Urduja", "Villa Kananga"
        ]
      }
    ]
  }
];

export function getProvinces(): string[] {
  return philippinesData.map((p) => p.name);
}

export function getCities(provinceName: string): string[] {
  const province = philippinesData.find((p) => p.name === provinceName);
  return province ? province.cities.map((c) => c.name) : [];
}

export function getBarangays(provinceName: string, cityName: string): string[] {
  const province = philippinesData.find((p) => p.name === provinceName);
  if (!province) return [];
  const city = province.cities.find((c) => c.name === cityName);
  return city ? city.barangays : [];
}
