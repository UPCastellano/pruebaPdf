// API route corregida con mejor manejo de private key
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

  // Limpiar la clave
  let cleanKey = privateKey.trim()

  // Reemplazar \\n con \n reales
  cleanKey = cleanKey.replace(/\\n/g, "\n")

  // Si no tiene los headers, agregarlos
  if (!cleanKey.includes("-----BEGIN PRIVATE KEY-----")) {
    cleanKey = `-----BEGIN PRIVATE KEY-----\n${cleanKey}\n-----END PRIVATE KEY-----`
  }

  // Asegurar formato correcto
  cleanKey = cleanKey
    .replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n")
    .replace(/\s*-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----")

  return cleanKey
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    console.log("🚀 Iniciando búsqueda de PDFs...")

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({
        error: "Variables de entorno faltantes",
        details: "Verifica GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY y GOOGLE_DRIVE_FOLDER_ID",
        testUrl: `${req.headers.host}/api/test-credentials`,
      })
    }

    // Formatear la private key correctamente
    const formattedPrivateKey = formatPrivateKey(privateKey)

    if (!formattedPrivateKey) {
      return res.status(500).json({
        error: "Error en GOOGLE_PRIVATE_KEY",
        details: "La clave privada no se pudo formatear correctamente",
      })
    }

    console.log("🔑 Private key formateada correctamente")

    // Configurar autenticación
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Obtener PDFs específicos
    const pdfIds = codigosPaginas.map((item) => item.pdfId)
    const pdfDataPromises = pdfIds.map(async (pdfId) => {
      try {
        const file = await drive.files.get({
          fileId: pdfId,
          fields: "id, name, size, modifiedTime, webViewLink, webContentLink",
        })
        return file.data
      } catch (error) {
        console.error(`Error obteniendo PDF ${pdfId}:`, error.message)
        return null
      }
    })

    const pdfFiles = await Promise.all(pdfDataPromises)
    const validPdfFiles = pdfFiles.filter((file) => file !== null)

    console.log(`✅ Se encontraron ${validPdfFiles.length} archivos PDF`)

    // Formatear datos
    const formattedData = validPdfFiles.map((file) => {
      const codigoInfo = codigosPaginas.find((item) => item.pdfId === file.id)

      return {
        id: file.id,
        name: file.name || "Sin nombre",
        size: file.size ? `${Math.round(file.size / 1024)} KB` : "N/A",
        modified: file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString("es-ES") : "N/A",
        codigoInicio: codigoInfo?.codigoInicio || "N/A",
        codigoFin: codigoInfo?.codigoFin || "N/A",
        paginaInicio: codigoInfo?.paginaInicio || "N/A",
        paginaFin: codigoInfo?.paginaFin || "N/A",
        totalPaginas: codigoInfo ? codigoInfo.paginaFin - codigoInfo.paginaInicio + 1 : "N/A",
        totalCodigos: codigoInfo ? codigoInfo.codigoFin - codigoInfo.codigoInicio + 1 : "N/A",
        link: file.webViewLink || "#",
        downloadLink: file.webContentLink || "#",
      }
    })

    res.status(200).json({
      data: formattedData,
      recordsTotal: formattedData.length,
      recordsFiltered: formattedData.length,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Error en la API:", error)

    let errorResponse = {
      error: "Error al obtener datos de PDFs",
      details: error.message,
      code: error.code || "UNKNOWN_ERROR",
      timestamp: new Date().toISOString(),
    }

    if (error.message.includes("invalid_grant")) {
      errorResponse = {
        error: "Error de autenticación JWT",
        details: "Formato incorrecto de GOOGLE_PRIVATE_KEY",
        solucion: "Usa /api/test-credentials para diagnosticar el problema",
        testUrl: `/api/test-credentials`,
      }
    }

    res.status(500).json(errorResponse)
  }
}
