const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');

async function welcome({ name, member, pp, bg }) {
    const canvas = createCanvas(1024, 500);
    const ctx = canvas.getContext('2d');

    // Cargar fondo
    const background = await loadImage(bg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Cargar foto de perfil
    let profileImage;
    try {
        const response = await axios.get(pp, { responseType: 'arraybuffer' });
        const profilePicBuffer = Buffer.from(response.data, 'binary');
        profileImage = await loadImage(profilePicBuffer);
    } catch (err) {
        console.error('Error cargando imagen de perfil:', err);
        profileImage = await loadImage('https://telegra.ph/file/265c67242d6c5c9c6cab9.jpg');
    }

    // Dibujar imagen de perfil (círculo)
    ctx.save();
    ctx.beginPath();
    ctx.arc(170, 250, 120, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(profileImage, 50, 130, 240, 240);
    ctx.restore();

    // Dibujar texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('Bienvenido', 400, 200);
    ctx.font = 'bold 50px Arial';
    ctx.fillText(member, 400, 270);
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`a ${name}`, 400, 340);

    return canvas.toBuffer();
}

module.exports = { welcome };