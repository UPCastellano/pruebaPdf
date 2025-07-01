// API para listar PDFs y sus metadatos desde Cellar S3
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
  // Leer el stream y convertir a string
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metadata = await getMetadataFromS3();
    // Formatear datos para DataTables
    const formattedData = metadata.map((file) => ({
      id: file.pdfId,
      name: file.pdfId,
      size: 'N/A', // No tenemos tamaño aquí, se puede mejorar si se requiere
      modified: 'N/A', // No tenemos fecha aquí, se puede mejorar si se requiere
      codigoInicio: file.codigoInicio,
      codigoFin: file.codigoFin,
      paginaInicio: file.paginaInicio,
      paginaFin: file.paginaFin,
      totalPaginas: file.paginaFin && file.paginaInicio ? (file.paginaFin - file.paginaInicio + 1) : 'N/A',
      totalCodigos: file.codigoFin && file.codigoInicio ? (file.codigoFin - file.codigoInicio + 1) : 'N/A',
      link: '#', // Aquí podrías construir el link de descarga si lo necesitas
      downloadLink: '#',
    }));

    res.status(200).json({
      data: formattedData,
      recordsTotal: formattedData.length,
      recordsFiltered: formattedData.length,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error leyendo metadatos desde S3:', error);
    res.status(500).json({
      error: 'Error al obtener datos de PDFs desde Cellar S3',
      details: error.message,
    });
  }
};
