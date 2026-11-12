# Un nuevo amanecer

*Un nuevo amanecer* es un videojuego académico de plataformas 2D con desplazamiento lateral y terror psicológico. Tras recibir una llamada inquietante de su hermano menor, Michael, Harry regresa al orfanato para buscarlo. La niebla cubre el edificio y las pinturas de Michael revelan, poco a poco, lo ocurrido allí.

## Equipo

**Número del grupo** · 1

| Integrante |
| --- | 
| Anthony Alangasí|
| Anahí Achote    |
| Gary Defas      |
| Lindsay Guzmán  |

## Cómo ejecutar el proyecto

Usa un navegador moderno y **Node.js 24 con npm**, la versión con la que se probó el proyecto. Abre una terminal en la carpeta del proyecto y ejecuta lo siguiente.

```bash
npm ci
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) o la dirección que indique Vite en la terminal. Elige **Iniciar** para jugar desde la entrada o **Continuar** para cargar el último punto de control. `Enter` continúa si hay una partida guardada y empieza desde la entrada en la primera visita. Mantén la terminal abierta mientras juegas y presiona `Ctrl+C` para detener el servidor. En los siguientes arranques basta con `npm run dev` si las dependencias siguen instaladas.

Para generar y revisar la compilación de producción, ejecuta estos comandos.

```bash
npm run build
npm run preview
```

La compilación se genera en `dist/`. Abre [http://localhost:4173](http://localhost:4173) o la dirección que muestre la terminal.


## Controles

Usa la linterna para iluminar a La Sombra. El haz detiene su avance y, tras acumular suficiente exposición, la criatura desaparece. Puedes recuperar energía sobre una franja **Recarga** con la linterna apagada.

El contacto con La Sombra quita un punto de salud. Si Harry pierde los tres puntos, elige **Reintentar desde punto de control** o pulsa `R` para volver al último punto alcanzado.

| Acción | Escritorio | Móvil |
| --- | --- | --- |
| Moverse | `A` y `D` o flechas izquierda y derecha | Botones de dirección |
| Saltar | `Espacio` | Botón de salto |
| Activar o apagar la linterna | `J` o clic izquierdo | Botón de linterna |
| Pausar | `Esc` | Botón **Pausa** |

## Progreso de la Fase 5

La primera franja de recarga del pasillo funciona como punto de control. Al pasar por encima, el juego guarda el progreso en este navegador con `localStorage`. **Continuar** y **Reintentar desde punto de control** devuelven a Harry a ese punto con la salud y la linterna llenas. **Iniciar** vuelve a la entrada.

El menú de pausa permite continuar, reiniciar desde el punto de control, cambiar la preferencia de audio o volver al menú principal. La preferencia de audio queda guardada para cuando se incorporen los sonidos del juego. En dispositivos táctiles, los botones aparecen debajo del lienzo y permiten moverse y saltar a la vez.


## Créditos

- **Desarrollo y diseño del juego** · Por completar con los integrantes del equipo.
- **Fachada del orfanato** · Ilustración SVG provisional creada para el prototipo.
- **Herramientas** · [Phaser](https://phaser.io/) y [Vite](https://vite.dev/).
