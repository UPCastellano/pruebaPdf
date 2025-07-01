// Script para generar pdf-metadata.json a partir de los PDFs en Cellar S3
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');

// Configuración de Cellar S3
const s3 = new S3Client({
  region: 'eu-west-1', // Cellar usa esta región
  endpoint: 'https://cellar-c2.services.clever-cloud.com',
  credentials: {
    accessKeyId: 'ZN5VDGLT6HAM4J9MQRF8',
    secretAccessKey: 'uKC3tr0Dqi7C6WAY9sVmW7PDmFCSJ7RuqPFN747M',
  },
  forcePathStyle: true,
});

const BUCKET = 'pdfbuckets';

async function generarMetadata() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
    });
    const response = await s3.send(command);
    const archivos = response.Contents || [];
    const pdfs = archivos.filter(obj => obj.Key.endsWith('.pdf'));

    const metadata = pdfs.map(pdf => ({
      pdfId: pdf.Key,
      codigoInicio: null,
      codigoFin: null,
      paginaInicio: 1,
      paginaFin: null,
      serie: '',
      año: null
    }));

    fs.writeFileSync('pdf-metadata.json', JSON.stringify(metadata, null, 2), 'utf-8');
    console.log(`✅ Archivo pdf-metadata.json generado con ${metadata.length} PDFs.`);
  } catch (error) {
    console.error('Error generando metadatos:', error);
  }
}

generarMetadata(); 