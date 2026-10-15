// Contenido editorial ficticio para explorar la interfaz sin consumir la API.
const stories = {
  general: [
    [
      "El mundo sigue girando. Encuentra tu próxima perspectiva.",
      "Una pausa para mirar lo que nos rodea: ideas, descubrimientos y conversaciones que conectan nuestro mundo. Este artículo es un ejemplo de la experiencia de lectura de ONDA.",
    ],
    [
      "Las ciudades imaginan un futuro con más espacios verdes",
      "Un recorrido de ejemplo por parques urbanos, arquitectura y nuevas maneras de compartir el espacio público.",
    ],
    [
      "Pequeñas ideas que están cambiando nuestra vida cotidiana",
      "La innovación también está en las cosas sencillas. Explora una selección ficticia de proyectos que hacen la vida más fácil.",
    ],
    [
      "Una nueva generación vuelve a mirar hacia las estrellas",
      "La curiosidad por el universo reúne a comunidades de estudiantes y aficionados en este relato de demostración.",
    ],
  ],
  world: [
    [
      "Un mundo conectado por nuevas conversaciones",
      "Culturas, personas e ideas que cruzan fronteras. Una historia ficticia para descubrir la sección de noticias internacionales.",
    ],
    [
      "El intercambio cultural encuentra nuevos puntos de encuentro",
      "Bibliotecas y centros culturales se convierten en espacios para compartir historias en este ejemplo editorial.",
    ],
    [
      "Ciudades que aprenden unas de otras",
      "Un recorrido de demostración por las ideas que viajan de una ciudad a otra.",
    ],
  ],
  technology: [
    [
      "La próxima revolución tecnológica empieza con una pregunta",
      "Explora cómo la creatividad y la tecnología se encuentran. Este contenido es una muestra y no corresponde a una noticia real.",
    ],
    [
      "Diseñar una web más humana, un detalle a la vez",
      "Accesibilidad, interfaces tranquilas y herramientas que ponen a las personas en el centro de este artículo de ejemplo.",
    ],
    [
      "El código abierto abre la puerta a nuevas ideas",
      "Una historia ficticia sobre la colaboración entre comunidades de desarrollo.",
    ],
  ],
  business: [
    [
      "Nuevas ideas para una economía en movimiento",
      "Un ejemplo editorial sobre emprendimiento, colaboración y proyectos locales.",
    ],
    [
      "Los negocios de barrio reinventan su presencia digital",
      "Una mirada de demostración a las herramientas que acercan a comercios y comunidades.",
    ],
    [
      "El valor de construir pensando a largo plazo",
      "Este artículo ficticio explora la relación entre innovación y modelos de negocio sostenibles.",
    ],
  ],
  science: [
    [
      "La curiosidad nos lleva un poco más lejos",
      "De los océanos al espacio: una historia ficticia para explorar el canal de ciencia.",
    ],
    [
      "El universo guarda preguntas que apenas comenzamos a hacer",
      "Un viaje editorial de ejemplo por la astronomía y la exploración espacial.",
    ],
    [
      "La biodiversidad que vive a unos pasos de casa",
      "Un relato de demostración sobre observar la naturaleza que nos rodea.",
    ],
  ],
  sports: [
    [
      "El deporte también se escribe fuera del marcador",
      "Historias de esfuerzo, comunidad y nuevos comienzos. Este es un artículo ficticio de demostración.",
    ],
    [
      "Correr juntos: el movimiento que transforma las mañanas",
      "Una historia de ejemplo sobre clubes deportivos locales y espacios compartidos.",
    ],
    [
      "La siguiente generación encuentra su cancha",
      "Un relato ficticio sobre formación deportiva y trabajo en equipo.",
    ],
  ],
  entertainment: [
    [
      "Historias que merecen una pantalla más grande",
      "Cine, música y cultura para descubrir otras perspectivas en este artículo de demostración.",
    ],
    [
      "La música independiente encuentra nuevos escenarios",
      "Una selección editorial ficticia para explorar el canal de cultura.",
    ],
    [
      "El arte sale de los museos y se encuentra con la ciudad",
      "Un ejemplo de lectura sobre creatividad y espacios públicos.",
    ],
  ],
  health: [
    [
      "Hacer espacio para una vida con más equilibrio",
      "Este ejemplo editorial presenta la sección de salud y bienestar; no contiene recomendaciones médicas.",
    ],
    [
      "El valor de una pausa en medio de la rutina",
      "Una historia ficticia sobre el tiempo libre y la vida cotidiana.",
    ],
    [
      "Comunidades que se cuidan y crecen juntas",
      "Un artículo de demostración sobre vínculos sociales y espacios de convivencia.",
    ],
  ],
};

export const categories = Object.keys(stories);

export function getDemoArticles(category, query = "") {
  const normalized = query.toLocaleLowerCase("es");
  return stories[category]
    .map(([title, description], index) => ({
      id: `demo-${category}-${index}`,
      title,
      description,
      content: description,
      url: null,
      image: null,
      publishedAt: null,
      source: { name: "ONDA · Ejemplo" },
    }))
    .filter((article) =>
      `${article.title} ${article.description}`
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
}
