# ONDA · API de noticias

Aplicación local de noticias con **React + Vite**, **Express** y **GNews**. La interfaz toma del XMB las categorías horizontales, los titulares verticales y una navegación tranquila por teclado, con una identidad propia.

## Iniciar

Requiere Node.js 22.12 o posterior (se utilizó Node 24).

```powershell
git clone https://github.com/X294-DEV/APINoticias.git
cd APINoticias
npm ci
Copy-Item .env.example .env
npm run dev
```

Abre **http://127.0.0.1:5173**. Vite envía las peticiones `/api` al servidor Express en el puerto 3001. Si cambias `PORT`, actualiza también el proxy en `vite.config.js`.

Sin clave se activa una **demostración con artículos ficticios**, claramente identificada en pantalla. El país y el idioma se aplican a las consultas reales; la demostración solo filtra por categoría y texto.

## Conectar GNews

Obtén una clave en [GNews](https://gnews.io/) y edita `.env` en tu equipo:

```dotenv
NEWS_API_KEY=tu_clave
NEWS_MODE=auto
PORT=3001
```

Reinicia `npm run dev` después de modificar `.env`. `auto` usa noticias reales cuando hay una clave; `demo` fuerza los ejemplos y `live` exige una clave. Una clave inválida muestra un error y no sustituye silenciosamente los resultados por ejemplos.

**La clave se guarda únicamente en el servidor.** No uses un nombre `VITE_`, no la incluyas en React ni la subas al repositorio. `.env` está excluido con `.gitignore`; `.env.example` contiene solo la plantilla vacía.

## Trabajar desde GitHub

El repositorio es [X294-DEV/APINoticias](https://github.com/X294-DEV/APINoticias). Para nuevos cambios, crea una rama desde `main`, valida con `npm test` y `npm run build`, y abre un pull request para revisarlos. Cada clon configura su propio `.env` local; las claves no se comparten mediante Git.

El repositorio incluye código fuente, pruebas y el archivo de dependencias bloqueadas. Se excluyen `.env`, `node_modules/`, `dist/`, logs, copias de seguridad y archivos de claves privadas.

## Cómo fluye la información

```text
React → GET /api/news → Express → GNews
React ← artículos JSON ← Express ← respuesta de GNews
```

1. React mantiene la categoría, la búsqueda y el país seleccionados.
2. `fetch()` envía una petición a Express, sin incluir la clave.
3. Express valida los filtros, añade la clave y consulta el endpoint `top-headlines` de GNews.
4. Express normaliza la respuesta y la devuelve a React. Una caché de cinco minutos y la agrupación de consultas simultáneas iguales reducen el consumo de cuota.
5. React muestra los estados de carga, error, vacío o resultados. La noticia completa se abre en la fuente original.

En `src/App.jsx`, **async** permite declarar una función asíncrona; **await** espera el resultado de `fetch()` y de **response.json()**, que convierte el cuerpo JSON en datos de JavaScript. **try** contiene la operación que puede fallar y **catch** permite mostrar un error comprensible. Al cambiar los filtros se cancela la petición anterior para evitar resultados desactualizados.

## Funciones

- Ocho categorías: para ti, mundo, tecnología, negocios, ciencia, deportes, cultura y bienestar.
- Búsqueda por texto dentro de la categoría seleccionada; pulsa Enter o la lupa para enviarla.
- Filtro por país; las noticias reales se solicitan en español.
- Flechas izquierda/derecha para categorías, arriba/abajo para titulares, Enter para leer y `/` para buscar. Los campos mantienen su comportamiento habitual. También se puede usar Tab, ratón o pantalla táctil.
- Guardados y ambiente visual persistentes en `localStorage` de este navegador. Se conservan hasta 100 lecturas; no hay cuentas ni sincronización entre dispositivos.
- Tres ambientes: océano, atardecer y bosque. Diseño responsive y respeto por la preferencia de reducir movimiento.

## Comandos

| Comando         | Acción                                                                |
| --------------- | --------------------------------------------------------------------- |
| `npm run dev`   | Inicia React y Express juntos                                         |
| `npm test`      | Pruebas HTTP del backend con respuestas de GNews simuladas            |
| `npm run build` | Genera el frontend en `dist/`                                         |
| `npm start`     | Express sirve la API y el frontend compilado en http://127.0.0.1:3001 |

El servidor escucha únicamente en la interfaz local. La aplicación es una base para desarrollo local; antes de publicarla se debe definir el alojamiento y la política de acceso y cuota del proxy.

## Estructura

```text
APINoticias/
├── server/
│   ├── index.js       # Arranque y variables del entorno
│   ├── app.js         # API, validación, caché y archivos compilados
│   ├── demo.js        # Ejemplos ficticios por categoría
│   └── app.test.js    # Pruebas HTTP
├── src/
│   ├── App.jsx        # Interfaz e interacción
│   ├── main.jsx       # Entrada de React
│   └── styles.css     # Ambientes, ondas y estilos responsive
├── public/favicon.svg
├── .env.example
└── vite.config.js
```

Documentación consultada: [GNews: Top Headlines](https://docs.gnews.io/endpoints/top-headlines-endpoint), [Vite](https://vite.dev/guide/) y [Express 5](https://expressjs.com/en/guide/migrating-5/).

Las pruebas automatizadas usan un proveedor simulado. La integración real necesita una clave válida y cuota disponible; una prueba de demostración no verifica el servicio real de GNews.
