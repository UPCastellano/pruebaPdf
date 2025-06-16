// API para buscar dentro de un documento específico por código o página
const { google } = require("googleapis")

const codigosPaginas = [
  {
    pdfId: "1S4AS3ZgN2i7XMj57EbE1XkILKkmfsk-T",
    nombre: "Documento A - Códigos 1619-1688",
    codigoInicio: 1619,
    codigoFin: 1688,
    paginaInicio: 2,
    paginaFin: 71,
    serie: "A",
    año: 2019,
  },
  {
    pdfId: "1BzgdLF_1nYANpfThTnt7sjAGCVqjJ82q",
    nombre: "Documento B - Códigos 1689-1755",
    codigoInicio: 1689,
    codigoFin: 1755,
    paginaInicio: 5,
    paginaFin: 72,
    serie: "B",
    año: 2020,
  },
  {
    pdfId: "1i5THNFxVBtcH-enXQEIj1IjYTedRy3_Q",
    nombre: "Documento C - Códigos 1757-1800",
    codigoInicio: 1757,
    codigoFin: 1800,
    paginaInicio: 4,
    paginaFin: 47,
    serie: "C",
    año: 2020,
  },
  {
    pdfId: "1INiU5qvRTxknI5IKzpDSLW6d-KYuf742",
    nombre: "Documento D - Códigos 1801-1851",
    codigoInicio: 1801,
    codigoFin: 1851,
    paginaInicio: 5,
    paginaFin: 55,
    serie: "D",
    año: 2021,
  },
  {
    pdfId: "1U8znCxJWEydIZjfq-YxXSJEDb5yZkvrR",
    nombre: "Documento E - Códigos 1851-1900",
    codigoInicio: 1851,
    codigoFin: 1900,
    paginaInicio: 4,
    paginaFin: 40,
    serie: "E",
    año: 2021,
  },
  {
    pdfId: "1ZQq8rJlzbwNVsXvQuGobeAuQJx6MQRyM",
    nombre: "Documento F - Códigos 1889-1939",
    codigoInicio: 1889,
    codigoFin: 1939,
    paginaInicio: 4,
    paginaFin: 40,
    serie: "F",
    año: 2022,
  },
  {
    pdfId: "1nMXBjzdXzCEAw9WBOItKPIeYXHblfGCN",
    nombre: "Documento G - Códigos 1940-1973",
    codigoInicio: 1940,
    codigoFin: 1973,
    paginaInicio: 4,
    paginaFin: 37,
    serie: "G",
    año: 2022,
  },
  {
    pdfId: "16LImseW0uSu9tZtmo1lrxgu32BxCZW6_",
    nombre: "Documento H - Códigos 1974-2017",
    codigoInicio: 1974,
    codigoFin: 2017,
    paginaInicio: 4,
    paginaFin: 47,
    serie: "H",
    año: 2023,
  },
  {
    pdfId: "1KqE5eWMOVcZvjmlQyd6RILEoKg2Gb384",
    nombre: "Documento I - Códigos 2018-2052",
    codigoInicio: 2018,
    codigoFin: 2052,
    paginaInicio: 4,
    paginaFin: 38,
    serie: "I",
    año: 2023,
  },
  {
    pdfId: "16ayDHQP-1040MkTaQgXNlMiCSq3dABvX",
    nombre: "Documento J - Códigos 2053-2071",
    codigoInicio: 2053,
    codigoFin: 2071,
    paginaInicio: 3,
    paginaFin: 21,
    serie: "J",
    año: 2024,
  },
  {
    pdfId: "18fzYtjJ9NA5_XEq9eC6Mn1PsrlKR-OJR",
    nombre: "Documento K - Códigos 2072-2099",
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

  const { pdfId, tipoBusqueda, valor } = req.query

  if (!pdfId) {
    return res.status(400).json({
      error: "PDF ID requerido",
      details: "Debe seleccionar un documento específico",
    })
  }

  if (!tipoBusqueda || !valor) {
    return res.status(400).json({
      error: "Parámetros de búsqueda requeridos",
      details: "Debe especificar tipo de búsqueda (codigo/pagina) y valor",
    })
  }

  try {
    // Encontrar el documento
    const documento = codigosPaginas.find((doc) => doc.pdfId === pdfId)
    if (!documento) {
      return res.status(404).json({
        error: "Documento no encontrado",
        details: `No se encontró el documento con ID: ${pdfId}`,
      })
    }

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

    // Obtener información del archivo
    const file = await drive.files.get({
      fileId: pdfId,
      fields: "id, name, size, modifiedTime, webViewLink, webContentLink",
    })

    let paginaDestino = null
    let codigoEncontrado = null
    let resultado = null

    if (tipoBusqueda === "codigo") {
      const codigoNum = Number.parseInt(valor)

      // Verificar que el código esté en el rango del documento
      if (codigoNum < documento.codigoInicio || codigoNum > documento.codigoFin) {
        return res.status(404).json({
          error: "Código fuera de rango",
          details: `El código ${codigoNum} no está en este documento. Rango válido: ${documento.codigoInicio}-${documento.codigoFin}`,
          documentoInfo: {
            nombre: documento.nombre,
            rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
            rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
          },
        })
      }

      // Calcular la página basada en el código
      const posicionEnRango = codigoNum - documento.codigoInicio
      paginaDestino = documento.paginaInicio + posicionEnRango
      codigoEncontrado = codigoNum

      resultado = {
        tipoBusqueda: "codigo",
        valorBuscado: codigoNum,
        paginaCalculada: paginaDestino,
        codigoEncontrado: codigoNum,
      }
    } else if (tipoBusqueda === "pagina") {
      const paginaNum = Number.parseInt(valor)

      // Verificar que la página esté en el rango del documento
      if (paginaNum < documento.paginaInicio || paginaNum > documento.paginaFin) {
        return res.status(404).json({
          error: "Página fuera de rango",
          details: `La página ${paginaNum} no está en este documento. Rango válido: ${documento.paginaInicio}-${documento.paginaFin}`,
          documentoInfo: {
            nombre: documento.nombre,
            rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
            rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
          },
        })
      }

      paginaDestino = paginaNum

      // Calcular el código aproximado basado en la página
      const posicionEnPaginas = paginaNum - documento.paginaInicio
      codigoEncontrado = documento.codigoInicio + posicionEnPaginas

      resultado = {
        tipoBusqueda: "pagina",
        valorBuscado: paginaNum,
        paginaDestino: paginaNum,
        codigoAproximado: codigoEncontrado,
      }
    } else {
      return res.status(400).json({
        error: "Tipo de búsqueda no válido",
        details: "Use 'codigo' o 'pagina'",
      })
    }

    // Crear URL del visor con la página específica
    const baseUrl = req.headers.host || "localhost:3000"
    const protocol = req.headers["x-forwarded-proto"] || "http"
    const visorUrl = `${protocol}://${baseUrl}/visualizador-documento.html?pdfId=${pdfId}&pagina=${paginaDestino}&nombre=${encodeURIComponent(documento.nombre)}`

    console.log(`✅ Búsqueda en documento: ${tipoBusqueda}=${valor} → página ${paginaDestino}`)

    res.status(200).json({
      success: true,
      documento: {
        id: documento.pdfId,
        nombre: documento.nombre,
        serie: documento.serie,
        año: documento.año,
        rangoCodigos: `${documento.codigoInicio}-${documento.codigoFin}`,
        rangoPaginas: `${documento.paginaInicio}-${documento.paginaFin}`,
        totalPaginas: documento.paginaFin - documento.paginaInicio + 1,
        totalCodigos: documento.codigoFin - documento.codigoInicio + 1,
      },
      busqueda: resultado,
      enlaces: {
        visorDirecto: visorUrl,
        googleDrive: file.data.webViewLink,
        descarga: file.data.webContentLink,
      },
      archivo: {
        nombre: file.data.name,
        tamaño: file.data.size ? `${Math.round(file.data.size / 1024)} KB` : "N/A",
        modificado: file.data.modifiedTime ? new Date(file.data.modifiedTime).toLocaleDateString("es-ES") : "N/A",
      },
      proyecto: "pdfbusqueda",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en búsqueda dentro del documento:", error)
    res.status(500).json({
      error: "Error en la búsqueda",
      details: error.message,
      proyecto: "pdfbusqueda",
    })
  }
}
