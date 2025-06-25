const { createCanvas, loadImage } = require("canvas");
const path = require("path");

async function generarImagen({ tipo = "welcome", nombreUsuario, fotoPerfilURL, totalMiembros, includeLogo = true }) {
  const ancho = 720, alto = 480;
  const canvas = createCanvas(ancho, alto);
  const ctx = canvas.getContext("2d");

  const fondoPath = path.join(__dirname, "fondos", tipo === "welcome" ? "welcome.jpg" : "bye.jpg");
  const fondo = await loadImage(fondoPath);
  ctx.drawImage(fondo, 0, 0, ancho, alto);

  // Imagen de perfil redonda
  try {
    const perfil = await loadImage(fotoPerfilURL);
    const tam = 130;
    const x = (ancho - tam) / 2;
    const y = tipo === "welcome" ? 100 : 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ancho / 2, y + tam / 2, tam / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(perfil, x, y, tam, tam);
    ctx.restore();
  } catch (e) {
    console.error("Error cargando imagen de perfil", e);
  }

  // Logo del bot
  if (includeLogo) {
    try {
      const logo = await loadImage(path.join(__dirname, "img", "logo.png"));
      const lw = 80, lh = 80;
      ctx.drawImage(logo, ancho - lw - 20, alto - lh - 20, lw, lh);
    } catch (e) {
      console.warn("No se pudo cargar logo.png");
    }
  }

  // Texto
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  if (tipo === "welcome") {
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("¡BIENVENIDO/A!", ancho / 2, 270);
    ctx.font = "24px sans-serif";
    ctx.fillText(`Disfruta tu estadía, ${nombreUsuario}`, ancho / 2, 310);
    ctx.fillText(`Ahora somos ${totalMiembros} miembros`, ancho / 2, 350);
  } else {
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("¡HASTA PRONTO!", ancho / 2, 270);
    ctx.font = "24px sans-serif";
    ctx.fillText(`${nombreUsuario} ha salido del grupo`, ancho / 2, 310);
    ctx.fillText(`Ahora somos ${totalMiembros} miembros`, ancho / 2, 350);
  }

  return canvas.toBuffer();
}

module.exports = { generarImagen };