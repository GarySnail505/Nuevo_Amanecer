// Tamaño base del lienzo dibujado por Michael
const ART_WIDTH = 150;
const ART_HEIGHT = 112;

// Función que dibuja el recuerdo "Nuestro primer día"
// Se usa fillStyle(color) seguido de la figura geométrica a pintar
function drawCourtyard(painting) {

    // Cielo y Sol
    painting.fillStyle(0xc8a481).fillRect(-67, -48, 134, 96);
    painting.fillStyle(0xd5b567).fillCircle(-44, -26, 11);

    // Rayos del sol
    painting.lineStyle(3, 0xd5b567);
    painting.lineBetween(-44, -43, -43, -39);
    painting.lineBetween(-61, -34, -57, -31);
    painting.lineBetween(-30, -33, -26, -36);

    // Edificio del orfanato (Techo, paredes y ventanas)
    painting.fillStyle(0x8e9372).fillRect(-67, 26, 134, 22);
    painting.fillStyle(0xc1a181).fillTriangle(14, 22, -3, 48, 36, 48);
    painting.fillStyle(0xa7725f).fillRect(-19, -9, 59, 35);
    painting.fillStyle(0x744d49).fillTriangle(-26, -8, 8, -32, 47, -8);
    painting.fillStyle(0x745746).fillRect(7, 9, 12, 17);
    painting.fillStyle(0xdac192).fillRect(-12, 0, 10, 11).fillRect(26, -1, 8, 10);

    // Siluetas de los niños
    painting.fillStyle(0xb77962).fillCircle(-51, 15, 5);
    painting.fillStyle(0x6d7f84).fillCircle(-35, 9, 6);
    painting.lineStyle(4, 0x645049);
    painting.lineBetween(-51, 20, -49, 34);
    painting.lineBetween(-35, 15, -37, 34);
    painting.lineBetween(-49, 25, -36, 22);
    painting.lineBetween(-49, 34, -55, 41);
    painting.lineBetween(-37, 34, -31, 43);
}

// Función que dibuja el recuerdo "No me sueltes"
function drawBedroom(painting) {
    // Fondo de la habitación y detalles (camas, ventana)
    painting.fillStyle(0x68616a).fillRect(-67, -48, 134, 96);
    painting.fillStyle(0x514953).fillRect(-67, 28, 134, 20);
    painting.fillStyle(0x918078).fillRect(31, -39, 29, 33);
    painting.fillStyle(0x444756).fillRect(35, -35, 21, 25);
    painting.fillStyle(0xd9c58f).fillCircle(44, -24, 7);
    painting.fillStyle(0x444756).fillCircle(47, -27, 6);

    painting.fillStyle(0x9b7864).fillRect(-54, -3, 7, 44).fillRect(-54, 29, 101, 8);
    painting.fillStyle(0xc0a48e).fillRoundedRect(-47, 8, 29, 18, 4);
    painting.fillStyle(0xb98d74).fillCircle(-32, 11, 8);
    painting.fillStyle(0x83948b).fillRoundedRect(-28, 16, 68, 15, 4);
    painting.lineStyle(3, 0xa0a397).lineBetween(-17, 20, 26, 23);

    painting.fillStyle(0xb98d74).fillCircle(19, -13, 8);
    painting.fillStyle(0x483a42).fillRect(11, -19, 16, 5);
    painting.fillStyle(0x9d746d).fillRoundedRect(12, -5, 17, 23, 4);
    painting.lineStyle(5, 0xbc9178).lineBetween(14, 0, -12, 12);
    painting.lineStyle(4, 0xbc9178).lineBetween(-27, 16, -12, 12);
}

// Se exporta la función constructora principal que inicializa un objeto Graphics
// en la escena en los que actuarán los fillRect
export function drawPainting(scene, paintingId, x, y, width, height) {
    const painting = scene.add.graphics().setPosition(x, y);

    painting.fillStyle(0x4a382f).fillRect(-75, -56, ART_WIDTH, ART_HEIGHT);
    painting.lineStyle(3, 0xbc8e69).strokeRect(-73, -54, 146, 108);
    painting.fillStyle(0xd0ae87).fillRect(-67, -48, 134, 96);

    if (paintingId === 'nuestro-primer-dia') {
        drawCourtyard(painting);
    } else if (paintingId === 'no-me-sueltes') {
        drawBedroom(painting);
    }

    return painting.setScale(Math.min(width / ART_WIDTH, height / ART_HEIGHT));
}