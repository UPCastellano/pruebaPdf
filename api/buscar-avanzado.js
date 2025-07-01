// API de búsqueda avanzada usando metadatos desde Cellar S3
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'eu-west-1',
  endpoint: 'https://cellar-c2.services.clever-cloud.com',
  credentials: {
    accessKeyId: 'ZN5VDGLT6HAM4J9MQRF8',
    secretAccessKey: 'uKC3tr0Dqi7C6WAY9sVmW7PDmFCSJ7RuqPFN747M',
  },
  forcePathStyle: true,
});

const BUCKET = 'pdfbuckets';
const METADATA_FILE = 'pdf-metadata.json';

async function getMetadataFromS3() {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: METADATA_FILE,
  });
  const response = await s3.send(command);
  const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
  const jsonString = await streamToString(response.Body);
  return JSON.parse(jsonString);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { tipo, valor, serie, año, codigoInicio, codigoFin } = req.query;

  if (!tipo || !valor) {
    return res.status(400).json({
      error: 'Parámetros requeridos',
      details: "Debe proporcionar 'tipo' y 'valor' para la búsqueda",
      tiposDisponibles: ['codigo', 'serie', 'año', 'rango', 'pagina'],
    });
  }

  try {
    const metadatos = await getMetadataFromS3();
    let resultados = [];
    switch (tipo.toLowerCase()) {
      case 'codigo': {
        const codigoNum = Number.parseInt(valor);
        const pdfPorCodigo = metadatos.find(
          (item) => codigoNum >= item.codigoInicio && codigoNum <= item.codigoFin
        );
        if (pdfPorCodigo) resultados = [pdfPorCodigo];
        break;
      }
      case 'serie': {
        resultados = metadatos.filter((item) => (item.serie || '').toLowerCase() === valor.toLowerCase());
        break;
      }
      case 'año': {
        const añoNum = Number.parseInt(valor);
        resultados = metadatos.filter((item) => item.año === añoNum);
        break;
      }
      case 'rango': {
        const inicioRango = Number.parseInt(codigoInicio);
        const finRango = Number.parseInt(codigoFin);
        resultados = metadatos.filter(
          (item) =>
            (inicioRango >= item.codigoInicio && inicioRango <= item.codigoFin) ||
            (finRango >= item.codigoInicio && finRango <= item.codigoFin) ||
            (inicioRango <= item.codigoInicio && finRango >= item.codigoFin)
        );
        break;
      }
      case 'pagina': {
        const paginaNum = Number.parseInt(valor);
        resultados = metadatos.filter(
          (item) => paginaNum >= item.paginaInicio && paginaNum <= item.paginaFin
        );
        break;
      }
      default:
        return res.status(400).json({
          error: 'Tipo de búsqueda no válido',
          tiposDisponibles: ['codigo', 'serie', 'año', 'rango', 'pagina'],
        });
    }
    if (resultados.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron resultados',
        details: `No hay PDFs que coincidan con ${tipo}: ${valor}`,
      });
    }
    resultados = resultados.map(pdf => ({
      ...pdf,
      linkVisualizacion: `/visor.html?pdfId=${encodeURIComponent(pdf.pdfId)}&pagina=${pdf.paginaInicio || 1}`,
      linkDescarga: `https://pdfbuckets.cellar-c2.services.clever-cloud.com/${encodeURIComponent(pdf.pdfId)}`
    }));
    res.status(200).json({
      success: true,
      tipoBusqueda: tipo,
      valorBuscado: valor,
      resultadosEncontrados: resultados.length,
      resultados,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({
      error: 'Error en la búsqueda avanzada',
      details: error.message,
    });
  }
};
