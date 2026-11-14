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

function drawPaper(painting, wall, floor) {
    painting.fillStyle(wall).fillRect(-67, -48, 134, 96);
    painting.fillStyle(floor).fillRect(-67, 29, 134, 19);
}

function drawFigure(painting, x, y, color, facing = 1) {
    painting.fillStyle(color).fillCircle(x, y, 6);
    painting.lineStyle(4, color).lineBetween(x, y + 6, x - 1, y + 19);
    painting.lineBetween(x, y + 10, x + 10 * facing, y + 7);
    painting.lineBetween(x - 1, y + 19, x - 6, y + 27);
    painting.lineBetween(x - 1, y + 19, x + 4, y + 27);
}

function drawCrayonLine(painting, color, points, width = 3) {
    painting.lineStyle(width, color).beginPath();
    painting.moveTo(...points[0]);
    for (const point of points.slice(1)) {
        painting.lineTo(...point);
    }
    painting.strokePath();
}

function drawChildren(painting) {
    drawPaper(painting, 0xa49382, 0x778370);
    painting.fillStyle(0x8a665b).fillRect(-67, 9, 134, 15);
    painting.lineStyle(2, 0xb9947a).lineBetween(-66, 14, 66, 14);
    drawFigure(painting, -38, 11, 0xa47b63);
    drawFigure(painting, 6, 1, 0x6a5f75, -1);
    drawFigure(painting, 23, -3, 0x6a5f75, -1);
    drawFigure(painting, 42, 3, 0x6a5f75, -1);
    drawCrayonLine(painting, 0x775c68, [[5, -14], [11, -19], [14, -13], [21, -18], [27, -14], [34, -17]]);
}

function drawEmptyChair(painting) {
    drawPaper(painting, 0x817a83, 0x57545c);
    painting.fillStyle(0x9c8b7e).fillRect(30, -37, 18, 22);
    painting.fillStyle(0x606872).fillRect(33, -34, 12, 16);
    painting.fillStyle(0x997965).fillRect(-26, -25, 29, 23).fillRect(-24, 12, 42, 7);
    drawCrayonLine(painting, 0x634d53, [[-25, -24], [-21, 13], [-22, 39]], 5);
    drawCrayonLine(painting, 0x634d53, [[2, -24], [6, 14], [15, 38]], 5);
    painting.fillStyle(0x4a474e).fillEllipse(2, 40, 48, 7);
}

function drawSharedRoom(painting) {
    drawPaper(painting, 0x8f7c7f, 0x605662);
    drawFigure(painting, -37, 0, 0x554555);
    drawFigure(painting, 39, -7, 0x5c586c, -1);
    painting.fillStyle(0x976d64).fillRect(-27, 11, 53, 7).fillRect(-23, 18, 4, 21).fillRect(15, 18, 4, 21);
    painting.fillStyle(0xc1a38c).fillTriangle(-13, 8, 7, 4, 17, 12);
    drawCrayonLine(painting, 0xb09287, [[34, -8], [40, -5], [45, -8], [35, -6], [43, -5]], 2);
}

function drawFire(painting) {
    drawPaper(painting, 0x645563, 0x473c49);
    painting.fillStyle(0x554c55).fillEllipse(-1, -25, 91, 27).fillEllipse(28, -12, 57, 21);
    painting.fillStyle(0x93514e).fillTriangle(-43, 33, -19, -22, 27, 34);
    painting.fillStyle(0xb96d54).fillTriangle(-30, 33, 4, -13, 32, 33);
    painting.fillStyle(0xd19762).fillTriangle(-12, 34, 7, 4, 21, 34);
    painting.fillStyle(0xc2a488).fillRect(-50, 28, 21, 9).fillRect(29, 34, 27, 8);
    drawCrayonLine(painting, 0x8d706b, [[-63, 16], [-47, 18], [-8, 12], [27, 16], [63, 14]]);
}

function drawAwakening(painting) {
    drawPaper(painting, 0x554957, 0x413948);
    drawFigure(painting, -40, 10, 0xb08070);
    painting.fillStyle(0x37303f).fillEllipse(23, 6, 65, 57).fillCircle(30, -19, 17);
    drawCrayonLine(painting, 0x382e3d, [[14, -21], [12, -41], [27, -28], [38, -37], [44, -16]], 6);
    painting.fillStyle(0x9c6365).fillCircle(31, -18, 3).fillCircle(40, -16, 3);
    drawCrayonLine(painting, 0x6d465a, [[-29, 7], [-19, 1], [-12, 11], [-2, 4], [9, 6]]);
}

function drawDoor(painting) {
    drawPaper(painting, 0x514453, 0x413643);
    painting.fillStyle(0x312b3a).fillRect(12, -37, 45, 76);
    painting.fillStyle(0x755561).fillRect(12, -37, 6, 76).fillRect(50, -37, 7, 76).fillRect(12, -37, 45, 6);
    painting.fillStyle(0xc3976e).fillCircle(38, 7, 3);
    drawFigure(painting, -18, 6, 0xa27776);
    drawFigure(painting, -39, 13, 0x776677);
    drawCrayonLine(painting, 0x9a606a, [[-5, -16], [2, -25], [8, -14], [15, -18], [22, -10]]);
}

function drawFather(painting) {
    drawPaper(painting, 0x4a4151, 0x342f3e);
    painting.fillStyle(0x7a626d).fillRect(-37, -33, 73, 65);
    painting.fillStyle(0x5d505f).fillRect(-32, -28, 63, 55);
    drawFigure(painting, -3, -13, 0x9e7a75);
    drawCrayonLine(painting, 0x3a303e, [[-57, -17], [-27, -23], [-21, -7], [6, -17], [2, -1], [43, -10], [35, 11], [58, 13]], 6);
    drawCrayonLine(painting, 0x493240, [[-43, 5], [-9, -4], [-14, 8], [16, 6], [7, 21], [43, 17]], 4);
}

function drawDeparture(painting) {
    drawPaper(painting, 0x534858, 0x3c3547);
    painting.fillStyle(0x685462).fillTriangle(-59, 47, 49, -28, 29, 47);
    drawFigure(painting, -36, 10, 0xa67b78);
    drawFigure(painting, 33, -12, 0x857582, -1);
    drawCrayonLine(painting, 0x42374b, [[11, -20], [21, -11], [18, 1], [38, -1], [27, 12], [52, 14], [46, 20]], 5);
    drawCrayonLine(painting, 0x856576, [[-18, 15], [-9, 12], [-2, 16]]);
}

function drawMonster(painting) {
    drawPaper(painting, 0x443645, 0x302b39);
    drawCrayonLine(painting, 0x2a2435, [[-57, 22], [-53, -8], [-38, -30], [-24, -9], [-7, -36], [9, -16], [30, -34], [38, -17], [54, -20], [61, 21]], 8);
    painting.fillStyle(0x2a2435).fillEllipse(2, 11, 119, 52);
    painting.fillStyle(0xa96669).fillEllipse(-22, -3, 13, 7).fillEllipse(26, -5, 12, 7);
    painting.fillStyle(0x734a5d).fillEllipse(4, 16, 34, 30);
    drawFigure(painting, 3, 12, 0xc08f7c);
}

function drawBrothers(painting) {
    drawPaper(painting, 0x706077, 0x595260);
    painting.fillStyle(0xcea273).fillCircle(21, 17, 18);
    painting.fillStyle(0x8c6c77).fillRect(-67, 24, 134, 7);
    drawCrayonLine(painting, 0x524656, [[-62, -26], [-45, -34], [-36, -23], [-19, -27]], 5);
    drawCrayonLine(painting, 0x524656, [[43, -10], [56, -21], [63, -13]], 5);
    drawFigure(painting, -18, 8, 0xaf8379);
    drawFigure(painting, 2, 4, 0xa59a96, -1);
}

const artworkById = new Map([
    ['nuestro-primer-dia', drawCourtyard],
    ['no-me-sueltes', drawBedroom],
    ['los-ninos-del-patio', drawChildren],
    ['la-silla-vacia', drawEmptyChair],
    ['la-habitacion-de-los-dos', drawSharedRoom],
    ['la-noche-del-fuego', drawFire],
    ['algo-desperto', drawAwakening],
    ['la-voz-detras-de-la-puerta', drawDoor],
    ['el-ultimo-dibujo-de-papa', drawFather],
    ['harry-no-te-vayas', drawDeparture],
    ['el-monstruo-que-hice', drawMonster],
    ['mi-hermano', drawBrothers],
]);

// Se exporta la función constructora principal que inicializa un objeto Graphics
// en la escena en los que actuarán los fillRect
export function drawPainting(scene, paintingId, x, y, width, height) {
    const painting = scene.add.graphics().setPosition(x, y);

    painting.fillStyle(0x4a382f).fillRect(-75, -56, ART_WIDTH, ART_HEIGHT);
    painting.lineStyle(3, 0xbc8e69).strokeRect(-73, -54, 146, 108);
    painting.fillStyle(0xd0ae87).fillRect(-67, -48, 134, 96);

    artworkById.get(paintingId)?.(painting);

    return painting.setScale(Math.min(width / ART_WIDTH, height / ART_HEIGHT));
}
