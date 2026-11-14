// Content pages (real prerendered HTML). `**bold**` allowed; lines starting with "- " are list items.
export interface Section {
  h: string;
  body: string[];
}
export interface Page {
  title: string;
  description: string;
  intro: string;
  sections: Section[];
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
        'Usamos encuestas publicadas por **empresas privadas**, recogidas en la tabla pública de Wikipedia. **No usamos las del CIS** ni las encargadas por los propios partidos.',
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
  sections: [
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
        'De la media de las encuestas publicadas por empresas privadas, aplicada al resultado de 2023 en cada provincia. No usamos las encuestas del CIS. Es una estimación: puede cambiar y puede fallar.'
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
        'No. Todo se calcula en tu navegador. No hay registro ni cuentas, y lo que eliges no se envía a ningún servidor. Tus preferencias se guardan solo en tu dispositivo y puedes borrarlas desde «Acerca de».'
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
  intro: 'Última actualización: 14 de noviembre de 2026. Responsable: nubuza. Contacto: me@nubuza.com.',
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
        'Para que no tengas que repetir los pasos, tu navegador guarda en su almacenamiento local tus últimas elecciones en la calculadora (elecciones, cámara, provincia, opción y ajustes de encuestas) y si ya has visto la presentación.',
        'Esos datos no salen de tu dispositivo. Puedes borrarlos en «Acerca de» → «Borrar mis preferencias» o borrando los datos del sitio en tu navegador.'
      ]
    },
    {
      h: 'Enlaces para compartir',
      body: [
        'Si pulsas «Compartir», el enlace incluye la provincia y la opción que estás viendo para que la otra persona vea lo mismo. Tú decides si lo compartes y con quién. La imagen descargable solo lleva la provincia y el peso del voto.'
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
      h: 'Publicidad',
      body: [
        'La web puede mostrar anuncios de Google AdSense para pagar su mantenimiento. Google y sus socios pueden usar cookies o identificadores para mostrar y medir anuncios. Si visitas la web desde la Unión Europea, el Reino Unido o Suiza, Google te pedirá antes tu consentimiento y podrás cambiarlo cuando quieras.',
        'Puedes leer cómo usa Google los datos en policies.google.com/technologies/partner-sites. Los anuncios no dependen de la opción de voto que eliges: no la enviamos a nadie.'
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
  intro: 'Última actualización: 14 de noviembre de 2026. Al usar la web aceptas estas condiciones.',
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
        'Puedes usar la web y compartir sus enlaces e imágenes libremente para uso personal, educativo o periodístico, citando la fuente. No está permitido copiar la web o sus contenidos de forma masiva ni usarla para engañar sobre el proceso electoral.'
      ]
    },
    {
      h: 'Propiedad intelectual',
      body: [
        '© 2026 nubuza. Todos los derechos reservados sobre el diseño, los textos, la mascota y el código. Los datos electorales, las encuestas y la cartografía pertenecen a sus respectivas fuentes.'
      ]
    },
    {
      h: 'Publicidad',
      body: ['La web puede mostrar anuncios identificados como «Publicidad». No controlamos su contenido y no suponen ningún apoyo por nuestra parte.']
    },
    {
      h: 'Ley aplicable y contacto',
      body: ['Estas condiciones se rigen por la ley española. Para cualquier consulta: me@nubuza.com.']
    }
  ]
};
