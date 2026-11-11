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

Abre [http://localhost:5173](http://localhost:5173) o la dirección que indique Vite en la terminal. Desde el título, haz clic en **Probar movimiento** o pulsa `Enter` para entrar a la escena de prueba. Mantén la terminal abierta mientras juegas y presiona `Ctrl+C` para detener el servidor. En los siguientes arranques basta con `npm run dev` si las dependencias siguen instaladas.

Para generar y revisar la compilación de producción, ejecuta estos comandos.

```bash
npm run build
npm run preview
```

La compilación se genera en `dist/`. Abre [http://localhost:4173](http://localhost:4173) o la dirección que muestre la terminal.


## Controles

En la escena de prueba puedes moverte y saltar con el teclado. Las demás acciones y los controles táctiles se incorporarán en fases posteriores.

| Acción | Escritorio | Móvil |
| --- | --- | --- |
| Moverse | `A` y `D` o flechas izquierda y derecha | Botones de dirección |
| Saltar | `Espacio` | Botón de salto |
| Activar o apagar la linterna | `J` o clic izquierdo | Botón de linterna |
| Interactuar | `E` | Botón contextual |
| Pausar | `Esc` | Por definir |


## Créditos

- **Desarrollo y diseño del juego** · Por completar con los integrantes del equipo.
- **Fachada del orfanato** · Ilustración SVG provisional creada para el prototipo.
- **Herramientas** · [Phaser](https://phaser.io/) y [Vite](https://vite.dev/).
