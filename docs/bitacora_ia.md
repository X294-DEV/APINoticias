#Prompt 1: Inicialización del proyecto

Vamos a trabajar en una aplicación web que tiene que consumir una API de noticias mediante una API Key, vamos a usar express y react para esto y el proyecto tendrá una apariencia inspirada en el XMB de Sony, esto lo haremos dentro de la carpeta "APINoticias".

#R1 Codex

Voy a preparar APINoticias con React y Express, dejando la API Key en el servidor y una interfaz de noticias inspirada en el XMB. Primero revisaré la carpeta y el contexto previo para integrar lo que ya exista.

El flujo será: React pedirá las noticias a Express y Express consultará al proveedor con la clave guardada en .env. La interfaz tendrá categorías horizontales, titulares verticales y navegación por teclado, siguiendo la idea del XMB.
Usaré la guía de Sites para la implementación y revisión visual local, dentro de la carpeta que indicaste.

¿Qué proveedor de noticias vamos a usar? Puedo avanzar con GNews y dejar la API Key pendiente de configurar.

La carpeta está libre y ya inicié la base del proyecto. Prepararé un modo de demostración claramente identificado para poder probar la navegación sin una clave; cuando se configure GNews, Express consultará las noticias reales.

#Prompt 2: Servicio a usar

Usaremos la API gratuita de GNews

#R2

Confirmado: usaremos GNews. La primera versión ya incluye ocho categorías, búsqueda, filtro por país, lecturas guardadas y tres ambientes visuales. Ahora verificaré los errores de la API, la navegación y la vista móvil.

Pasaron las nueve pruebas del backend y la compilación de React. En el navegador también confirmé el cambio de categorías y que las lecturas guardadas sobreviven a una recarga. Estoy ajustando el aviso de demostración en móvil; la consulta real a GNews queda pendiente de configurar una clave válida.

Creé ONDA en [APINoticias](E:/Projects_code/APINoticias), con React, Express y GNews.
Incluye apariencia inspirada en XMB, navegación por teclado, ocho categorías, búsqueda, filtro por país y noticias guardadas.
Para iniciarla:
cd E:\Projects_code\APINoticias
npm run dev
Abre localhost:5173.
Falta añadir tu clave en [`.env`](E:/Projects_code/APINoticias/.env), en NEWS_API_KEY, y reiniciar. Mientras tanto muestra ejemplos ficticios identificados.
Verificado: nueve pruebas aprobadas, compilación correcta y revisión en escritorio y móvil. La consulta real queda pendiente de una clave válida.

#Prompt 3: Preparación de repositorio GitHub

Bien, como te comento, vamos a tener que subir este proyecto a GitHub. Entonces hay que... te voy a pasar el link de este caso del repositorio al que vamos a subir este proyecto. Recuerda, como siempre, no se suben secretos ni APIs ni datos sensibles. Entonces vamos a proceder con esto. Te voy a proporcionar el link de repositorio para que podamos subirlo y trabajar el proyecto desde ahí. https://github.com/X294-DEV/APINoticias

#R3

El proyecto ya está subido a X294-DEV/APINoticias, en la rama main.
- Commit: 759a214.
- Excluidos .env, dependencias, compilados, logs y respaldos.
- No se detectaron credenciales en los archivos publicados.
- Nueve pruebas aprobadas y compilación correcta.
La carpeta local quedó vinculada al repositorio y sincronizada. La API Key permanece únicamente en tu .env local.

#Prompt 4: Instalación de API Key

He colocado la API key en .env, pero esta no funciona e incluso no registra peticiones desde el dashboard. Te pido que revises si fue correcto lo que realicé y de no serlo dime en qué fallé y corrígelo.

#R4

La clave estaba bien configurada. El problema era que React estaba funcionando, pero Express estaba detenido; por eso ninguna petición llegaba a GNews.
Ya inicié Express y verifiqué una consulta real:
- Respuesta HTTP 200.
- 10 noticias reales, sin usar caché.
- La clave permanece protegida y .env sigue excluido de GitHub.
Recarga la aplicación; ambos servidores están funcionando.
Para próximos arranques, ejecuta desde APINoticias:
npm run dev
Ese comando inicia React y Express juntos.

#Prompt 5: Botón de API Temporal

Vamos a realizar una pequeña adición y es que, como sabes, no podemos poner la API key en el repositorio, pero vamos a poner la opción en este programa, en este caso, que haya una pequeña opción, un iconito de un engranaje de configuración que tenga la opción de colocar la API key. En este caso presionas, se despliega en medio un pequeño cuadro de diálogo que dice: coloca tu API key personal para consultar noticias y un campo de texto simple que va a recolectar la API key, la va a guardar. Ojo, eso no se va a guardar en ninguna parte, solamente va a ser temporal y, en este caso, al guardarse esa API key se va a poder visualizar las noticias, en este caso, pues al haber colocado la API key se permite la comunicación ya con, en este caso, con el servicio con el que se haya conectado para que ya funcione. Porque, como recordas, no podemos compartir la API key, pero si alguien más descarga este proyecto y desea utilizar su propia API key, entonces vamos a implementar este campo para que ellos puedan usar correctamente esta aplicación web.

#R5

Implementado. Ahora puedes pulsar el engranaje, introducir tu clave y elegir “Usar clave temporal”.
- Solo permanece en memoria; se pierde al recargar o cerrar la pestaña.
- Puedes reemplazarla o pulsar “Olvidar clave”.
- No se guarda en archivos ni en el almacenamiento del navegador.
Verificado: 14 pruebas aprobadas, compilación correcta, revisión móvil y una consulta real con diez noticias.
Subido en el PR #1, pendiente de integrar a main. Ya puedes probarlo recargando la aplicación local.

#Errores detectados

- Falta de un botón u opción para agregar una API temporal (Sin ella la app no funciona).
- El Entorno solo funcionaba de manera local (Necesitaba probar si realmente era reactivo en otro dispositivo)

#¿Qué aprendí en esta practica?

-  Aprendí a ser mas especifico con la IA ya que si no le explicas detalladamente lo que quieres, esta puede divagar y hacer algo que no pediste ó incorrecto.
  


