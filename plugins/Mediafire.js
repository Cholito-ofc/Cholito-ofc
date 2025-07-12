async function mediafire(url) {
  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/115.0.0.0 Safari/537.36'
    }
  });

  const $ = cheerio.load(data);

  const filename = $(".dl-btn-label").attr("title") || $("a#downloadButton").text().trim();
  if (!filename) throw new Error("No se encontró el nombre del archivo.");

  const extMatch = filename.match(/\.([0-9a-z]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "bin";
  const mimetype = lookup(ext) || `application/${ext}`;

  const download = $("a#downloadButton").attr("href");
  if (!download) throw new Error("No se pudo extraer el enlace de descarga.");

  const sizeText = $(".download_file_info span").text().trim();
  const sizeMatch = sizeText.match(/\((.*?)\)/);
  const size = sizeMatch ? sizeMatch[1] : "desconocido";

  let uploadDate = "No disponible";
  const dataCreation = $("[data-creation]").attr("data-creation");
  if (dataCreation && !isNaN(dataCreation)) {
    const date = new Date(parseInt(dataCreation) * 1000);
    uploadDate = date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  return { filename, ext, mimetype, size, download, uploadDate, url };
}