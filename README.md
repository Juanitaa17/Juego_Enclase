# 🌿 Tropicario — Jardín Botánico Colectivo 3D

> **Una experiencia web interactiva tridimensional de contemplación, exploración botánica y creación comunitaria.**

[![En vivo en Render](https://img.shields.io/badge/Demo-En%20Vivo%20en%20Render-brightgreen?style=for-the-badge&logo=render)](https://juego-enclase.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Juego__Enclase-181717?style=for-the-badge&logo=github)](https://github.com/Juanitaa17/Juego_Enclase)

**🌐 Enlace directo para probar la aplicación:**  
👉 **[https://juego-enclase.onrender.com](https://juego-enclase.onrender.com)**

---

## 📖 ¿Qué es Tropicario?

**Tropicario** es un espacio virtual interactivo en 3D ambientado bajo la cúpula de un gran invernadero botánico de cristal y luz natural suave. Combina dos experiencias en una sola aplicación:

1. **Un Jardín Colectivo para Explorar:** Un ecosistema en constante crecimiento donde habitan plantas sembradas por la comunidad. Los visitantes pueden recorrer los senderos, inspeccionar cada planta, leer sus historias y fichas botánicas, dejar notas de campo y marcar sus especies favoritas.
2. **Un Taller Creativo 3D (Editor de Especies):** Un estudio interactivo donde cualquier persona, sin saber modelar en 3D, puede diseñar su propia especie vegetal imaginaria combinando diferentes tipos de tallos, espinas, follajes, flores multicapa y colores, para luego sembrarla en el jardín o descargarla en formato 3D (`.glb`).

---

## ✨ Características Principales

### 🏛️ 1. Invernadero Botánico 3D en Tiempo Real
* **Arquitectura de Cristal:** Bóveda de cristal translúcido con vigas metálicas, bancales circulares de piedra, praderas y senderos de arenisca suave.
* **Cámara de Recorrido Libre:** Controles orbitales intuitivos (clic y arrastrar para rotar, rueda para acercar/alejar, clic derecho para desplazar).
* **Vistas Rápidas:** Botones para saltar automáticamente a la **Entrada**, a la **Plaza Central** o a la **Vista Aérea**.
* **Brisa Procedural:** La vegetación se mece suave y naturalmente con el viento del invernadero.

### 🌅 2. Atmósferas y Ciclos Horarios
Permite cambiar el clima y la iluminación del invernadero con un solo clic:
* **☀️ Mediodía:** Luz suave y diurna con cielo celeste claro.
* **🌅 Ocaso:** Tonos dorados y cobrizos, sombras alargadas y luz cálida de atardecer.
* **🌙 Noche Bioluminiscente:** Cielo azul nocturno profundo, enjambres de **luciérnagas brillantes flotantes** y flores que emiten su propia **luz bioluminiscente**.

### 🍃 3. Taller Botánico 3D (Creador de Especies)
Un editor tridimensional completo con vista previa en 360° en tiempo real:
* **7 Morfologías de Tallo:** Espiral voluble, arbusto leñoso con múltiples ramas, tallo erguido clásico, suculento acanalado con espinas, bambú nudoso, tallo sinuoso en S y roseta basal.
* **Follaje Realista a 360°:** Hojas acanaladas (cinta, ovaladas o en abanico) distribuidas radialmente sin cargarse a un solo lado.
* **Floración Multicapa y Personalizable:** De 1 a 4 capas de pétalos (loto, orquídea, corona, estrella, campana) con centros auténticos (pistilos dorados, rosetas, lirios o gotas de rocío).
* **Acabados Fotorrealistas:** Texturas sólidas aterciopeladas (*sheen*), satinadas cerosas o mates celulósicas.
* **Descarga 3D (.glb):** Permite exportar cualquier planta diseñada para abrirla en Blender o imprimirla en 3D.

### 💬 4. Fichas Botánicas y Comunidad
* Haz clic sobre cualquier planta para enfocarla y abrir su ficha.
* Descubre su nombre científico/común, creador, descripción poética y rasgos botánicos.
* Deja observaciones o notas de campo colaborativas.
* Dale "Me gusta" o guárdala en tus favoritas.
* **Guardado Automático:** Todo lo que creas y comentas se guarda automáticamente en tu navegador (`localStorage`).

### 🎵 5. Audio Procedural Relajante (Web Audio API)
* Generador de brisa natural y viento suave sintetizado matemáticamente en tiempo real.
* Campanillas de cristal armonizadas en escala pentatónica relajante.
* Botón de silencio/activación (`🔈 / 🔊`) en la barra superior.

---

## 🕹️ Cómo Usar la Aplicación

1. **Entrar al Jardín:** En la pantalla inicial, haz clic en **"Entrar al Jardín"** (o en **"Crear una Especie"** si quieres diseñar directamente).
2. **Navegar:**
   - **Girar la vista:** Clic izquierdo y arrastra el ratón.
   - **Zoom:** Usa la rueda del ratón o el gesto de pellizcar en el trackpad.
   - **Moverte:** Clic derecho y arrastra.
   - **Cambiar de vista:** Usa los botones superiores (`Entrada`, `Plaza Central`, `Vista Aérea`).
3. **Cambiar la hora del día:** Usa los botones `☀️ Día`, `🌅 Ocaso` y `🌙 Noche` en la esquina superior.
4. **Inspeccionar una planta:** Haz un clic sobre cualquier planta sembrada para leer su ficha botánica y dejar notas.
5. **Crear tu planta:** Haz clic en el botón superior **"+ Crear Especie"**, ajusta sus características y presiona **"Sembrar en el Tropicario"**.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3:** Maquetación semántica, diseño editorial responsivo y tipografías orgánicas (*Fraunces* y *Plus Jakarta Sans*).
* **JavaScript (ES6+):** Lógica modular, estado global, persistencia local y sincronización de eventos.
* **Three.js (WebGL):** Motor de gráficos 3D en tiempo real para renderizado PBR, luces, sombras, partículas y materiales.
* **Web Audio API:** Síntesis sonora procedural en tiempo real sin archivos de audio pesados.
* **Blender:** Modelado base, exportación de mallas GLB y referencias volumétricas.
* **Render:** Despliegue continuo en la nube para acceso web público.

---

## 📁 Estructura del Proyecto

```text
Juego_Enclase/
├── index.html                           # Estructura principal y modales de la interfaz
├── styles.css                           # Estilos editoriales, diseño responsive y temas
├── app.js                              # Lógica principal del jardín 3D, cámara, audio y UI
├── plantGenerator.js                    # Motor matemático de generación de plantas 3D
├── tropicario.glb                       # Modelo 3D del invernadero exportado desde Blender
├── tropicario.blend                     # Archivo fuente original de Blender
├── render_tropicario_vista_principal.png # Render de referencia visual
├── ENTREGA.md                           # Documento formal de entrega académica
├── PROYECTO.md                          # Definición conceptual y técnica del proyecto
├── README.md                            # Documento descriptivo principal del repositorio
└── .gitignore                           # Exclusión de archivos innecesarios
```

---

## 👩‍💻 Autora
* **Juanita Martínez**  
* *Materia: Inteligencia Artificial Generativa / Juego en Clase*
