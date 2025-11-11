/**
 * Subestaciones reales del Sistema Interconectado Nacional (SIN) de Colombia
 * Fuente: XM - Operador del Mercado Energético Colombiano
 * 
 * STN: Sistema de Transmisión Nacional (≥220 kV)
 * STR: Sistema de Transmisión Regional (<220 kV)
 */

export interface Substation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  voltage: number; // kV
  type: 'STN' | 'STR';
  operator: string;
  department: string;
  capacity: number; // MVA
}

export interface TransmissionLine {
  id: string;
  from: string;
  to: string;
  voltage: number; // kV
  length: number; // km
  capacity: number; // MVA
}

export const colombiaSubstations: Substation[] = [
  // CUNDINAMARCA Y BOGOTÁ (Centro del país)
  {
    id: 'sub_bacata',
    name: 'Bacatá',
    lat: 4.7110,
    lng: -74.0721,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Bogotá',
    capacity: 600
  },
  {
    id: 'sub_soacha',
    name: 'Soacha',
    lat: 4.5793,
    lng: -74.2163,
    voltage: 230,
    type: 'STN',
    operator: 'CODENSA',
    department: 'Cundinamarca',
    capacity: 450
  },
  {
    id: 'sub_tunal',
    name: 'Tunal',
    lat: 4.5759,
    lng: -74.1261,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Bogotá',
    capacity: 300
  },
  {
    id: 'sub_usme',
    name: 'Usme',
    lat: 4.4806,
    lng: -74.1261,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Bogotá',
    capacity: 250
  },
  {
    id: 'sub_salitre',
    name: 'Salitre',
    lat: 4.6574,
    lng: -74.0990,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Bogotá',
    capacity: 280
  },
  {
    id: 'sub_techo',
    name: 'Techo',
    lat: 4.6709,
    lng: -74.1476,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Bogotá',
    capacity: 200
  },
  {
    id: 'sub_fontibon',
    name: 'Fontibón',
    lat: 4.6809,
    lng: -74.1426,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Bogotá',
    capacity: 220
  },
  {
    id: 'sub_facatativa',
    name: 'Facatativá',
    lat: 4.8139,
    lng: -74.3547,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Cundinamarca',
    capacity: 180
  },
  {
    id: 'sub_zipaquira',
    name: 'Zipaquirá',
    lat: 5.0219,
    lng: -74.0039,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Cundinamarca',
    capacity: 150
  },
  {
    id: 'sub_la_calera',
    name: 'La Calera',
    lat: 4.7235,
    lng: -73.9686,
    voltage: 115,
    type: 'STR',
    operator: 'CODENSA',
    department: 'Cundinamarca',
    capacity: 120
  },
  
  // ANTIOQUIA (Noroeste)
  {
    id: 'sub_medellin',
    name: 'Medellín',
    lat: 6.2442,
    lng: -75.5812,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Antioquia',
    capacity: 800
  },
  {
    id: 'sub_guatape',
    name: 'Guatapé',
    lat: 6.2319,
    lng: -75.1619,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Antioquia',
    capacity: 900
  },
  {
    id: 'sub_san_rafael',
    name: 'San Rafael',
    lat: 6.2769,
    lng: -75.0239,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Antioquia',
    capacity: 750
  },
  {
    id: 'sub_porce',
    name: 'Porce',
    lat: 6.8919,
    lng: -75.1139,
    voltage: 230,
    type: 'STN',
    operator: 'EPM',
    department: 'Antioquia',
    capacity: 700
  },
  {
    id: 'sub_cerromatoso',
    name: 'Cerromatoso',
    lat: 7.9869,
    lng: -75.7019,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Córdoba',
    capacity: 500
  },
  {
    id: 'sub_uraba',
    name: 'Urabá',
    lat: 7.8819,
    lng: -76.6419,
    voltage: 110,
    type: 'STR',
    operator: 'EPM',
    department: 'Antioquia',
    capacity: 180
  },
  
  // VALLE DEL CAUCA (Suroeste)
  {
    id: 'sub_cali',
    name: 'Cali',
    lat: 3.4516,
    lng: -76.5320,
    voltage: 230,
    type: 'STN',
    operator: 'EPSA',
    department: 'Valle del Cauca',
    capacity: 700
  },
  {
    id: 'sub_yumbo',
    name: 'Yumbo',
    lat: 3.5819,
    lng: -76.4989,
    voltage: 230,
    type: 'STN',
    operator: 'EPSA',
    department: 'Valle del Cauca',
    capacity: 650
  },
  {
    id: 'sub_buenaventura',
    name: 'Buenaventura',
    lat: 3.8801,
    lng: -77.0318,
    voltage: 115,
    type: 'STR',
    operator: 'EPSA',
    department: 'Valle del Cauca',
    capacity: 250
  },
  {
    id: 'sub_palmira',
    name: 'Palmira',
    lat: 3.5394,
    lng: -76.3036,
    voltage: 115,
    type: 'STR',
    operator: 'EPSA',
    department: 'Valle del Cauca',
    capacity: 200
  },
  {
    id: 'sub_tulua',
    name: 'Tuluá',
    lat: 4.0847,
    lng: -76.1953,
    voltage: 115,
    type: 'STR',
    operator: 'EPSA',
    department: 'Valle del Cauca',
    capacity: 180
  },
  
  // ATLÁNTICO Y BOLÍVAR (Costa Caribe)
  {
    id: 'sub_barranquilla',
    name: 'Barranquilla',
    lat: 10.9685,
    lng: -74.7813,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Atlántico',
    capacity: 650
  },
  {
    id: 'sub_cartagena',
    name: 'Cartagena',
    lat: 10.3910,
    lng: -75.4794,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Bolívar',
    capacity: 700
  },
  {
    id: 'sub_termobarranquilla',
    name: 'Termobarranquilla',
    lat: 10.9185,
    lng: -74.8513,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Atlántico',
    capacity: 800
  },
  {
    id: 'sub_termocartagena',
    name: 'Termocartagena',
    lat: 10.3410,
    lng: -75.5094,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Bolívar',
    capacity: 750
  },
  {
    id: 'sub_sabanalarga',
    name: 'Sabanalarga',
    lat: 10.6386,
    lng: -74.9219,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Atlántico',
    capacity: 150
  },
  
  // SANTANDER (Noreste)
  {
    id: 'sub_bucaramanga',
    name: 'Bucaramanga',
    lat: 7.1193,
    lng: -73.1227,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Santander',
    capacity: 600
  },
  {
    id: 'sub_barrancabermeja',
    name: 'Barrancabermeja',
    lat: 7.0653,
    lng: -73.8547,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Santander',
    capacity: 700
  },
  {
    id: 'sub_san_mateo',
    name: 'San Mateo',
    lat: 7.1893,
    lng: -73.0527,
    voltage: 115,
    type: 'STR',
    operator: 'ESSA',
    department: 'Santander',
    capacity: 250
  },
  {
    id: 'sub_palos',
    name: 'Palos',
    lat: 7.0193,
    lng: -73.2227,
    voltage: 115,
    type: 'STR',
    operator: 'ESSA',
    department: 'Santander',
    capacity: 200
  },
  
  // CESAR Y MAGDALENA (Norte)
  {
    id: 'sub_valledupar',
    name: 'Valledupar',
    lat: 10.4631,
    lng: -73.2532,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Cesar',
    capacity: 500
  },
  {
    id: 'sub_copey',
    name: 'Copey',
    lat: 10.1531,
    lng: -73.9632,
    voltage: 230,
    type: 'STN',
    operator: 'ELECTRICARIBE',
    department: 'Cesar',
    capacity: 450
  },
  {
    id: 'sub_santa_marta',
    name: 'Santa Marta',
    lat: 11.2408,
    lng: -74.1990,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Magdalena',
    capacity: 250
  },
  {
    id: 'sub_cienaga',
    name: 'Ciénaga',
    lat: 11.0058,
    lng: -74.2469,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Magdalena',
    capacity: 180
  },
  
  // CAUCA Y NARIÑO (Suroeste)
  {
    id: 'sub_popayan',
    name: 'Popayán',
    lat: 2.4448,
    lng: -76.6147,
    voltage: 115,
    type: 'STR',
    operator: 'CENS',
    department: 'Cauca',
    capacity: 200
  },
  {
    id: 'sub_pasto',
    name: 'Pasto',
    lat: 1.2136,
    lng: -77.2811,
    voltage: 115,
    type: 'STR',
    operator: 'CEDENAR',
    department: 'Nariño',
    capacity: 250
  },
  {
    id: 'sub_jamondino',
    name: 'Jamondino',
    lat: 1.1836,
    lng: -77.3111,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Nariño',
    capacity: 400
  },
  {
    id: 'sub_tumaco',
    name: 'Tumaco',
    lat: 1.8067,
    lng: -78.7658,
    voltage: 110,
    type: 'STR',
    operator: 'CEDENAR',
    department: 'Nariño',
    capacity: 120
  },
  
  // TOLIMA Y HUILA (Centro-sur)
  {
    id: 'sub_ibague',
    name: 'Ibagué',
    lat: 4.4389,
    lng: -75.2322,
    voltage: 115,
    type: 'STR',
    operator: 'ENERTOLIMA',
    department: 'Tolima',
    capacity: 250
  },
  {
    id: 'sub_neiva',
    name: 'Neiva',
    lat: 2.9273,
    lng: -75.2819,
    voltage: 115,
    type: 'STR',
    operator: 'ELECTROHUILA',
    department: 'Huila',
    capacity: 220
  },
  {
    id: 'sub_betania',
    name: 'Betania',
    lat: 2.7173,
    lng: -75.1519,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Huila',
    capacity: 600
  },
  {
    id: 'sub_mirolindo',
    name: 'Mirolindo',
    lat: 2.8573,
    lng: -75.2119,
    voltage: 115,
    type: 'STR',
    operator: 'ELECTROHUILA',
    department: 'Huila',
    capacity: 180
  },
  
  // META Y LLANOS (Oriente)
  {
    id: 'sub_villavicencio',
    name: 'Villavicencio',
    lat: 4.1420,
    lng: -73.6266,
    voltage: 115,
    type: 'STR',
    operator: 'EMSA',
    department: 'Meta',
    capacity: 250
  },
  {
    id: 'sub_apiay',
    name: 'Apiay',
    lat: 4.0720,
    lng: -73.5566,
    voltage: 115,
    type: 'STR',
    operator: 'EMSA',
    department: 'Meta',
    capacity: 200
  },
  {
    id: 'sub_reforma',
    name: 'La Reforma',
    lat: 4.1920,
    lng: -73.5966,
    voltage: 115,
    type: 'STR',
    operator: 'EMSA',
    department: 'Meta',
    capacity: 180
  },
  
  // QUINDÍO Y RISARALDA (Eje Cafetero)
  {
    id: 'sub_armenia',
    name: 'Armenia',
    lat: 4.5339,
    lng: -75.6811,
    voltage: 115,
    type: 'STR',
    operator: 'EDEQ',
    department: 'Quindío',
    capacity: 200
  },
  {
    id: 'sub_pereira',
    name: 'Pereira',
    lat: 4.8133,
    lng: -75.6961,
    voltage: 115,
    type: 'STR',
    operator: 'CHEC',
    department: 'Risaralda',
    capacity: 220
  },
  {
    id: 'sub_cartago',
    name: 'Cartago',
    lat: 4.7461,
    lng: -75.9117,
    voltage: 115,
    type: 'STR',
    operator: 'CHEC',
    department: 'Valle del Cauca',
    capacity: 180
  },
  
  // CALDAS (Eje Cafetero)
  {
    id: 'sub_manizales',
    name: 'Manizales',
    lat: 5.0700,
    lng: -75.5138,
    voltage: 115,
    type: 'STR',
    operator: 'CHEC',
    department: 'Caldas',
    capacity: 200
  },
  {
    id: 'sub_la_dorada',
    name: 'La Dorada',
    lat: 5.4500,
    lng: -74.6638,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Caldas',
    capacity: 500
  },
  
  // BOYACÁ (Centro-oriente)
  {
    id: 'sub_tunja',
    name: 'Tunja',
    lat: 5.5353,
    lng: -73.3678,
    voltage: 115,
    type: 'STR',
    operator: 'EBSA',
    department: 'Boyacá',
    capacity: 180
  },
  {
    id: 'sub_sogamoso',
    name: 'Sogamoso',
    lat: 5.7147,
    lng: -72.9261,
    voltage: 115,
    type: 'STR',
    operator: 'EBSA',
    department: 'Boyacá',
    capacity: 200
  },
  {
    id: 'sub_chivor',
    name: 'Chivor',
    lat: 4.8947,
    lng: -73.3561,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'Boyacá',
    capacity: 1000
  },
  
  // NORTE DE SANTANDER (Noreste frontera)
  {
    id: 'sub_cucuta',
    name: 'Cúcuta',
    lat: 7.8939,
    lng: -72.5078,
    voltage: 230,
    type: 'STN',
    operator: 'CENS',
    department: 'Norte de Santander',
    capacity: 500
  },
  {
    id: 'sub_ocana',
    name: 'Ocaña',
    lat: 8.2439,
    lng: -73.3578,
    voltage: 110,
    type: 'STR',
    operator: 'CENS',
    department: 'Norte de Santander',
    capacity: 150
  },
  
  // CÓRDOBA (Norte)
  {
    id: 'sub_monteria',
    name: 'Montería',
    lat: 8.7479,
    lng: -75.8814,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Córdoba',
    capacity: 200
  },
  {
    id: 'sub_sahagun',
    name: 'Sahagún',
    lat: 8.9479,
    lng: -75.4414,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Córdoba',
    capacity: 150
  },
  
  // SUCRE (Norte)
  {
    id: 'sub_sincelejo',
    name: 'Sincelejo',
    lat: 9.3047,
    lng: -75.3978,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'Sucre',
    capacity: 180
  },
  
  // LA GUAJIRA (Extremo norte)
  {
    id: 'sub_riohacha',
    name: 'Riohacha',
    lat: 11.5444,
    lng: -72.9072,
    voltage: 110,
    type: 'STR',
    operator: 'ELECTRICARIBE',
    department: 'La Guajira',
    capacity: 120
  },
  {
    id: 'sub_cuestecitas',
    name: 'Cuestecitas',
    lat: 11.0644,
    lng: -72.8272,
    voltage: 230,
    type: 'STN',
    operator: 'ISA',
    department: 'La Guajira',
    capacity: 400
  },
  
  // ARAUCA (Oriente frontera)
  {
    id: 'sub_arauca',
    name: 'Arauca',
    lat: 7.0906,
    lng: -70.7619,
    voltage: 110,
    type: 'STR',
    operator: 'ENERCA',
    department: 'Arauca',
    capacity: 100
  },
  
  // CASANARE (Llanos)
  {
    id: 'sub_yopal',
    name: 'Yopal',
    lat: 5.3378,
    lng: -72.3959,
    voltage: 110,
    type: 'STR',
    operator: 'ENERCA',
    department: 'Casanare',
    capacity: 120
  },
  
  // CAQUETÁ (Sur)
  {
    id: 'sub_florencia',
    name: 'Florencia',
    lat: 1.6144,
    lng: -75.6062,
    voltage: 110,
    type: 'STR',
    operator: 'CEDELCA',
    department: 'Caquetá',
    capacity: 100
  },
  
  // PUTUMAYO (Sur frontera)
  {
    id: 'sub_mocoa',
    name: 'Mocoa',
    lat: 1.1515,
    lng: -76.6464,
    voltage: 110,
    type: 'STR',
    operator: 'CEDENAR',
    department: 'Putumayo',
    capacity: 80
  },
  
  // CHOCÓ (Pacífico)
  {
    id: 'sub_quibdo',
    name: 'Quibdó',
    lat: 5.6947,
    lng: -76.6611,
    voltage: 110,
    type: 'STR',
    operator: 'DISPAC',
    department: 'Chocó',
    capacity: 80
  },
  
  // AMAZONAS (Sur)
  {
    id: 'sub_leticia',
    name: 'Leticia',
    lat: -4.2153,
    lng: -69.9406,
    voltage: 34.5,
    type: 'STR',
    operator: 'EDEAM',
    department: 'Amazonas',
    capacity: 40
  },
];

// Líneas de transmisión principales del SIN
export const transmissionLines: TransmissionLine[] = [
  // Eje Central (Bogotá - Medellín - Costa)
  { id: 'line_bacata_medellin', from: 'sub_bacata', to: 'sub_medellin', voltage: 500, length: 240, capacity: 1500 },
  { id: 'line_medellin_barranquilla', from: 'sub_medellin', to: 'sub_barranquilla', voltage: 500, length: 620, capacity: 1500 },
  { id: 'line_bacata_bucaramanga', from: 'sub_bacata', to: 'sub_bucaramanga', voltage: 230, length: 380, capacity: 800 },
  
  // Eje Occidental (Valle - Antioquia)
  { id: 'line_cali_medellin', from: 'sub_cali', to: 'sub_medellin', voltage: 230, length: 320, capacity: 700 },
  { id: 'line_cali_yumbo', from: 'sub_cali', to: 'sub_yumbo', voltage: 230, length: 15, capacity: 600 },
  { id: 'line_yumbo_pereira', from: 'sub_yumbo', to: 'sub_pereira', voltage: 230, length: 180, capacity: 500 },
  
  // Eje Oriental (Bogotá - Llanos)
  { id: 'line_bacata_villavicencio', from: 'sub_bacata', to: 'sub_villavicencio', voltage: 115, length: 90, capacity: 250 },
  { id: 'line_villavicencio_apiay', from: 'sub_villavicencio', to: 'sub_apiay', voltage: 115, length: 25, capacity: 200 },
  
  // Costa Caribe
  { id: 'line_barranquilla_cartagena', from: 'sub_barranquilla', to: 'sub_cartagena', voltage: 230, length: 120, capacity: 650 },
  { id: 'line_barranquilla_valledupar', from: 'sub_barranquilla', to: 'sub_valledupar', voltage: 230, length: 180, capacity: 500 },
  { id: 'line_valledupar_cucuta', from: 'sub_valledupar', to: 'sub_cucuta', voltage: 230, length: 320, capacity: 450 },
  
  // Santander
  { id: 'line_bucaramanga_barrancabermeja', from: 'sub_bucaramanga', to: 'sub_barrancabermeja', voltage: 230, length: 110, capacity: 600 },
  { id: 'line_barrancabermeja_medellin', from: 'sub_barrancabermeja', to: 'sub_medellin', voltage: 230, length: 280, capacity: 550 },
  
  // Antioquia
  { id: 'line_medellin_guatape', from: 'sub_medellin', to: 'sub_guatape', voltage: 230, length: 80, capacity: 800 },
  { id: 'line_guatape_san_rafael', from: 'sub_guatape', to: 'sub_san_rafael', voltage: 230, length: 35, capacity: 750 },
  { id: 'line_medellin_porce', from: 'sub_medellin', to: 'sub_porce', voltage: 230, length: 120, capacity: 650 },
  
  // Eje Cafetero
  { id: 'line_pereira_armenia', from: 'sub_pereira', to: 'sub_armenia', voltage: 115, length: 45, capacity: 200 },
  { id: 'line_pereira_manizales', from: 'sub_pereira', to: 'sub_manizales', voltage: 115, length: 55, capacity: 200 },
  { id: 'line_manizales_la_dorada', from: 'sub_manizales', to: 'sub_la_dorada', voltage: 230, length: 130, capacity: 450 },
  
  // Sur (Cauca - Nariño)
  { id: 'line_cali_popayan', from: 'sub_cali', to: 'sub_popayan', voltage: 115, length: 130, capacity: 200 },
  { id: 'line_popayan_pasto', from: 'sub_popayan', to: 'sub_pasto', voltage: 115, length: 280, capacity: 200 },
  { id: 'line_pasto_jamondino', from: 'sub_pasto', to: 'sub_jamondino', voltage: 230, length: 15, capacity: 350 },
  
  // Centro-sur (Tolima - Huila)
  { id: 'line_bacata_ibague', from: 'sub_bacata', to: 'sub_ibague', voltage: 115, length: 180, capacity: 250 },
  { id: 'line_ibague_neiva', from: 'sub_ibague', to: 'sub_neiva', voltage: 115, length: 190, capacity: 220 },
  { id: 'line_neiva_betania', from: 'sub_neiva', to: 'sub_betania', voltage: 230, length: 35, capacity: 550 },
  
  // Boyacá
  { id: 'line_bacata_tunja', from: 'sub_bacata', to: 'sub_tunja', voltage: 115, length: 130, capacity: 180 },
  { id: 'line_tunja_sogamoso', from: 'sub_tunja', to: 'sub_sogamoso', voltage: 115, length: 80, capacity: 180 },
  { id: 'line_bacata_chivor', from: 'sub_bacata', to: 'sub_chivor', voltage: 230, length: 150, capacity: 900 },
  
  // Bogotá interno
  { id: 'line_bacata_soacha', from: 'sub_bacata', to: 'sub_soacha', voltage: 230, length: 20, capacity: 450 },
  { id: 'line_bacata_tunal', from: 'sub_bacata', to: 'sub_tunal', voltage: 115, length: 18, capacity: 300 },
  { id: 'line_tunal_usme', from: 'sub_tunal', to: 'sub_usme', voltage: 115, length: 12, capacity: 250 },
  { id: 'line_bacata_salitre', from: 'sub_bacata', to: 'sub_salitre', voltage: 115, length: 8, capacity: 280 },
  { id: 'line_salitre_fontibon', from: 'sub_salitre', to: 'sub_fontibon', voltage: 115, length: 6, capacity: 220 },
  { id: 'line_fontibon_techo', from: 'sub_fontibon', to: 'sub_techo', voltage: 115, length: 4, capacity: 200 },
  
  // Valle interno
  { id: 'line_cali_palmira', from: 'sub_cali', to: 'sub_palmira', voltage: 115, length: 25, capacity: 200 },
  { id: 'line_cali_buenaventura', from: 'sub_cali', to: 'sub_buenaventura', voltage: 115, length: 120, capacity: 250 },
  
  // La Guajira
  { id: 'line_valledupar_cuestecitas', from: 'sub_valledupar', to: 'sub_cuestecitas', voltage: 230, length: 180, capacity: 400 },
  { id: 'line_cuestecitas_riohacha', from: 'sub_cuestecitas', to: 'sub_riohacha', voltage: 110, length: 90, capacity: 120 },
];
