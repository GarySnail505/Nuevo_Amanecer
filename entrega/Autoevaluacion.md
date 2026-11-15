# Autoevaluación de Un nuevo amanecer

**Grupo 1**

Cada integrante debe revisar la evidencia y completar la valoración y la justificación. La columna de evidencia indica dónde comprobar cada criterio en el juego o en el repositorio.

| Criterio | Peso | Evidencia para revisar | Valoración y justificación del equipo |
| --- | ---: | --- | --- |
| Funcionalidad principal | 20 % | Recorrido de cinco niveles, derrota, reintento y desenlace | **Cumple.** Se juegan los cinco niveles, desde la introducción hasta el final con Michael. Al perder la salud o caer al vacío se puede reintentar desde el último punto de control, y el progreso se guarda en `localStorage`. |
| Mecánicas | 15 % | Linterna, batería, enemigos, pinturas y puntaje | **Cumple.** La linterna consume y recarga energía, hay seis tipos de enemigo, 12 pinturas coleccionables con puntaje y récord, y la luz también revela plataformas y frena peligros. |
| Física y colisiones | 10 % | Saltos, plataformas, peligros y contacto con enemigos | **Cumple.** Arcade Physics con saltos, plataformas estáticas, plataformas que ceden, brasas y manos. El contacto resta salud, con invulnerabilidad breve y retroceso. Las hitboxes son simples. |
| Arquitectura y modularidad | 15 % | Escenas, entidades, sistemas, datos e interfaz en `src/` | **Cumple.** `src/` separa escenas, entidades, sistemas, datos e interfaz, y los niveles y pinturas se definen como datos. El punto débil es que `MovementScene` concentra demasiada responsabilidad. |
| Rendimiento y optimización | 10 % | Fluidez durante el recorrido y el combate en distintos tamaños de pantalla | **Cumple.** El arte se genera con formas simples, los audios se liberan al salir de cada escena y el lienzo se ajusta con `Scale.FIT`. |
| UX/UI | 10 % | Menú, HUD, pausa, puntos de control y galería | **Cumple.** Hay menú principal, HUD con energía, salud, puntos y punto de control, menú de pausa y galería de recuerdos. Los textos son pequeños y el guardado de puntos de control no avisa. |
| Audio e inmersión | 5 % | Ambiente, aviso, golpe de Rencor y control de audio | **Cumple.** Música de menú y de exploración, efectos de Harry, y ambiente, aviso y golpe propios en la pelea con Rencor. El botón de audio silencia todo y guarda la preferencia. |
| Responsividad y controles táctiles | 5 % | Ajuste del lienzo, movimiento y salto simultáneos | **Cumple.** El lienzo se adapta a la pantalla y los botones  permiten moverse y saltar a la vez, con margen para el área segura. |
| Código limpio y documentación | 5 % | Nombres, responsabilidades y comentarios de los módulos | **Cumple.** Módulos pequeños, nombres claros y comentarios en los archivos principales. |
| README, video y presentación | 5 % | Guía de ejecución, demostración y capturas | **Cumple.** El README explica ejecución, controles, niveles y estructura. `entrega/` incluye video, capturas y ZIP. |

**Fortalezas y evidencia**

- Juego completo: cinco niveles, jefe final, derrota, reintento y guardado (`levels.js`, `RunMenuScene.js`, `SaveStore.js`).
- La linterna es la mecánica central y se usa de varias formas: descubre pinturas, vence enemigos, revela plataformas y derrota a Rencor (`FlashlightSystem.js`, `Shadow.js`).
- Controles táctiles funcionales con multitoque (`TouchControls.js`).
- Historia integrada en la jugabilidad mediante las pinturas, el video de introducción y el audio (`paintings.js`, `IntroScene.js`).

**Limitaciones observadas**

- El arte es provisional: Harry y los enemigos son figuras simples sin animación.
- `MovementScene` es muy extensa y conviene dividirla.
- La carga inicial es pesada y no hay pantalla de progreso.
- Los textos del HUD son pequeños y los puntos de control no avisan al guardarse.

**Mejoras futuras y su prioridad**

| Prioridad | Mejora |
| --- | --- |
| Alta | Dividir `MovementScene` en módulos y renombrar lo heredado del prototipo |
| Media | Añadir pantalla de carga y aligerar el video de introducción |
| Media | Medir el rendimiento en móviles y mejorar la legibilidad del HUD |


**Bono propuesto y justificación**

Proponemos el bono por el **combate de Rencor**. Es un jefe con ciclo propio (espera, aviso, golpe y exposición) implementado en `RencorFight.js`, separado de su parte visual. Cada ataque se anuncia con una marca en el suelo, un sonido y un texto, y el punto débil solo se vence con la linterna, lo que aprovecha la mecánica central. Además cuenta con ambiente, aviso y golpe de audio propios.
