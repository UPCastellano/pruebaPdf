// API de búsqueda con manejo mejorado de private key
const { google } = require("googleapis")

const codigosPaginas = [
  {
    pdfId: "1S4AS3ZgN2i7XMj57EbE1XkILKkmfsk-T",
    codigoInicio: 1619,
    codigoFin: 1688,
    paginaInicio: 2,
    paginaFin: 71,
  },
  {
    pdfId: "1BzgdLF_1nYANpfThTnt7sjAGCVqjJ82q",
    codigoInicio: 1689,
    codigoFin: 1755,
    paginaInicio: 5,
    paginaFin: 72,
  },
  {
    pdfId: "1i5THNFxVBtcH-enXQEIj1IjYTedRy3_Q",
    codigoInicio: 1757,
    codigoFin: 1800,
    paginaInicio: 4,
    paginaFin: 47,
  },
  {
    pdfId: "1INiU5qvRTxknI5IKzpDSLW6d-KYuf742",
    codigoInicio: 1801,
    codigoFin: 1851,
    paginaInicio: 5,
    paginaFin: 55,
  },
  {
    pdfId: "1U8znCxJWEydIZjfq-YxXSJEDb5yZkvrR",
    codigoInicio: 1851,
    codigoFin: 1900,
    paginaInicio: 4,
    paginaFin: 40,
  },
  {
    pdfId: "1ZQq8rJlzbwNVsXvQuGobeAuQJx6MQRyM",
    codigoInicio: 1889,
    codigoFin: 1939,
    paginaInicio: 4,
    paginaFin: 40,
  },
  {
    pdfId: "1nMXBjzdXzCEAw9WBOItKPIeYXHblfGCN",
    codigoInicio: 1940,
    codigoFin: 1973,
    paginaInicio: 4,
    paginaFin: 37,
  },
  {
    pdfId: "16LImseW0uSu9tZtmo1lrxgu32BxCZW6_",
    codigoInicio: 1974,
    codigoFin: 2017,
    paginaInicio: 4,
    paginaFin: 47,
  },
  {
    pdfId: "1KqE5eWMOVcZvjmlQyd6RILEoKg2Gb384",
    codigoInicio: 2018,
    codigoFin: 2052,
    paginaInicio: 4,
    paginaFin: 38,
  },
  {
    pdfId: "16ayDHQP-1040MkTaQgXNlMiCSq3dABvX",
    codigoInicio: 2053,
    codigoFin: 2071,
    paginaInicio: 3,
    paginaFin: 21,
  },
  {
    pdfId: "18fzYtjJ9NA5_XEq9eC6Mn1PsrlKR-OJR",
    codigoInicio: 2072,
    codigoFin: 2099,
    paginaInicio: 3,
    paginaFin: 30,
  },
]

function formatPrivateKey(privateKey) {
  if (!privateKey) return null
  let cleanKey = privateKey.trim().replace(/\\n/g, "\n")
  if (!cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
    cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`
  }
  return cleanKey
    .replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n")
    .replace(/\s*-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----")
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  const { codigo } = req.query

  if (!codigo) {
    return res.status(400).json({
      error: "Código requerido",
      details: "Debe proporcionar un código para buscar",
    })
  }

  try {
    const codigoNum = Number.parseInt(codigo)
    const pdfInfo = codigosPaginas.find((item) => codigoNum >= item.codigoInicio && codigoNum <= item.codigoFin)

    if (!pdfInfo) {
      return res.status(404).json({
        error: "Código no encontrado",
        details: `El código ${codigo} no está en el rango de ningún PDF`,
      })
    }

    const formattedPrivateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: formattedPrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })
    const posicionEnRango = codigoNum - pdfInfo.codigoInicio
    const paginaCalculada = pdfInfo.paginaInicio + posicionEnRango

    const file = await drive.files.get({
      fileId: pdfInfo.pdfId,
      fields: "id, name, size, modifiedTime, webViewLink, webContentLink",
    })

    res.status(200).json({
      codigo: codigoNum,
      pdfId: pdfInfo.pdfId,
      nombrePdf: file.data.name,
      paginaCalculada: paginaCalculada,
      paginaInicio: pdfInfo.paginaInicio,
      paginaFin: pdfInfo.paginaFin,
      codigoInicio: pdfInfo.codigoInicio,
      codigoFin: pdfInfo.codigoFin,
      linkVisualizacion: file.data.webViewLink,
      linkDescarga: file.data.webContentLink,
      encontrado: true,
    })
  } catch (error) {
    console.error("Error buscando código:", error)
    res.status(500).json({
      error: "Error en la búsqueda",
      details: error.message,
    })
  }
}
