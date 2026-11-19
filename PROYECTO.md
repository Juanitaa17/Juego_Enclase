# Jardín Virtual Colectivo

Documento de definición de proyecto para una aplicación web interactiva 3D de exploración y creación botánica colaborativa.

---

## 1. Qué hace la app
La aplicación es un **jardín virtual colectivo y persistente en 3D ambientado dentro de un único gran tropicario**, en el que cualquier persona registrada puede sumergirse a explorar las especies vegetales creadas por otros usuarios, así como diseñar y dar vida a su propia planta imaginaria mediante un editor tridimensional libre e intuitivo. 

El espacio central es un **gran invernadero de cristal de arquitectura botánica delicada**, concebido como un lugar inmersivo, vivo y sereno para recorrer a pie o con cámara libre. Cuenta con caminos, zonas de pasto y parcelas dedicadas para que los usuarios "siembren" sus creaciones. El ecosistema crece de manera colaborativa, donde la vegetación ambiental del invernadero acompaña sin opacar a las plantas creadas por los usuarios, que son las verdaderas protagonistas del lugar.

> **Enfoque inicial de desarrollo (Fase 1):** Concentrar todos los esfuerzos en el diseño, modelado, iluminación y experiencia de exploración del **Tropicario 3D**, asegurando una alta calidad visual, recorridos fluidos y la apreciación óptima de las plantas desde múltiples ángulos antes de expandir el resto de subsistemas.

---

## 2. Quién la usa
* **Público objetivo:** Personas con intereses artísticos, creativos o de diseño, entusiastas de la botánica, el modelado 3D y usuarios que buscan experiencias digitales relajantes, estéticas y contemplativas.
* **Plataforma y contexto de uso:** Aplicación web diseñada principalmente para computadores de escritorio (Desktop), aprovechando la precisión del cursor (mouse y teclado) para el modelado libre de partes 3D, la navegación en el espacio tridimensional y el disfrute visual en pantallas amplias.
* **Modelo de acceso:** Los usuarios acceden mediante registro formal con cuenta (correo electrónico y contraseña). Esto permite:
  * Identificar de forma unívoca la autoría de cada planta sembrada.
  * Mantener un perfil personal con la colección de especies creadas.
  * Gestionar una lista de plantas favoritas guardadas durante la exploración.

---

## 3. Qué elementos 3D tendrá y con qué estética (formas, colores, materiales)
### Arquitectura y entorno 3D (El Tropicario)
* **Estructura del invernadero:** Arquitectura de pabellón botánico con vigas y celosías de perfil fino y delicado (metal forjado estilizado o estructuras ligeras), techos altos abovedados o facetados con grandes paneles de cristal transparente.
* **Cúpula y visibilidad exterior:** El cielo exterior (suave, despejado o con nubes lentas y luz diurna) es visible en todo momento a través de la cristalería.
* **Suelo y zonificación:** 
  * Senderos peatonales y caminos delimitados con texturas orgánicas/piedra suave para transitar.
  * Zonas de pasto, bancales de tierra fértil y parterres destinados a la siembra de plantas creadas por la comunidad.
* **Vegetación ambiental de fondo:** Arbustos sutiles, helechos y enredaderas perimetrales que aportan vida, frescura y profundidad al invernadero, pero modelados y texturizados en una escala tonal contenida para no competir visualmente ni ocultar las plantas protagonistas creadas por los usuarios.

### Elementos 3D de las plantas (Protagonistas)
* **Morfologías de tallos botánicos:**
  * *Escapo erguido:* Tallo vertical clásico, estilizado y con conicidad natural.
  * *Arbusto ramificado (Mata leñosa):* Tronco achaparrado con ramas secundarias leñosas divergentes en 3D coronadas por múltiples capullos y flores.
  * *Voluble trepador (Zarcillo helicoidal):* Tallo dinámico en espiral vivaz con zarcillos de sujeción.
  * *Suculento acanalado (Cactoide / Euphorbia):* Tallo columnar carnoso con 6 costillas longitudinales profundas y espinas botánicas.
  * *Nudoso articulado (Bambú / Orquídea caña):* Segmentos cilíndricos con anillos nodales ensanchados bien definidos.
  * *Sinuoso flexuoso:* Curvaturas orgánicas en forma de S natural.
  * *Roseta basal:* Corona de hojas carnosas en espiral áurea a ras de suelo y escapo floral central.
* **Estructuras accesorias:** Acúleos/espinas botánicas en aristas, zarcillos enroscados elásticos y cáliz de sépalos de anclaje.
* **Follaje y floración:** Hojas tridimensionales en cuenco (cinta, oval, abanico) con orientación radial equilibrada a 360° en torno al tallo (filotaxis áurea distribuida en todos los cuadrantes sin concentrarse en un solo lado), pétalos multicapa rizados con ondulaciones orgánicas y centros florales auténticos (pistilos con anteras doradas, rosetas de micropétalos, espádices de lirio, rocío matutino).

### Estética, iluminación y materiales
* **Acabados botánicos táctiles (100% sólidos, sin transparencias fantasma):**
  * *Aterciopelado (Subsurface Sheen):* Microdispersión de luz suave como en pétalos de rosa o violetas africanas.
  * *Satinado ceroso (Cutícula tropical):* Brillo de barniz natural y carnoso (*Monstera*, *Ficus*, *Anthurium*).
  * *Mate celulósico:* Corteza leñosa y hojas aterronadas de textura suave.
  * *Nácar botánico:* Iridiscencia vegetal orgánica opaca.
* **Gradientes por vértice (Vertex Colors):** Cada pétalo, hoja y tallo incorpora transiciones cromáticas orgánicas desde la sombra del cáliz hasta la luz en los bordes y ápices.
* **Paleta cromática:**
  * *Escenario (Tropicario):* Tonos neutros, verde profundo vegetal, tierras suaves, blanco cálido y azul celeste suave del cielo exterior.
  * *Acentos en plantas:* Explosión controlada de color en pétalos, frutos y detalles vivos de las especies creadas por los usuarios.

---

## 4. Qué ve la persona en pantalla
La experiencia combina una **inmersión tridimensional en el gran Tropicario** con una **interfaz de usuario de estética editorial, minimalista y refinada**. La UI mantiene controles discretos y una composición cuidada para no competir con el entorno botánico.

### Identidad visual y tipografía
* **Título de entrada:** Tipografía de estilo *whimsy* (inspirada en Hyperbloom), expresiva, con curvas dinámicas y formas orgánicas que recuerdan el florecimiento y crecimiento de las enredaderas.
* **Tipografía de interfaz y soporte:** Fuente sans-serif contemporánea, ligera, limpia y altamente legible para controles, leyendas, coordenadas y fichas de información.

### Espacios y vistas de la pantalla
1. **Pantalla de Entrada:**
   * Título imponente en tipografía *whimsy*.
   * Fondo sutil con visualización desenfocada o render sereno del Tropicario.
   * Controles de acceso sencillos, rodeados de generoso espacio en blanco y atmósfera tranquila.
2. **Exploración del Gran Tropicario 3D (Fase Central):**
   * Vista panorámica del invernadero con vidrieras altas, entramado estructural delicado y el cielo visible de fondo.
   * Iluminación suave que baña los caminos de piedra, las zonas de pasto y la vegetación de acompañamiento.
   * Especies de los usuarios claramente identificables en los bancales de siembra.
   * Movimiento de cámara fluido: permite recorrer los senderos, elevar la vista hacia la cúpula y acercarse a contemplar cada planta desde ángulos variados.
3. **Inspección y Ficha Botánica:**
   * Al seleccionar una planta, la cámara realiza una transición suave hacia un plano cercano en ángulo favorable.
   * Se despliega una tarjeta editorial sobria con el nombre de la especie, descripción, autor y botón de reacción/favorito.
4. **Espacio / Taller de Edición (Fase posterior):**
   * Entorno orbital enfocado que permite rotar, acercar y examinar la planta en 360° mientras se construye.

---

## 5. Qué puede hacer
* **Recorrer e interactuar con el Tropicario:**
  * Desplazarse por los caminos del invernadero con controles suaves de navegación (WASD / flechas / mouse drag).
  * Inspeccionar el espacio desde múltiples perspectivas y ángulos para apreciar la arquitectura acristalada y el jardín vivo.
  * Seleccionar las plantas de otros usuarios para verlas en primer plano y consultar su ficha de autoría.
* **Reaccionar y guardar:** Dejar un "me gusta" y añadir plantas descubiertas a una lista personal de favoritas.
* **Construir y sembrar (Módulo de creación):**
  * Diseñar plantas con libertad morfológica completa (dibujar tallos, añadir ramas, modelar hojas/flores/frutos/espinas).
  * Modificar escala, rotación, posición, materiales (mate/brillo/translucidez) y color por pieza.
  * Asignar nombre, descripción y ubicar la planta en una zona disponible del Tropicario para sembrarla definitivamente.

---

## 6. Qué se comparte entre usuarios
* **El modelo 3D de la planta:** La geometría completa, las combinaciones de materiales y la paleta de color personalizada de cada espécimen pasan a formar parte del jardín global persistente.
* **Ficha de autoría e identidad:** El nombre de la especie, el texto descriptivo y la firma del creador registrado quedan visibles para cualquier visitante que inspeccione la planta.
* **Reconocimiento y reacciones:** Los "me gusta" y guardados como favoritos se comparten de forma visible, reconociendo el talento y la dedicación de cada autor dentro de la comunidad.
* **Un ecosistema colectivo en constante expansión:** El jardín en sí mismo como una obra viva y compartida, que refleja la suma de todas las creaciones individuales a lo largo del tiempo.
