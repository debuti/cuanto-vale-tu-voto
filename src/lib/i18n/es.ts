// Every visible string of the app. Spanish only (agreed exception, see PLAN.md).
export const es = {
  app: {
    name: '¿Cuánto vale tu voto?',
    tagline: 'Descubre cuánto pesa tu voto según dónde votas y a quién votas.',
    description:
      'Elige tu provincia y tu opción (un partido, voto en blanco, voto nulo o no votar) y mira al instante cuánto vale tu voto en las elecciones generales del 29 de noviembre de 2026. Con mapas, datos oficiales y encuestas. Gratis, neutral y sin registro.',
    skip: 'Saltar al contenido',
    neutral: 'Herramienta neutral: no recomendamos votar a nadie. Solo hacemos las cuentas.'
  },
  nav: {
    home: 'Inicio',
    basics: 'Así funciona la democracia',
    methodology: 'Cómo se calcula',
    faq: 'Preguntas frecuentes',
    privacy: 'Privacidad',
    terms: 'Términos',
    help: 'Ayuda',
    about: 'Acerca de',
    cookies: 'Privacidad y cookies',
    back: 'Volver a la calculadora'
  },
  hero: {
    title: '¿Cuánto vale tu voto?',
    lead: 'En España no todos los votos valen lo mismo. Depende de **dónde** votas y de **a quién** votas. Responde a tres preguntas y te lo enseñamos con números claros.'
  },
  steps: {
    election: '¿Qué elecciones quieres mirar?',
    chamber: '¿Para qué cámara?',
    where: '¿Dónde votas?',
    whereHint: 'Elige tu provincia en la lista o tócala en el mapa de más abajo.',
    island: '¿En qué isla?',
    what: '¿Qué vas a hacer con tu voto?',
    whatPast: '¿Qué opción quieres mirar?',
    which: '¿A qué candidatura?',
    whichHint: 'Están todas las candidaturas que se presentan en {place}.',
    whichHintPast: 'Están todas las candidaturas que se presentaron en {place}.',
    private: 'Te aseguramos que esto no sale de la pestaña de tu navegador. No lo guardamos ni lo enviamos a nadie.',
    showAll: 'Ver las {n} candidaturas',
    showLess: 'Ver menos',
    step: 'Paso {n}'
  },
  elections: {
    e2026: { long: '29 de noviembre de 2026', short: '29N 2026', tag: 'Previsión con encuestas' },
    e2023: { long: '23 de julio de 2023', short: '23J 2023', tag: 'Resultado real' },
    e2019n: { long: '10 de noviembre de 2019', short: '10N 2019', tag: 'Resultado real' },
    e2019a: { long: '28 de abril de 2019', short: '28A 2019', tag: 'Resultado real' }
  },
  chambers: {
    congreso: 'Congreso',
    senado: 'Senado',
    congresoHint: '350 diputados. Eligen al presidente del Gobierno.',
    senadoHint: 'Senadores elegidos en las urnas. Marcas nombres, no una lista.',
    senadoMissing: 'Todavía no tenemos los datos del Senado de 2019. Te enseñamos el Congreso.'
  },
  options: {
    party: { title: 'Votar a un partido', hint: 'Una papeleta de una candidatura' },
    blank: { title: 'Votar en blanco', hint: 'Sobre vacío' },
    null: { title: 'Voto nulo', hint: 'Papeleta rota, tachada o no oficial' },
    abstain: { title: 'No votar', hint: 'Abstención' }
  },
  result: {
    title: 'Tu voto, explicado',
    placeTitle: '1. Por votar en {place}',
    seatsLine: {
      congreso: 'En {place} se eligen **{seats} diputados** entre **{census} personas** con derecho a voto.',
      congresoOne: 'En {place} se elige **1 diputado** entre **{census} personas** con derecho a voto.',
      senado: 'En {place} se eligen **{seats} senadores** entre **{census} personas** con derecho a voto.',
      senadoOne: 'En {place} se elige **1 senador** entre **{census} personas** con derecho a voto.'
    },
    perSeat: 'Sale a **un escaño por cada {eps} votantes**. La media de España es uno por cada {avg}.',
    power: {
      up: {
        badge: 'Potenciador',
        line: 'Votar en {place} te da un **potenciador ×{w}**: tu voto cuenta como **{w} votos** de un español medio.'
      },
      down: {
        badge: 'Freno',
        line: 'Votar en {place} te pone un **freno ×{w}**: tu voto cuenta solo como **{w} votos** de un español medio.'
      },
      same: {
        badge: 'Sin ventaja ni freno',
        line: 'En {place} tu voto cuenta **más o menos como** el de un español medio (×{w}).'
      }
    },
    verdict: {
      title: 'En resumen',
      rivalHold: ' frente a {rival}',
      rivalGain: { now: ', que ahora sería de {rival}', past: ', que fue para {rival}' },
      first: 'su primer escaño',
      another: 'un escaño más',
      holdTight: {
        now: '¡Bien! Con votos como el tuyo, **{party} se llevaría un escaño en {place} por los pelos**: solo {n} votos de margen{rival}.',
        past: '¡Por los pelos! **{party} se llevó un escaño en {place}** con solo {n} votos de margen{rival}.'
      },
      gainTight: {
        now: '¡Casi! A **{party} le faltan solo {n} votos** para ganar {which} en {place}{rival}. Aquí cada voto cuenta de verdad.',
        past: '¡Qué cerca! A **{party} le faltaron solo {n} votos** para ganar {which} en {place}{rival}.'
      },
      safe: {
        now: 'Tu voto se suma a un escaño seguro: **{party} tendría {seats} en {place}**, con {n} votos de margen. Suma, pero no decide.',
        past: '**{party} consiguió {seats} en {place}** con holgura: tuvo {n} votos de margen.'
      },
      far: {
        now: 'Con estos números, **tu voto a {party} en {place} no elegiría a nadie**: le faltan {n} votos para su primer escaño.',
        past: '**Los votos a {party} en {place} no eligieron a nadie**: le faltaron {n} votos para su primer escaño.'
      },
      farNoGain: {
        now: 'Con estos números, **tu voto a {party} en {place} no elegiría a nadie**.',
        past: '**Los votos a {party} en {place} no eligieron a nadie**.'
      },
      blank: {
        costsSeat: {
          now: 'Los votos en blanco suben el listón del 3 % y, con estos números, **le costarían un escaño a {party}** en {place}.',
          past: 'Los votos en blanco subieron el listón del 3 % y **le costaron un escaño a {party}** en {place}.'
        },
        raisesBar: {
          now: 'Tu voto en blanco sube un poco el listón del 3 % y **se lo pone más difícil a {party}**, que está justo por debajo ({pct} %).',
          past: 'Los votos en blanco subieron el listón del 3 % y **se lo pusieron más difícil a {party}**, que se quedó en el {pct} %.'
        },
        nothing: {
          now: 'Tu voto en blanco cuenta como voto válido, pero con estos números **no cambia ningún escaño** en {place}.',
          past: 'Los votos en blanco contaron como válidos, pero **no cambiaron ningún escaño** en {place}.'
        },
        senate: 'En el Senado el voto en blanco **solo cuenta en la estadística**: no cambia quién sale elegido.'
      },
      null: 'Tu voto nulo **no entra en el reparto**: los escaños de {place} los deciden los demás.',
      abstain: 'Si no votas, **los {seats} de {place} se reparten igual**: los deciden quienes sí votan.'
    },
    weightTile: 'Peso de tu voto',
    weightRank: 'Puesto {rank} de {total} (el 1 es donde más pesa)',
    firstSeat: 'Para lograr el primer escaño aquí hace falta alrededor del **{pct} %** de los votos.',
    partyTitle: '2. Por votar a {party}',
    projectedNote: 'Previsión con las encuestas de hoy. No es un resultado: puede cambiar.',
    realNote: 'Resultado oficial de aquellas elecciones.',
    wins: {
      now: '{party} conseguiría **{seats}** aquí, con unos {votes} votos ({pct} %).',
      past: '{party} consiguió **{seats}** aquí, con {votes} votos ({pct} %).'
    },
    noSeat: {
      now: '{party} **no conseguiría escaño** aquí: tendría unos {votes} votos ({pct} %).',
      past: '{party} **no consiguió escaño** aquí: tuvo {votes} votos ({pct} %).'
    },
    notStanding: '{party} no se presenta en {place}.',
    notStandingPast: '{party} no se presentó en {place}.',
    noData:
      'No hay encuestas ni resultados anteriores de {party} en {place}, así que no podemos calcular su previsión. Es una candidatura nueva o muy pequeña.',
    toGain: {
      now: 'Le faltan **{n} votos** para ganar un escaño más.',
      past: 'Le faltaron **{n} votos** para ganar un escaño más.'
    },
    toGainFirst: {
      now: 'Le faltan **{n} votos** para ganar su primer escaño.',
      past: 'Le faltaron **{n} votos** para ganar su primer escaño.'
    },
    toLose: {
      now: 'Si pierde **{n} votos**, pierde un escaño.',
      past: 'Con **{n} votos** menos habría perdido un escaño.'
    },
    wastedNone: {
      now: 'Si no logra escaño, **esos votos no eligen a nadie**.',
      past: '**Esos votos no eligieron a nadie**.'
    },
    wastedSome: {
      now: 'De sus votos, unos {n} «sobran»: con ellos o sin ellos tendría los mismos escaños.',
      past: 'De sus votos, {n} «sobraron»: sin ellos habría tenido los mismos escaños.'
    },
    perSeatParty: {
      now: 'Cada escaño le cuesta unos **{n} votos**.',
      past: 'Cada escaño le costó **{n} votos**.'
    },
    senateRule:
      'En el Senado cada votante marca hasta **{marks}** de una lista de candidatos. Por eso lo normal es que el partido más votado se lleve {first} y el segundo, {second}.',
    senateRuleAll:
      'En el Senado cada votante marca hasta **{marks}**. Aquí lo normal es que el partido más votado se lleve todo.',
    senateModel:
      'Previsión sencilla: partimos del Senado de 2023 y lo movemos como se mueven las encuestas del Congreso. PSOE y Frente Amplio van juntos al Senado («Senado de Progreso»).',
    odds: {
      title: 'Qué dicen 2.000 simulaciones',
      any: 'En **{n} de cada 100** consigue al menos un escaño aquí.',
      more: 'En **{n} de cada 100** gana más escaños de los previstos.',
      fewer: 'En **{n} de cada 100** gana menos.',
      stable: 'El resultado aquí es bastante estable: casi nunca cambia.',
      range: 'En toda España: entre {lo} y {hi} escaños (lo más probable, {mid}).',
      loading: 'Calculando simulaciones…'
    },
    tiles: {
      seats: 'Escaños aquí',
      seatsNow: 'previstos',
      seatsPast: 'conseguidos',
      gain: 'Votos para un escaño más',
      lose: 'Votos de margen',
      none: 'No aplica',
      wasted: 'Votos sin escaño',
      index: 'Rendimiento de tu voto'
    },
    index: {
      title: 'Rendimiento de tu voto',
      of: 'de 100',
      high: 'Alto',
      mid: 'Medio',
      low: 'Bajo',
      explain:
        'Es una nota de 0 a 100 que resume tres cosas. No dice a quién votar: dice cuánto se nota un voto como el tuyo en el reparto de escaños.',
      parts: {
        weight: 'Dónde votas',
        weightHint: 'Cuánto pesa un voto en tu provincia',
        close: 'Escaño en juego',
        closeHint: 'Lo cerca que está de ganar o perder un escaño',
        useful: 'Consigue escaños aquí',
        usefulHint: 'Si esa candidatura saca representación en tu provincia'
      }
    },
    blank: {
      title: '2. Por votar en blanco',
      what: 'Votas en blanco si metes el **sobre vacío** (o, en el Senado, una papeleta sin marcar a nadie).',
      counts:
        'Es un **voto válido**: cuenta en la participación y en el total de votos, pero **no va a ningún partido** y no deja escaños vacíos.',
      bar: 'Como suma al total, sube un poco el listón: para entrar en el reparto un partido necesita el 3 % de los votos válidos. En {place} son **{with} votos**; sin votos en blanco serían {without}.',
      changed: {
        yesNow: 'Con estos números, los votos en blanco **sí cambiarían** algún escaño en {place}.',
        noNow: 'Con estos números, los votos en blanco **no cambian ningún escaño** en {place}.',
        yesPast: 'Aquella vez los votos en blanco **sí cambiaron** algún escaño en {place}.',
        noPast: 'Aquella vez los votos en blanco **no cambiaron ningún escaño** en {place}.'
      },
      senate: 'En el Senado no hay listón del 3 %: el voto en blanco solo cuenta en la estadística.',
      notEb:
        'Ojo: «Escaños en Blanco» es un partido, no es lo mismo que votar en blanco. Si quieres verlo, elige «Votar a un partido».',
      tile: 'Votos en blanco aquí',
      tileShare: '{pct} % de los votos válidos'
    },
    null: {
      title: '2. Por votar nulo',
      what: 'Un voto es nulo si la papeleta está **rota, tachada o escrita**, si no es oficial o si en el sobre hay papeletas de **partidos distintos**.',
      counts:
        'Cuenta en la **participación**, pero **no es un voto válido**: no va a ningún partido y no mueve el listón del 3 %.',
      effect: 'Para el reparto de escaños, votar nulo tiene **el mismo efecto que no votar**.',
      tile: 'Votos nulos aquí',
      tileShare: '{pct} % de los votos emitidos'
    },
    abstain: {
      title: '2. Por no votar',
      what: 'Si no votas, **los escaños se reparten igual**: en {place} siempre se eligen {seats}, vote mucha o poca gente.',
      effect:
        'Tu abstención baja la participación y deja la decisión en manos de quienes sí votan: cada uno de sus votos pesa un poquito más.',
      one: {
        now: 'Si votas, el tuyo sería **1 de unos {cast} votos** en {place}.',
        past: 'Aquel día votaron **{cast} personas** en {place}.'
      },
      tile: 'Personas que no votan aquí',
      tilePast: 'Personas que no votaron aquí',
      tileShare: '{pct} % del censo'
    },
    share: 'Compartir',
    shareText: 'Mira cuánto vale tu voto según dónde votas y a quién votas',
    copied: 'Enlace copiado',
    poster: 'Descargar imagen'
  },
  map: {
    title: 'El mapa del voto',
    lead: 'Toca una provincia para elegirla.',
    modes: { weight: 'Cuánto pesa el voto', winner: 'Quién gana', party: 'Escaños de {party}' },
    legendLess: 'Pesa menos',
    legendMore: 'Pesa más',
    legendSeats: 'Escaños de {party}: de 0 a {max}',
    tipWeight: 'Un voto pesa {w} veces la media',
    tipSeats: '{seats} · 1 por cada {eps} votantes',
    tipWinner: 'Primera fuerza: {party}',
    tipParty: '{party}: {seats}',
    canary: 'Islas Canarias',
    aria: 'Mapa de España por provincias. Elige también la provincia en la lista del paso «¿Dónde votas?».'
  },
  ranking: {
    title: 'Dónde pesa más y dónde menos',
    lead: 'Cada barra es una circunscripción. Cuanto más larga, más pesa cada voto.',
    col: 'Un escaño por cada…',
    voters: '{n} votantes',
    showAll: 'Ver todas',
    showLess: 'Ver solo las primeras y las últimas',
    you: 'La tuya'
  },
  chamber: {
    titleNow: { congreso: 'Así quedaría el Congreso', senado: 'Así quedaría el Senado' },
    titlePast: { congreso: 'Así quedó el Congreso', senado: 'Así quedó el Senado' },
    majority: 'Mayoría absoluta: {n} escaños',
    half: 'Mitad',
    majorityLine: 'mayoría con {n}',
    halfHelp: 'La línea del centro marca la mitad de la cámara. Quien la cruza tiene **mayoría absoluta ({n} escaños)** y puede elegir presidente sin ayuda.',
    has: 'Tiene mayoría absoluta',
    lacks: 'Le faltan {n} para la mayoría absoluta',
    alone: { yes: '**{party} tiene mayoría absoluta** en solitario.', no: '**Ningún partido llega solo a {n}**: hacen falta pactos.' },
    order: 'Ordenar el hemiciclo',
    orders: {
      size: { name: 'Por tamaño', hint: 'Del más grande al más pequeño' },
      sides: { name: 'Izquierda y derecha', hint: 'Dos lados enfrentados. Puedes mover cada partido.' }
    },
    sideHelp: 'Toca un partido para cambiarlo de sitio: lado izquierdo, en medio o lado derecho. Así pruebas cualquier combinación de pactos.',
    sides: { left: 'Lado izquierdo', right: 'Lado derecho', none: 'En medio' },
    sideAria: '{party}, {seats} escaños: {side}. Toca para cambiarlo de sitio.',
    system: 'Contar los votos con otras reglas',
    time: 'Viaja en el tiempo',
    timeHint: 'Mueve el control y mira cómo entran y salen los escaños.',
    play: 'Ver la evolución',
    stop: 'Parar',
    frameReal: 'Resultado real del {date}',
    framePolls: 'Encuestas hasta el {date}',
    frameNow: 'Lo que dicen hoy las encuestas',
    backNow: 'Volver al principio',
    diff: 'Cambio',
    seats: 'escaños',
    range: 'entre {lo} y {hi}',
    others: 'Sin escaño',
    senateNote:
      'Solo aparecen los senadores que se eligen en las urnas. Otros 58 los designan los parlamentos autonómicos.',
    table: 'Partido',
    votes: 'Votos',
    pct: '% voto',
    perSeat: 'Votos por escaño',
    perSeatLead: 'A unos partidos cada escaño les sale mucho más «caro» en votos que a otros.'
  },
  lab: {
    title: 'Juega con las encuestas',
    lead: 'Mueve los controles y mira cómo cambian el mapa, los escaños y tu voto.',
    source: 'Encuesta',
    average: 'Media de encuestas ({n} empresas)',
    turnout: 'Participación',
    turnoutValue: '{sign}{n} puntos respecto a 2023',
    turnoutSame: 'Como en 2023',
    nudge: 'Sube o baja un partido',
    nudgeValue: '{pct} % del voto',
    reset: 'Volver a las encuestas',
    sources: 'Usamos encuestas publicadas por empresas privadas.',
    updated: 'Última encuesta: {date}. Datos actualizados el {updated}.',
    blackout:
      'La ley no permite publicar encuestas en los cinco días anteriores a las elecciones. Los datos están congelados desde el 23 de noviembre.'
  },
  value: {
    title: 'El escalafón: dónde vale más un voto',
    lead: 'Todas las combinaciones de lugar y candidatura, ordenadas por lo que se nota un voto. Vale más donde el voto pesa más y hay un escaño en el aire.',
    margin: 'Un escaño se decide por **{n} votos**',
    score: 'de 100',
    yours: 'Tu elección está en el **puesto {rank} de {total}**.',
    you: 'La tuya',
    showMore: 'Ver los {n} primeros',
    showLess: 'Ver menos',
    note: 'No es una recomendación de voto: es la misma cuenta para todas las candidaturas. Toca una fila para verla en detalle.'
  },
  whatif: {
    title: '¿Y si las reglas fueran otras?',
    lead: 'Los mismos votos, contados con otros sistemas. Así se ve cuánto depende el resultado de las reglas.',
    systems: {
      actual: { name: 'Sistema actual', hint: "Por provincias, método D'Hondt, mínimo del 3 %" },
      'sainte-lague': { name: 'Sainte-Laguë', hint: 'Por provincias, con un método que favorece menos a los grandes' },
      hare: { name: 'Resto mayor (Hare)', hint: 'Por provincias, con cociente y restos' },
      'sin-barrera': { name: 'Sin el mínimo del 3 %', hint: "Por provincias, D'Hondt, sin listón" },
      nacional: { name: 'España como una sola circunscripción', hint: 'Todos los votos valen lo mismo' }
    },
    diff: 'Cambio respecto al sistema actual',
    same: 'Igual'
  },
  tour: {
    title: 'Hola, soy Urni',
    steps: [
      {
        title: 'Hola, soy Urni',
        body: '¿Cuánto vale tu voto? es una calculadora gratuita y neutral para las elecciones generales. Te enseña cuánto pesa tu voto según la provincia donde votas y la opción que eliges.'
      },
      {
        title: '1. Dime dónde votas',
        body: 'En España cada provincia elige sus propios diputados y senadores. En las provincias con poca población hacen falta muchos menos votantes por escaño: allí cada voto pesa más.'
      },
      {
        title: '2. Dime qué vas a hacer',
        body: 'Puedes mirar cualquier candidatura de tu provincia, y también el voto en blanco, el voto nulo y la abstención. Te explicamos con palabras sencillas qué pasa con cada opción.'
      },
      {
        title: '3. Mira el resultado',
        body: 'Verás el peso de tu voto, cuántos votos faltan para un escaño, un mapa de España y cómo quedaría el Congreso según las encuestas. No recomendamos votar a nadie: solo hacemos las cuentas.'
      }
    ],
    next: 'Siguiente',
    prev: 'Anterior',
    start: 'Empezar',
    skip: 'Saltar',
    progress: 'Paso {n} de {total}'
  },
  about: {
    title: 'Acerca de',
    body: '¿Cuánto vale tu voto? es una aplicación de nubuza. Todo se calcula en tu navegador: no hay cuentas y no guardamos nada. Si recargas la página, empieza de cero.',
    version: 'Versión',
    data: 'Datos actualizados el {date}',
    tour: 'Ver la presentación otra vez',
    close: 'Cerrar',
    contact: 'Contacto'
  },
  footer: {
    sources:
      'Fuentes: Ministerio del Interior e INE (resultados, censo y escaños), encuestas publicadas por empresas privadas, recogidas en Wikipedia. Mapa: datos abiertos del IGN.',
    rights: '© 2026 nubuza. Todos los derechos reservados.',
    by: 'hecho por'
  },
  ad: 'Publicidad',
  units: {
    seat: { one: '{n} escaño', other: '{n} escaños' },
    deputy: { one: '{n} diputado', other: '{n} diputados' },
    senator: { one: '{n} senador', other: '{n} senadores' },
    outOf: '{a} de {b}'
  }
} as const;

export type Messages = typeof es;
