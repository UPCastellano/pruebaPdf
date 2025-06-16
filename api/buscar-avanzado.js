// API de búsqueda avanzada por serie, número de página, o rango
const { google } = require("googleapis")

const codigosPaginas = [
  {
    pdfId: "1S4AS3ZgN2i7XMj57EbE1XkILKkmfsk-T",
    codigoInicio: 1619,
    codigoFin: 1688,
    paginaInicio: 2,
    paginaFin: 71,
    serie: "A",
    año: 2019,
  },
  {
    pdfId: "1BzgdLF_1nYANpfThTnt7sjAGCVqjJ82q",
    codigoInicio: 1689,
    codigoFin: 1755,
    paginaInicio: 5,
    paginaFin: 72,
    serie: "B",
    año: 2020,
  },
  {
    pdfId: "1i5THNFxVBtcH-enXQEIj1IjYTedRy3_Q",
    codigoInicio: 1757,
    codigoFin: 1800,
    paginaInicio: 4,
    paginaFin: 47,
    serie: "C",
    año: 2020,
  },
  {
    pdfId: "1INiU5qvRTxknI5IKzpDSLW6d-KYuf742",
    codigoInicio: 1801,
    codigoFin: 1851,
    paginaInicio: 5,
    paginaFin: 55,
    serie: "D",
    año: 2021,
  },
  {
    pdfId: "1U8znCxJWEydIZjfq-YxXSJEDb5yZkvrR",
    codigoInicio: 1851,
    codigoFin: 1900,
    paginaInicio: 4,
    paginaFin: 40,
    serie: "E",
    año: 2021,
  },
  {
    pdfId: "1ZQq8rJlzbwNVsXvQuGobeAuQJx6MQRyM",
    codigoInicio: 1889,
    codigoFin: 1939,
    paginaInicio: 4,
    paginaFin: 40,
    serie: "F",
    año: 2022,
  },
  {
    pdfId: "1nMXBjzdXzCEAw9WBOItKPIeYXHblfGCN",
    codigoInicio: 1940,
    codigoFin: 1973,
    paginaInicio: 4,
    paginaFin: 37,
    serie: "G",
    año: 2022,
  },
  {
    pdfId: "16LImseW0uSu9tZtmo1lrxgu32BxCZW6_",
    codigoInicio: 1974,
    codigoFin: 2017,
    paginaInicio: 4,
    paginaFin: 47,
    serie: "H",
    año: 2023,
  },
  {
    pdfId: "1KqE5eWMOVcZvjmlQyd6RILEoKg2Gb384",
    codigoInicio: 2018,
    codigoFin: 2052,
    paginaInicio: 4,
    paginaFin: 38,
    serie: "I",
    año: 2023,
  },
  {
    pdfId: "16ayDHQP-1040MkTaQgXNlMiCSq3dABvX",
    codigoInicio: 2053,
    codigoFin: 2071,
    paginaInicio: 3,
    paginaFin: 21,
    serie: "J",
    año: 2024,
  },
  {
    pdfId: "18fzYtjJ9NA5_XEq9eC6Mn1PsrlKR-OJR",
    codigoInicio: 2072,
    codigoFin: 2099,
    paginaInicio: 3,
    paginaFin: 30,
    serie: "K",
    año: 2024,
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

  const { tipo, valor, serie, año, codigoInicio, codigoFin } = req.query

  if (!tipo || !valor) {
    return res.status(400).json({
      error: "Parámetros requeridos",
      details: "Debe proporcionar 'tipo' y 'valor' para la búsqueda",
      tiposDisponibles: ["codigo", "serie", "año", "rango", "pagina"],
    })
  }

  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!clientEmail || !privateKey) {
      return res.status(500).json({
        error: "Credenciales faltantes",
        details: "Verifica las variables de entorno del proyecto pdfbusqueda",
      })
    }

    const formattedPrivateKey = formatPrivateKey(privateKey)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })
    let resultados = []

    // Búsqueda por tipo
    switch (tipo.toLowerCase()) {
      case "codigo":
        const codigoNum = Number.parseInt(valor)
        const pdfPorCodigo = codigosPaginas.find(
          (item) => codigoNum >= item.codigoInicio && codigoNum <= item.codigoFin,
        )
        if (pdfPorCodigo) {
          resultados = [pdfPorCodigo]
        }
        break

      case "serie":
        resultados = codigosPaginas.filter((item) => item.serie?.toLowerCase() === valor.toLowerCase())
        break

      case "año":
        const añoNum = Number.parseInt(valor)
        resultados = codigosPaginas.filter((item) => item.año === añoNum)
        break

      case "rango":
        const inicioRango = Number.parseInt(codigoInicio)
        const finRango = Number.parseInt(codigoFin)
        resultados = codigosPaginas.filter(
          (item) =>
            (inicioRango >= item.codigoInicio && inicioRango <= item.codigoFin) ||
            (finRango >= item.codigoInicio && finRango <= item.codigoFin) ||
            (inicioRango <= item.codigoInicio && finRango >= item.codigoFin),
        )
        break

      case "pagina":
        const paginaNum = Number.parseInt(valor)
        resultados = codigosPaginas.filter((item) => paginaNum >= item.paginaInicio && paginaNum <= item.paginaFin)
        break

      default:
        return res.status(400).json({
          error: "Tipo de búsqueda no válido",
          tiposDisponibles: ["codigo", "serie", "año", "rango", "pagina"],
        })
    }

    if (resultados.length === 0) {
      return res.status(404).json({
        error: "No se encontraron resultados",
        details: `No hay PDFs que coincidan con ${tipo}: ${valor}`,
        sugerencias: [
          "Verifica que el valor sea correcto",
          "Prueba con diferentes criterios de búsqueda",
          "Usa la búsqueda por rango para mayor flexibilidad",
        ],
      })
    }

    // Obtener información detallada de cada PDF encontrado
    const pdfDataPromises = resultados.map(async (pdfInfo) => {
      try {
        const file = await drive.files.get({
          fileId: pdfInfo.pdfId,
          fields: "id, name, size, modifiedTime, webViewLink, webContentLink, thumbnailLink",
        })

        return {
          ...pdfInfo,
          nombre: file.data.name,
          tamaño: file.data.size ? `${Math.round(file.data.size / 1024)} KB` : "N/A",
          modificado: file.data.modifiedTime ? new Date(file.data.modifiedTime).toLocaleDateString("es-ES") : "N/A",
          linkVisualizacion: file.data.webViewLink,
          linkDescarga: file.data.webContentLink,
          thumbnail: file.data.thumbnailLink,
          totalPaginas: pdfInfo.paginaFin - pdfInfo.paginaInicio + 1,
          totalCodigos: pdfInfo.codigoFin - pdfInfo.codigoInicio + 1,
        }
      } catch (error) {
        console.error(`Error obteniendo PDF ${pdfInfo.pdfId}:`, error.message)
        return null
      }
    })

    const pdfDetails = await Promise.all(pdfDataPromises)
    const validResults = pdfDetails.filter((pdf) => pdf !== null)

    console.log(`✅ Búsqueda ${tipo}:${valor} - ${validResults.length} resultados encontrados`)

    res.status(200).json({
      success: true,
      tipoBusqueda: tipo,
      valorBuscado: valor,
      resultadosEncontrados: validResults.length,
      resultados: validResults,
      proyecto: "pdfbusqueda",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en búsqueda avanzada:", error)
    res.status(500).json({
      error: "Error en la búsqueda avanzada",
      details: error.message,
      proyecto: "pdfbusqueda",
    })
  }
}
