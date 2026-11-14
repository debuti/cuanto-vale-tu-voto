// Static lookup tables for the data pipeline.

/** Wikipedia constituency article name -> [INE code, Spanish name, region]. */
export const PROVINCES = {
  Álava: ['01', 'Álava', 'País Vasco'],
  Albacete: ['02', 'Albacete', 'Castilla-La Mancha'],
  Alicante: ['03', 'Alicante', 'Comunidad Valenciana'],
  Almería: ['04', 'Almería', 'Andalucía'],
  Ávila: ['05', 'Ávila', 'Castilla y León'],
  Badajoz: ['06', 'Badajoz', 'Extremadura'],
  Balearic_Islands: ['07', 'Islas Baleares', 'Islas Baleares'],
  Barcelona: ['08', 'Barcelona', 'Cataluña'],
  Burgos: ['09', 'Burgos', 'Castilla y León'],
  Cáceres: ['10', 'Cáceres', 'Extremadura'],
  Cádiz: ['11', 'Cádiz', 'Andalucía'],
  Castellón: ['12', 'Castellón', 'Comunidad Valenciana'],
  Ciudad_Real: ['13', 'Ciudad Real', 'Castilla-La Mancha'],
  Córdoba: ['14', 'Córdoba', 'Andalucía'],
  A_Coruña: ['15', 'A Coruña', 'Galicia'],
  Cuenca: ['16', 'Cuenca', 'Castilla-La Mancha'],
  Girona: ['17', 'Girona', 'Cataluña'],
  Granada: ['18', 'Granada', 'Andalucía'],
  Guadalajara: ['19', 'Guadalajara', 'Castilla-La Mancha'],
  Gipuzkoa: ['20', 'Gipuzkoa', 'País Vasco'],
  Huelva: ['21', 'Huelva', 'Andalucía'],
  Huesca: ['22', 'Huesca', 'Aragón'],
  Jaén: ['23', 'Jaén', 'Andalucía'],
  León: ['24', 'León', 'Castilla y León'],
  Lleida: ['25', 'Lleida', 'Cataluña'],
  La_Rioja: ['26', 'La Rioja', 'La Rioja'],
  Lugo: ['27', 'Lugo', 'Galicia'],
  Madrid: ['28', 'Madrid', 'Comunidad de Madrid'],
  Málaga: ['29', 'Málaga', 'Andalucía'],
  Murcia: ['30', 'Murcia', 'Región de Murcia'],
  Navarre: ['31', 'Navarra', 'Navarra'],
  Ourense: ['32', 'Ourense', 'Galicia'],
  Asturias: ['33', 'Asturias', 'Asturias'],
  Palencia: ['34', 'Palencia', 'Castilla y León'],
  Las_Palmas: ['35', 'Las Palmas', 'Canarias'],
  Pontevedra: ['36', 'Pontevedra', 'Galicia'],
  Salamanca: ['37', 'Salamanca', 'Castilla y León'],
  Santa_Cruz_de_Tenerife: ['38', 'Santa Cruz de Tenerife', 'Canarias'],
  Cantabria: ['39', 'Cantabria', 'Cantabria'],
  Segovia: ['40', 'Segovia', 'Castilla y León'],
  Seville: ['41', 'Sevilla', 'Andalucía'],
  Soria: ['42', 'Soria', 'Castilla y León'],
  Tarragona: ['43', 'Tarragona', 'Cataluña'],
  Teruel: ['44', 'Teruel', 'Aragón'],
  Toledo: ['45', 'Toledo', 'Castilla-La Mancha'],
  Valencia: ['46', 'Valencia', 'Comunidad Valenciana'],
  Valladolid: ['47', 'Valladolid', 'Castilla y León'],
  Biscay: ['48', 'Bizkaia', 'País Vasco'],
  Zamora: ['49', 'Zamora', 'Castilla y León'],
  Zaragoza: ['50', 'Zaragoza', 'Aragón'],
  Ceuta: ['51', 'Ceuta', 'Ceuta'],
  Melilla: ['52', 'Melilla', 'Melilla']
};

/** Senate island constituencies: article name -> [id, Spanish name, parent province, seats]. */
export const ISLANDS = {
  Mallorca: ['07-mal', 'Mallorca', '07', 3],
  Menorca: ['07-men', 'Menorca', '07', 1],
  'Ibiza–Formentera': ['07-ibf', 'Ibiza y Formentera', '07', 1],
  Gran_Canaria: ['35-gc', 'Gran Canaria', '35', 3],
  Lanzarote: ['35-lz', 'Lanzarote', '35', 1],
  Fuerteventura: ['35-fv', 'Fuerteventura', '35', 1],
  Tenerife: ['38-tf', 'Tenerife', '38', 3],
  La_Palma: ['38-lp', 'La Palma', '38', 1],
  La_Gomera: ['38-go', 'La Gomera', '38', 1],
  El_Hierro: ['38-hi', 'El Hierro', '38', 1]
};

/** Wikipedia "party color" key -> our party id. Unlisted keys get a slug id. */
const FAMILIES = {
  pp: ["People's Party (Spain)"],
  psoe: [
    "Spanish Socialist Workers' Party",
    "Socialists' Party of Galicia",
    'Socialist Party of the Balearic Islands',
    "Socialists' Party of Catalonia",
    'Socialist Party of the Basque Country–Basque Country Left',
    'Socialist Party of Navarre',
    'Socialist Party of Madrid'
  ],
  vox: ['Vox (political party)'],
  fa: ['Broad Front (Spain)', 'Catalunya en Comú', 'Canarian People\'s Unity', 'Ara Més'],
  fv: ['Valencian Front'],
  podemos: ['Podemos (Spanish political party, 2022)', 'Podemos (Spanish political party)'],
  salf: ['Se Acabó La Fiesta'],
  aa: ['Adelante Andalucía (2021)'],
  erc: ['Republican Left of Catalonia', 'Republican Left of Catalonia–Sovereigntists'],
  junts: ['Together for Catalonia (2020)', 'Together for Catalonia (2017)'],
  bildu: ['EH Bildu (2023)', 'EH Bildu'],
  pnv: ['Basque Nationalist Party'],
  bng: ['Galician Nationalist Bloc'],
  cca: [
    'Canarian Coalition',
    'Municipalists Canaries First',
    'Canarian Coalition–New Canaries',
    'Agreement of Nationalist Unity'
  ],
  nc: ['New Canaries'],
  sumar: ['Sumar (electoral alliance)', 'Sumem per Guanyar', 'Sumar Més'],
  up: ['Unidas Podemos', 'En Común', 'En Comú Podem', 'Elkarrekin Podemos'],
  cs: ['Citizens (Spanish political party)'],
  maspais: ['Más País', 'Més Compromís'],
  compromis: ['Coalició Compromís'],
  cup: ['Popular Unity Candidacy'],
  prc: ['Regionalist Party of Cantabria'],
  upn: ["Navarrese People's Union"],
  nasuma: ['Navarra Suma'],
  te: ['Teruel Existe'],
  sy: ['Soria ¡Ya!'],
  pacma: ['Animalist Party with the Environment', 'Animalist Party Against Mistreatment of Animals'],
  frepublica: ['Republican Front (Catalonia)'],
  gbai: ['Geroa Bai'],
  eb: ['Blank Seats'],
  fo: ["Workers' Front (Spain)"],
  pcte: ['Communist Party of the Workers of Spain'],
  pcpe: ['Communist Party of the Peoples of Spain'],
  rc: ['Zero Cuts'],
  pumj: ['For a Fairer World'],
  cha: ['Chunta Aragonesista'],
  asg: ['Gomera Socialist Group'],
  ahi: ['Independent Herrenian Group'],
  exi: ['Left for Independence', 'Left for Independence (Senate)']
};
export const KEY_TO_ID = Object.fromEntries(
  Object.entries(FAMILIES).flatMap(([id, keys]) => keys.map((k) => [k, id]))
);
/** In 2026 CHA stands inside the Frente Amplio. */
export const KEY_OVERRIDES = { e2026: { 'Chunta Aragonesista': 'fa' } };

/** Spanish display names. short = what the ballot says; name = full name. */
export const PARTY_NAMES = {
  pp: ['PP', 'Partido Popular'],
  psoe: ['PSOE', 'Partido Socialista Obrero Español'],
  vox: ['Vox', 'Vox'],
  fa: ['Frente Amplio', 'Frente Amplio'],
  fv: ['Front Valencià', 'Front Valencià (Compromís, EUPV, Podem, ERPV)'],
  podemos: ['Podemos', 'Podemos'],
  salf: ['SALF', 'Se Acabó La Fiesta'],
  aa: ['Adelante Andalucía', 'Adelante Andalucía'],
  erc: ['ERC', 'Esquerra Republicana de Catalunya'],
  junts: ['Junts', 'Junts per Catalunya'],
  bildu: ['EH Bildu', 'Euskal Herria Bildu'],
  pnv: ['PNV', 'Partido Nacionalista Vasco (EAJ-PNV)'],
  bng: ['BNG', 'Bloque Nacionalista Galego'],
  cca: ['Coalición Canaria', 'Coalición Canaria'],
  nc: ['Nueva Canarias', 'Nueva Canarias'],
  sumar: ['Sumar', 'Sumar'],
  up: ['Unidas Podemos', 'Unidas Podemos'],
  cs: ['Ciudadanos', 'Ciudadanos'],
  maspais: ['Más País', 'Más País'],
  compromis: ['Compromís', 'Compromís'],
  cup: ['CUP', "Candidatura d'Unitat Popular"],
  prc: ['PRC', 'Partido Regionalista de Cantabria'],
  upn: ['UPN', 'Unión del Pueblo Navarro'],
  nasuma: ['Navarra Suma', 'Navarra Suma (UPN, PP, Ciudadanos)'],
  te: ['Teruel Existe', 'Teruel Existe'],
  sy: ['Soria ¡Ya!', 'Soria ¡Ya!'],
  pacma: ['PACMA', 'Partido Animalista con el Medio Ambiente'],
  frepublica: ['Front Republicà', 'Front Republicà'],
  gbai: ['Geroa Bai', 'Geroa Bai'],
  eb: ['Escaños en Blanco', 'Escaños en Blanco'],
  fo: ['Frente Obrero', 'Frente Obrero'],
  pcte: ['PCTE', 'Partido Comunista de los Trabajadores de España'],
  pcpe: ['PCPE', 'Partido Comunista de los Pueblos de España'],
  rc: ['Recortes Cero', 'Recortes Cero'],
  pumj: ['Por un Mundo Más Justo', 'Por un Mundo Más Justo'],
  cha: ['CHA', 'Chunta Aragonesista'],
  asg: ['ASG', 'Agrupación Socialista Gomera'],
  ahi: ['AHI', 'Agrupación Herreña Independiente'],
  exi: ['ERC–EH Bildu', 'Izquierdas por la Independencia (ERC, EH Bildu)'],
  sdp: ['Senado de Progreso', 'Senado de Progreso (PSOE y Frente Amplio)']
};

/** Fallback colours when Wikipedia has none. */
export const COLOR_OVERRIDES = { sdp: '#D8345F' };

/** Poll table column (Wikipedia key) order is read from the header; these are the ids. */
export const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
