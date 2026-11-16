// Content pages (real prerendered HTML). `**bold**` allowed; lines starting with "- " are list items.
export type Fig =
  | { kind: 'flow'; steps: { icon: string; tag?: string; t: string; d: string; alt?: boolean }[] }
  | { kind: 'cards'; cards: { icon: string; t: string; lines: string[] }[] }
  | { kind: 'split'; total: number; unit: string; parts: { n: number; label: string }[] }
  | {
      kind: 'dhondt';
      seats: number;
      caption: string;
      head: { party: string; votes: string; seats: string; out: string };
      parties: { name: string; votes: number }[];
      moral: string;
    }
  | { kind: 'bars'; total: number; mark: string; rows: { label: string; n: number | null; open?: string; what: string }[] };
export interface Section {
  h: string;
  body: string[];
  fig?: Fig;
}
export interface Page {
  title: string;
  description: string;
  intro: string;
  sections: Section[];
  /** A button to a related page, shown under the introduction. */
  related?: { path: string; label: string };
  outro?: string;
}

export const methodology: Page = {
  title: 'Cómo se calcula',
  description:
    'De dónde salen los datos de ¿Cuánto vale tu voto? y cómo hacemos cada cuenta: el peso del voto por provincia, el reparto D’Hondt, la previsión con encuestas y las simulaciones.',
  intro:
    'Aquí explicamos, sin fórmulas raras, de dónde sale cada número de la calculadora. Si algo no se entiende, es culpa nuestra: escríbenos.',
  sections: [
    {
      h: 'El peso de tu voto',
      body: [
        'En las elecciones generales cada provincia es una circunscripción y elige sus propios diputados. Todas tienen un mínimo de 2 diputados (Ceuta y Melilla, 1) y el resto se reparte según la población. Por eso en las provincias pequeñas hay muchos menos votantes por cada escaño.',
        'Calculamos cuántas personas con derecho a voto hay por cada escaño en tu circunscripción y lo comparamos con la media de España. Si en tu provincia hay la mitad de votantes por escaño que en la media, tu voto «pesa» **2 veces** el voto medio.',
        'Para 2026 usamos los escaños por provincia del decreto de convocatoria y el último censo electoral publicado.'
      ]
    },
    {
      h: 'El reparto de escaños (método D’Hondt)',
      body: [
        'En el Congreso los escaños de cada provincia se reparten con el método D’Hondt: los votos de cada candidatura se dividen entre 1, 2, 3… y los escaños se dan a los cocientes más altos.',
        'Solo entran en el reparto las candidaturas con al menos el **3 % de los votos válidos** de la provincia. Los votos válidos son los votos a candidaturas más los votos en blanco.',
        'Con estas reglas reproducimos, escaño por escaño, los resultados oficiales de abril de 2019, noviembre de 2019 y julio de 2023.'
      ]
    },
    {
      h: 'Votos que faltan y votos que sobran',
      body: [
        '«Votos para un escaño más» es cuántos votos más necesitaría esa candidatura en tu provincia para ganar otro escaño si las demás se quedaran igual.',
        '«Votos de margen» es cuántos puede perder antes de perder un escaño.',
        'Si una candidatura no logra escaño en la provincia, sus votos allí no eligen a nadie. No decimos que sea un voto «tirado»: decimos qué pasa con él en el reparto.'
      ]
    },
    {
      h: 'Voto en blanco, voto nulo y abstención',
      body: [
        '- **Voto en blanco**: es válido. Cuenta para el total sobre el que se calcula el 3 %, así que sube un poco ese listón. No va a ningún partido.',
        '- **Voto nulo**: cuenta en la participación, pero no es válido. No influye en el reparto.',
        '- **Abstención**: no cuenta en nada. Los escaños se reparten igual entre quienes sí votan.'
      ]
    },
    {
      h: 'La previsión de 2026',
      body: [
        'Las encuestas dan el voto de cada partido en toda España, no en cada provincia. Para bajar a la provincia partimos del resultado de 2023 en cada una y lo movemos en la misma proporción en que cada partido sube o baja en España según las encuestas.',
        'Las candidaturas nuevas heredan el punto de partida de las formaciones de las que vienen. De las candidaturas muy pequeñas o nuevas sin encuestas no podemos estimar nada y lo decimos.',
        'Es una estimación sencilla y transparente, no una predicción. El resultado real puede ser distinto.'
      ]
    },
    {
      h: 'Las encuestas',
      body: [
        'Usamos encuestas publicadas por **empresas privadas**, recogidas en la tabla pública de Wikipedia. No usamos las encargadas por los propios partidos.',
        'La media toma la última encuesta de cada empresa dentro de las tres últimas semanas, y todas pesan lo mismo. También puedes elegir una empresa concreta.',
        'La ley prohíbe publicar encuestas en los cinco días anteriores a la votación. Desde ese momento los datos de la calculadora quedan congelados.'
      ]
    },
    {
      h: 'Las simulaciones',
      body: [
        'Las encuestas se equivocan. Para tenerlo en cuenta repetimos las elecciones **2.000 veces** en tu navegador: cada vez movemos a cada partido tanto como suelen fallar las encuestas, más un poco de variación en cada provincia, y volvemos a repartir los escaños.',
        'De ahí salen frases como «en 70 de cada 100 simulaciones consigue escaño» y los intervalos de escaños de cada partido.'
      ]
    },
    {
      h: 'El rendimiento de tu voto',
      body: [
        'Es una nota de 0 a 100 que resume tres cosas:',
        '- **Dónde votas** (30 puntos): cuánto pesa un voto en tu circunscripción.',
        '- **Escaño en juego** (40 puntos): lo cerca que está esa candidatura de ganar o perder un escaño allí.',
        '- **Consigue escaños aquí** (30 puntos): si esa candidatura saca representación en tu provincia.',
        'No es una recomendación de voto. Mucha gente vota por convicción, y eso no lo mide ningún número.'
      ]
    },
    {
      h: 'El Senado',
      body: [
        'En el Senado se vota a personas. En casi todas las provincias se eligen 4 senadores y cada votante marca hasta 3, así que lo normal es que el partido más votado se lleve 3 y el segundo 1. En las islas, Ceuta y Melilla los números son distintos.',
        'Para 2026 partimos del resultado del Senado de 2023 y lo movemos como se mueven las encuestas del Congreso. PSOE y Frente Amplio presentan candidatos conjuntos («Senado de Progreso»); asumimos que conservan tres de cada cuatro votos que tendrían por separado.',
        'Todavía no tenemos el Senado de las dos elecciones de 2019.'
      ]
    },
    {
      h: '¿Y si las reglas fueran otras?',
      body: [
        'Contamos los mismos votos con otros sistemas: Sainte-Laguë, resto mayor (Hare), sin el mínimo del 3 % y España como una sola circunscripción. Es un ejercicio: con otras reglas la gente y los partidos también se comportarían de otra forma.'
      ]
    },
    {
      h: 'Fuentes',
      body: [
        '- Resultados, censo y escaños: Ministerio del Interior, Junta Electoral Central e INE.',
        '- Encuestas: empresas privadas, a través de la recopilación pública de Wikipedia.',
        '- Mapa: datos abiertos del Instituto Geográfico Nacional.'
      ]
    }
  ]
};

export const faq: Page = {
  title: 'Preguntas frecuentes',
  description:
    'Respuestas claras sobre el valor del voto en España: por qué no todos los votos pesan igual, qué pasa con el voto en blanco, el voto nulo y la abstención, y cómo se reparten los escaños.',
  intro: 'Las dudas más habituales, respondidas con palabras sencillas.',
  related: { path: 'how-spain-votes/', label: '🏛️ Así funciona la democracia, con dibujos' },
  sections: [
    {
      h: '¿Votamos al presidente del Gobierno?',
      body: [
        'No directamente. En las elecciones generales elegimos a los **350 diputados** del Congreso y a los senadores. Después, **el Congreso elige al presidente**: en la primera votación necesita mayoría absoluta (176 síes) y, si no llega, dos días después le basta con más síes que noes.',
        'Lo explicamos paso a paso y con dibujos en la página «Así funciona la democracia».'
      ]
    },
    {
      h: '¿Por qué mi voto no vale lo mismo que el de otra provincia?',
      body: [
        'Porque cada provincia elige sus propios diputados y todas tienen un mínimo de dos, tengan la población que tengan. En Soria o Teruel hay muchos menos votantes por escaño que en Madrid o Barcelona, así que allí cada voto pesa más.'
      ]
    },
    {
      h: '¿El voto en blanco beneficia a los partidos grandes?',
      body: [
        'El voto en blanco es un voto válido, así que sube un poco el número de votos que hace falta para llegar al 3 %. En la práctica el efecto es muy pequeño y casi nunca cambia un escaño. No se suma a ningún partido ni deja escaños vacíos.'
      ]
    },
    {
      h: '¿Qué diferencia hay entre votar en blanco y votar nulo?',
      body: [
        'El voto en blanco (sobre vacío) es válido y cuenta en el total. El voto nulo (papeleta rota, tachada, o dos papeletas distintas en el sobre) no es válido: cuenta en la participación, pero no en el reparto.'
      ]
    },
    {
      h: '¿Qué pasa si no voto?',
      body: [
        'Los escaños se reparten igual. En cada provincia se elige siempre el mismo número de diputados, vote mucha o poca gente. La abstención no se suma a nadie.'
      ]
    },
    {
      h: '¿Votar en blanco es lo mismo que votar a Escaños en Blanco?',
      body: [
        'No. Escaños en Blanco es un partido que se presenta con su propia papeleta. El voto en blanco es un sobre sin papeleta.'
      ]
    },
    {
      h: '¿Qué es el método D’Hondt?',
      body: [
        'Es la forma de repartir los escaños de cada provincia en el Congreso. Los votos de cada candidatura se dividen entre 1, 2, 3… y los escaños se dan a los resultados más altos. En provincias con pocos escaños favorece a las candidaturas más votadas.'
      ]
    },
    {
      h: '¿Qué significa que una candidatura «no consigue escaño»?',
      body: [
        'Que en esa provincia no llega a los votos necesarios para entrar en el reparto. Sus votos allí no eligen a ningún diputado, aunque sí cuentan en el total de España de ese partido.'
      ]
    },
    {
      h: '¿De dónde salen las previsiones de 2026?',
      body: [
        'De la media de las encuestas publicadas por empresas privadas, aplicada al resultado de 2023 en cada provincia. Es una estimación: puede cambiar y puede fallar.'
      ]
    },
    {
      h: '¿Me decís a quién votar?',
      body: [
        'No. La calculadora es neutral: enseña cómo funcionan las reglas y qué pasa con cada opción, incluidas el voto en blanco, el nulo y la abstención. La decisión es solo tuya.'
      ]
    },
    {
      h: '¿Guardáis mis datos o lo que elijo?',
      body: [
        'No. Todo se calcula en tu navegador. No hay registro ni cuentas, y lo que eliges no se envía a ningún servidor. No guardamos nada: si recargas la página, empieza de cero.'
      ]
    },
    {
      h: '¿Cada cuánto se actualizan las encuestas?',
      body: [
        'Con frecuencia durante la campaña, hasta que empieza el periodo en que la ley prohíbe publicar encuestas (los cinco días anteriores a las elecciones). La fecha de la última actualización aparece junto a los controles de encuestas.'
      ]
    }
  ]
};

export const privacy: Page = {
  title: 'Política de privacidad',
  description:
    'Política de privacidad de ¿Cuánto vale tu voto?: no hay cuentas, no recogemos datos personales y lo que eliges no sale de tu navegador.',
  intro: 'Última actualización: 16 de noviembre de 2026. Responsable: nubuza. Contacto: me@nubuza.com.',
  sections: [
    {
      h: 'Resumen',
      body: [
        '¿Cuánto vale tu voto? funciona entera en tu navegador. **No hay registro, no hay cuentas y no recogemos datos personales.** La provincia y la opción de voto que eliges no se envían a ningún servidor nuestro.'
      ]
    },
    {
      h: 'Qué se guarda en tu dispositivo',
      body: [
        '**Nada.** La calculadora no usa cookies propias ni almacenamiento local: no recuerda tu provincia ni tu opción de voto. Si recargas la página, empieza de cero.',
        'Un enlace a la web puede llevar una provincia y una opción en la dirección para abrirla ya elegida. Se lee en tu navegador y no se guarda.'
      ]
    },
    {
      h: 'Alojamiento',
      body: [
        'La web se sirve desde Cloudflare. Como cualquier servidor web, Cloudflare procesa datos técnicos de la conexión (por ejemplo, la dirección IP) para entregar las páginas y protegerlas de abusos. Nosotros no usamos esos datos para identificarte.'
      ]
    },
    {
      h: 'Estadísticas',
      body: [
        'Podemos usar Cloudflare Web Analytics para saber cuántas visitas tiene la web. No usa cookies ni crea perfiles. No usamos Google Analytics.'
      ]
    },
    {
      h: 'Menores',
      body: ['La web no está dirigida a menores de 14 años y no recoge datos de nadie de forma consciente.']
    },
    {
      h: 'Tus derechos',
      body: [
        'Como no guardamos datos personales tuyos, no tenemos nada que consultar, corregir o borrar. Si tienes cualquier duda sobre privacidad, escríbenos a me@nubuza.com. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).'
      ]
    },
    {
      h: 'Cambios',
      body: ['Si cambiamos esta política, publicaremos aquí la nueva versión con su fecha.']
    }
  ]
};

export const terms: Page = {
  title: 'Términos de uso',
  description: 'Condiciones de uso de ¿Cuánto vale tu voto?, una calculadora informativa y neutral de nubuza.',
  intro: 'Última actualización: 16 de noviembre de 2026. Al usar la web aceptas estas condiciones.',
  sections: [
    {
      h: 'Qué es esta web',
      body: [
        '¿Cuánto vale tu voto? es una herramienta gratuita, informativa y educativa de nubuza. **No es una web oficial** ni tiene relación con ninguna administración, partido político o empresa de encuestas.'
      ]
    },
    {
      h: 'Neutralidad',
      body: [
        'No recomendamos votar ni dejar de votar a nadie. Los cálculos explican cómo funcionan las reglas electorales. Nada de lo que ves aquí es un consejo sobre qué hacer con tu voto.'
      ]
    },
    {
      h: 'Datos y previsiones',
      body: [
        'Los resultados pasados proceden de fuentes oficiales, pero pueden contener errores de transcripción. Las previsiones se basan en encuestas de terceros y en un modelo sencillo: **son estimaciones y pueden fallar**.',
        'Para información oficial sobre las elecciones, consulta el Ministerio del Interior y la Junta Electoral Central.'
      ]
    },
    {
      h: 'Sin garantías',
      body: [
        'La web se ofrece «tal cual». Hacemos lo posible por que los datos sean correctos y la web esté disponible, pero no lo garantizamos y no respondemos de las decisiones que tomes a partir de ella, en la medida en que la ley lo permita.'
      ]
    },
    {
      h: 'Uso permitido',
      body: [
        'Puedes usar la web y compartir sus enlaces libremente para uso personal, educativo o periodístico, citando la fuente. No está permitido copiar la web o sus contenidos de forma masiva ni usarla para engañar sobre el proceso electoral.'
      ]
    },
    {
      h: 'Propiedad intelectual',
      body: [
        '© 2026 nubuza. Todos los derechos reservados sobre el diseño, los textos, la mascota y el código. Los datos electorales, las encuestas y la cartografía pertenecen a sus respectivas fuentes.'
      ]
    },
    {
      h: 'Ley aplicable y contacto',
      body: ['Estas condiciones se rigen por la ley española. Para cualquier consulta: me@nubuza.com.']
    }
  ]
};

export const basics: Page = {
  title: 'Así funciona la democracia en España',
  description:
    'Lo básico de la democracia española explicado con dibujos: qué se vota en unas elecciones generales, cómo se reparten los escaños según la ley electoral, cómo se elige al presidente del Gobierno según la Constitución, las mayorías y los plazos.',
  intro:
    'Qué votas, cómo se convierten los votos en escaños y cómo se elige después al presidente del Gobierno. Todo con dibujos y sin palabras raras.',
  related: { path: 'faq/', label: '💬 Preguntas frecuentes' },
  sections: [
    {
      h: 'Lo básico en un minuto',
      body: [
        '- En España **no votamos directamente al presidente del Gobierno**. Votamos a las **Cortes Generales** (Congreso y Senado), y después **el Congreso elige al presidente**.',
        '- Pueden votar todos los españoles con **18 años** cumplidos que estén en el censo.',
        '- El voto es **libre, igual, directo y secreto**. Nadie puede saber qué has votado.',
        '- Hay elecciones generales, como mucho, **cada 4 años**.'
      ]
    },
    {
      h: 'Qué votas: dos sobres',
      body: ['El día de las elecciones generales puedes meter dos sobres en dos urnas distintas.'],
      fig: {
        kind: 'cards',
        cards: [
          {
            icon: '✉️',
            t: 'Sobre blanco: el Congreso',
            lines: [
              '**350 diputados**.',
              'Eliges la papeleta de **un partido entero**: la lista viene cerrada y no puedes tachar ni cambiar el orden.',
              'Es la cámara que **elige al presidente** y la que más pesa al hacer las leyes.'
            ]
          },
          {
            icon: '📜',
            t: 'Sobre sepia: el Senado',
            lines: [
              '**208 senadores** elegidos en las urnas (y otros los nombran los parlamentos autonómicos).',
              'Marcas **nombres con una cruz**: hasta 3 en la mayoría de provincias. Pueden ser de partidos distintos.',
              'Revisa las leyes que le llegan del Congreso.'
            ]
          }
        ]
      }
    },
    {
      h: 'Cuántos diputados elige cada provincia',
      body: [
        'Cada provincia es una **circunscripción**: elige sus propios diputados y sus votos no se mezclan con los de otras provincias.',
        'La ley electoral reparte así los 350 escaños del Congreso:'
      ],
      fig: {
        kind: 'split',
        total: 350,
        unit: 'diputados',
        parts: [
          { n: 100, label: '2 fijos para cada una de las 50 provincias' },
          { n: 2, label: '1 para Ceuta y 1 para Melilla' },
          { n: 248, label: 'Se reparten según la población' }
        ]
      }
    },
    {
      h: 'Por eso no todos los votos pesan igual',
      body: [
        'Como todas las provincias tienen 2 diputados fijos, **en las provincias con poca gente hacen falta muchos menos votantes por cada escaño**. Por eso un voto en Soria o Teruel pesa varias veces más que uno en Madrid o Barcelona.',
        'En el Senado pasa todavía más: cada provincia de la península elige **4 senadores**, tenga los habitantes que tenga. Las islas grandes eligen 3, las pequeñas 1, y Ceuta y Melilla 2 cada una.'
      ]
    },
    {
      h: 'Del voto al escaño',
      body: ['En cada provincia, los votos del Congreso se convierten en escaños en cuatro pasos:'],
      fig: {
        kind: 'flow',
        steps: [
          { icon: '🗳️', t: 'Se cuentan los votos válidos', d: 'Los votos a partidos más los votos en blanco. Los nulos no cuentan.' },
          { icon: '🚧', t: 'El listón del 3 %', d: 'Los partidos con menos del 3 % de los votos válidos de la provincia quedan fuera del reparto.' },
          { icon: '➗', t: 'Se divide', d: 'Los votos de cada partido se dividen entre 1, entre 2, entre 3… hasta el número de escaños.' },
          { icon: '🪑', t: 'Se reparten los escaños', d: 'Los escaños van, uno a uno, a los resultados más altos. Es el método D’Hondt.' }
        ]
      }
    },
    {
      h: 'Un ejemplo del método D’Hondt',
      body: ['Imagina una provincia que elige **5 diputados**. Los cinco resultados más altos de la tabla se llevan un escaño cada uno:'],
      fig: {
        kind: 'dhondt',
        seats: 5,
        caption: 'Reparto de 5 escaños con el método D’Hondt',
        head: { party: 'Partido', votes: 'Votos', seats: 'Escaños', out: 'Fuera: menos del 3 %' },
        parties: [
          { name: 'Partido A', votes: 96000 },
          { name: 'Partido B', votes: 60000 },
          { name: 'Partido C', votes: 33000 },
          { name: 'Partido D', votes: 11000 },
          { name: 'Partido E', votes: 5000 }
        ],
        moral:
          'Fíjate: el partido A tiene menos de la mitad de los votos y se lleva 3 de los 5 escaños. Cuantos menos escaños reparte una provincia, más favorece el reparto a los partidos grandes. Y los votos de D y E no eligen a nadie.'
      }
    },
    {
      h: 'Voto en blanco, voto nulo y no votar',
      body: [
        '- **En blanco** (sobre vacío): es un voto válido. No va a ningún partido, pero sube un poquito el listón del 3 %.',
        '- **Nulo** (papeleta rota, tachada o dos papeletas distintas): no es válido. Para el reparto es como no haber votado.',
        '- **No votar**: los escaños se reparten igual entre quienes sí votan. No quedan escaños vacíos.'
      ]
    },
    {
      h: 'El calendario de unas elecciones',
      body: ['La ley electoral marca los plazos. Desde que se convocan hasta que se vota pasan siempre **54 días**:'],
      fig: {
        kind: 'flow',
        steps: [
          { icon: '📣', tag: 'Día 0', t: 'Se convocan', d: 'Se publica el decreto en el BOE y se disuelven las Cortes. En 2026 fue el 6 de octubre.' },
          { icon: '📢', tag: '15 días', t: 'Campaña electoral', d: 'Los partidos piden el voto. En 2026, del 13 al 27 de noviembre.' },
          { icon: '🔇', tag: 'Últimos 5 días', t: 'Sin encuestas', d: 'La ley prohíbe publicar encuestas en los cinco días anteriores a la votación.' },
          { icon: '🤫', tag: 'Víspera', t: 'Jornada de reflexión', d: 'Ya no se puede pedir el voto.' },
          { icon: '🗳️', tag: 'Día 54', t: 'Se vota', d: 'De 9 de la mañana a 8 de la tarde. Por la noche se cuentan los votos.' }
        ]
      }
    },
    {
      h: 'De las urnas al Gobierno',
      body: ['Lo dice la Constitución (artículo 99). Después de votar, pasa esto:'],
      fig: {
        kind: 'flow',
        steps: [
          { icon: '🏛️', tag: 'Antes de 25 días', t: 'Se forman las Cortes', d: 'Los nuevos diputados y senadores toman posesión y eligen a quien preside cada cámara.' },
          { icon: '👑', t: 'El Rey propone un candidato', d: 'Antes habla con los partidos que tienen diputados. Suele proponer a quien puede reunir más apoyos.' },
          { icon: '🙋', tag: '1.ª votación', t: 'Mayoría absoluta', d: 'El candidato explica su programa y el Congreso vota. Necesita 176 síes o más.' },
          { icon: '⏱️', tag: '48 horas después', t: '2.ª votación: más síes que noes', d: 'Si no llegó a 176, se vota otra vez. Ahora basta con tener más síes que noes; las abstenciones ayudan.' },
          { icon: '🤝', t: 'Si lo consigue: hay presidente', d: 'El Rey lo nombra y el presidente elige a sus ministros. El Gobierno dura, como mucho, 4 años.' },
          { icon: '🔁', tag: '2 meses', alt: true, t: 'Si nadie lo consigue: se repiten las elecciones', d: 'Si pasan dos meses desde la primera votación sin presidente, se disuelven las Cortes y se vuelve a votar.' }
        ]
      }
    },
    {
      h: 'Las mayorías: cuántos síes hacen falta',
      body: ['En un Congreso de 350 diputados, no todas las decisiones necesitan los mismos votos:'],
      fig: {
        kind: 'bars',
        total: 350,
        mark: 'La mitad',
        rows: [
          { label: 'Mayoría simple', n: null, open: 'Más síes que noes', what: 'Leyes normales, Presupuestos y la segunda votación de investidura.' },
          { label: 'Mayoría absoluta', n: 176, what: 'Investidura a la primera, leyes orgánicas, moción de censura y superar un veto del Senado.' },
          { label: 'Tres quintos', n: 210, what: 'Reforma normal de la Constitución y elegir a parte del Tribunal Constitucional y del Poder Judicial.' },
          { label: 'Dos tercios', n: 234, what: 'Reforma de las partes esenciales de la Constitución. Además hay que repetir elecciones y hacer un referéndum.' }
        ]
      }
    },
    {
      h: 'Cómo puede acabar un Gobierno antes de tiempo',
      body: [
        '- **Moción de censura**: la presentan al menos 35 diputados, con un candidato alternativo. Si la apoyan 176 o más, ese candidato pasa a ser presidente.',
        '- **Cuestión de confianza**: el presidente pregunta al Congreso si lo sigue apoyando. Si tiene más noes que síes, debe dimitir.',
        '- **Elecciones anticipadas**: el presidente puede disolver las Cortes y convocar elecciones cuando quiera, salvo durante una moción de censura o en el primer año tras unas elecciones convocadas así.',
        '- **Fin de la legislatura**: a los 4 años se convocan elecciones sí o sí.'
      ]
    },
    {
      h: 'Para qué sirve el Senado',
      body: [
        'El Senado revisa las leyes que aprueba el Congreso. Puede proponer cambios o **vetarlas**, pero el Congreso tiene la última palabra: puede levantar el veto con mayoría absoluta o, pasados dos meses, con mayoría simple.',
        'Además, el Senado es quien autoriza al Gobierno a intervenir una comunidad autónoma (artículo 155), por mayoría absoluta.'
      ]
    },
    {
      h: 'De dónde sale todo esto',
      body: [
        'De la **Constitución Española** (artículos 66 a 69, 81, 90, 99, 112 a 115, 167 y 168) y de la **Ley Orgánica 5/1985 del Régimen Electoral General** (artículos 42, 51, 69, 96 y 161 a 166).',
        'Es un resumen para entenderlo fácil. El texto oficial y completo está en el Boletín Oficial del Estado (boe.es).'
      ]
    }
  ]
};
