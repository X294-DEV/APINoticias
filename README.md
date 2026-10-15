# ONDA · API de noticias

Aplicación local de noticias con **React + Vite**, **Express** y **GNews**. La interfaz toma del XMB las categorías horizontales, los titulares verticales y una navegación tranquila por teclado, con una identidad propia.

## Iniciar

Requiere Node.js 22.12 o posterior (se utilizó Node 24).

```powershell
git clone https://github.com/X294-DEV/APINoticias.git
cd APINoticias
npm ci
npm run dev
```

Abre **http://127.0.0.1:5173**. Vite envía las peticiones `/api` al servidor Express en el puerto 3001. Si cambias `PORT`, actualiza también el proxy en `vite.config.js`.

Sin clave se activa una **demostración con artículos ficticios**, claramente identificada en pantalla. El país y el idioma se aplican a las consultas reales; la demostración solo filtra por categoría y texto.

## Conectar GNews con una clave temporal

1. Obtén tu propia clave en [GNews](https://gnews.io/).
2. Pulsa el **engranaje de configuración** de la cabecera.
3. Introduce tu API Key y pulsa **Usar clave temporal**. Se cargarán las noticias con esa clave.
4. Puedes reemplazarla o pulsar **Olvidar clave** desde el mismo diálogo.

La clave personal solo vive en el estado de React durante la sesión de la página. **No se escribe en archivos, cookies, localStorage ni sessionStorage.** Se pierde al recargar o cerrar la pestaña. Cancelar el diálogo descarta el texto que no hayas aplicado.

React envía la clave por la cabecera `X-News-Api-Key` a Express en cada consulta. Express la usa únicamente durante esa petición y la reenvía a GNews mediante `X-Api-Key`, sin incluirla en URLs, respuestas ni logs. Las consultas personales no usan la caché ni las promesas compartidas del servidor. Una clave personal tiene prioridad sobre la configuración del servidor, incluso en modo `demo`; si GNews la rechaza se muestra el error, sin utilizar la clave del servidor como reemplazo.

## Clave predeterminada en el servidor (opcional)

Para mantener la configuración local anterior, copia `.env.example` a `.env` y configura tu clave allí:

```dotenv
NEWS_API_KEY=tu_clave
NEWS_MODE=auto
PORT=3001
```

Reinicia `npm run dev` después de modificar `.env`. `auto` usa noticias reales cuando hay una clave; `demo` fuerza los ejemplos y `live` exige una clave. Una clave inválida muestra un error y no sustituye silenciosamente los resultados por ejemplos.

La clave predeterminada de `.env` permanece únicamente en Express. No uses un nombre `VITE_` ni la subas al repositorio. `.env` está excluido con `.gitignore`; `.env.example` contiene solo la plantilla vacía. Al olvidar una clave personal o recargar, se vuelve a usar esta configuración predeterminada; sin clave predeterminada se muestran los ejemplos en modo `auto`.

## Trabajar desde GitHub

El repositorio es [X294-DEV/APINoticias](https://github.com/X294-DEV/APINoticias). Para nuevos cambios, crea una rama desde `main`, valida con `npm test` y `npm run build`, y abre un pull request para revisarlos. Cada persona introduce su propia clave temporal o configura su `.env` local; las claves no se comparten mediante Git.

El repositorio incluye código fuente, pruebas y el archivo de dependencias bloqueadas. Se excluyen `.env`, `node_modules/`, `dist/`, logs, copias de seguridad y archivos de claves privadas.

## Cómo fluye la información

```text
React → GET /api/news → Express → GNews
React ← artículos JSON ← Express ← respuesta de GNews
```

1. React mantiene la categoría, la búsqueda y el país seleccionados.
2. `fetch()` envía una petición a Express. Si hay una clave personal temporal, la incluye en una cabecera, nunca en la URL.
3. Express valida los filtros y usa la clave personal o la predeterminada del servidor para consultar `top-headlines` de GNews.
4. Express normaliza la respuesta y la devuelve a React. Solo las consultas con la clave predeterminada del servidor usan una caché de cinco minutos y agrupación de peticiones; las personales no se comparten ni se almacenan.
5. React muestra los estados de carga, error, vacío o resultados. La noticia completa se abre en la fuente original.

En `src/App.jsx`, **async** permite declarar una función asíncrona; **await** espera el resultado de `fetch()` y de **response.json()**, que convierte el cuerpo JSON en datos de JavaScript. **try** contiene la operación que puede fallar y **catch** permite mostrar un error comprensible. Al cambiar los filtros se cancela la petición anterior para evitar resultados desactualizados.

## Funciones

- Ocho categorías: para ti, mundo, tecnología, negocios, ciencia, deportes, cultura y bienestar.
- Búsqueda por texto dentro de la categoría seleccionada; pulsa Enter o la lupa para enviarla.
- Filtro por país; las noticias reales se solicitan en español.
- Flechas izquierda/derecha para categorías, arriba/abajo para titulares, Enter para leer y `/` para buscar. Los campos mantienen su comportamiento habitual. También se puede usar Tab, ratón o pantalla táctil.
- Guardados y ambiente visual persistentes en `localStorage` de este navegador. Se conservan hasta 100 lecturas; no hay cuentas ni sincronización entre dispositivos.
- Tres ambientes: océano, atardecer y bosque. Diseño responsive y respeto por la preferencia de reducir movimiento.
- Engranaje para introducir, reemplazar u olvidar una API Key personal temporal.

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
│   ├── ApiKeyDialog.jsx # Diálogo de clave temporal
│   ├── main.jsx       # Entrada de React
│   └── styles.css     # Ambientes, ondas y estilos responsive
├── public/favicon.svg
├── .env.example
└── vite.config.js
```

Documentación consultada: [GNews: Top Headlines](https://docs.gnews.io/endpoints/top-headlines-endpoint), [GNews: autenticación por cabecera](https://docs.gnews.io/authentication), [Vite](https://vite.dev/guide/) y [Express 5](https://expressjs.com/en/guide/migrating-5/).

Las pruebas automatizadas usan un proveedor simulado. La integración real necesita una clave válida y cuota disponible; una prueba de demostración no verifica el servicio real de GNews.
