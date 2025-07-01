// API para buscar dentro de un documento específico usando metadatos desde Cellar S3
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

  const { pdfId, tipoBusqueda, valor } = req.query;

  if (!pdfId) {
    return res.status(400).json({
      error: 'PDF ID requerido',
      details: 'Debe seleccionar un documento específico',
    });
  }

  if (!tipoBusqueda || !valor) {
    return res.status(400).json({
      error: 'Parámetros de búsqueda requeridos',
      details: 'Debe especificar tipo de búsqueda (codigo/pagina) y valor',
    });
  }

  try {
    const metadatos = await getMetadataFromS3();
    const documento = metadatos.find((doc) => doc.pdfId === pdfId);
    if (!documento) {
      return res.status(404).json({
        error: 'Documento no encontrado',
        details: `No se encontró el documento con ID: ${pdfId}`,
      });
    }

    let paginaDestino = null;
    let codigoEncontrado = null;
    let resultado = null;

    if (tipoBusqueda === 'codigo') {
      const codigoNum = Number.parseInt(valor);
      if (codigoNum < documento.codigoInicio || codigoNum > documento.codigoFin) {
        return res.status(404).json({
          error: 'Código fuera de rango',
          details: `El código ${codigoNum} no está en este documento. Rango válido: ${documento.codigoInicio}-${documento.codigoFin}`,
          documentoInfo: {
            nombre: documento.pdfId,
            rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
            rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
          },
        });
      }
      const posicionEnRango = codigoNum - documento.codigoInicio;
      paginaDestino = documento.paginaInicio + posicionEnRango;
      codigoEncontrado = codigoNum;
      resultado = {
        tipoBusqueda: 'codigo',
        valorBuscado: codigoNum,
        paginaCalculada: paginaDestino,
        codigoEncontrado: codigoNum,
      };
    } else if (tipoBusqueda === 'pagina') {
      const paginaNum = Number.parseInt(valor);
      if (paginaNum < documento.paginaInicio || paginaNum > documento.paginaFin) {
        return res.status(404).json({
          error: 'Página fuera de rango',
          details: `La página ${paginaNum} no está en este documento. Rango válido: ${documento.paginaInicio}-${documento.paginaFin}`,
          documentoInfo: {
            nombre: documento.pdfId,
            rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
            rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
          },
        });
      }
      paginaDestino = paginaNum;
      const posicionEnPaginas = paginaNum - documento.paginaInicio;
      codigoEncontrado = documento.codigoInicio + posicionEnPaginas;
      resultado = {
        tipoBusqueda: 'pagina',
        valorBuscado: paginaNum,
        paginaDestino: paginaNum,
        codigoAproximado: codigoEncontrado,
      };
    } else {
      return res.status(400).json({
        error: 'Tipo de búsqueda no válido',
        details: "Use 'codigo' o 'pagina'",
      });
    }

    res.status(200).json({
      success: true,
      documento: {
        id: documento.pdfId,
        nombre: documento.pdfId,
        serie: documento.serie,
        año: documento.año,
        rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
        rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
        totalPaginas: documento.paginaFin - documento.paginaInicio + 1,
        totalCodigos: documento.codigoFin - documento.codigoInicio + 1,
      },
      busqueda: resultado,
      archivo: {
        nombre: documento.pdfId,
        tamaño: 'N/A',
        modificado: 'N/A',
      },
      links: {
        visorDirecto: `/visor.html?pdfId=${encodeURIComponent(documento.pdfId)}&pagina=${paginaDestino}`,
        descarga: `https://pdfbuckets.cellar-c2.services.clever-cloud.com/${encodeURIComponent(documento.pdfId)}`
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error en búsqueda dentro del documento:', error);
    res.status(500).json({
      error: 'Error en la búsqueda',
      details: error.message,
    });
  }
};
