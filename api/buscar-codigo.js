// API de búsqueda por código usando metadatos desde Cellar S3
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

  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({
      error: 'Código requerido',
      details: 'Debe proporcionar un código para buscar',
    });
  }

  try {
    const codigoNum = Number.parseInt(codigo);
    const metadatos = await getMetadataFromS3();
    const pdfInfo = metadatos.find(
      (item) => codigoNum >= item.codigoInicio && codigoNum <= item.codigoFin
    );
    if (!pdfInfo) {
      return res.status(404).json({
        error: 'Código no encontrado',
        details: `El código ${codigo} no está en el rango de ningún PDF`,
      });
    }
    const posicionEnRango = codigoNum - pdfInfo.codigoInicio;
    const paginaCalculada = pdfInfo.paginaInicio + posicionEnRango;
    res.status(200).json({
      codigo: codigoNum,
      pdfId: pdfInfo.pdfId,
      nombrePdf: pdfInfo.pdfId,
      paginaCalculada: paginaCalculada,
      paginaInicio: pdfInfo.paginaInicio,
      paginaFin: pdfInfo.paginaFin,
      codigoInicio: pdfInfo.codigoInicio,
      codigoFin: pdfInfo.codigoFin,
      encontrado: true,
      timestamp: new Date().toISOString(),
      linkVisualizacion: `/visor.html?url=${encodeURIComponent(`https://pdfbuckets.cellar-c2.services.clever-cloud.com/${pdfInfo.pdfId}`)}&name=${encodeURIComponent(pdfInfo.pdfId)}&page=${paginaCalculada}`,
      linkDescarga: `https://pdfbuckets.cellar-c2.services.clever-cloud.com/${encodeURIComponent(pdfInfo.pdfId)}`,
    });
  } catch (error) {
    console.error('Error buscando código:', error);
    res.status(500).json({
      error: 'Error en la búsqueda',
      details: error.message,
    });
  }
};
