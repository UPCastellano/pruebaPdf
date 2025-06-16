// API de prueba rápida con las credenciales correctas del proyecto pdfbusqueda
const { google } = require("googleapis")

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  try {
    console.log("🧪 Probando con credenciales hardcodeadas del proyecto pdfbusqueda...")

    // Credenciales correctas del archivo JSON proporcionado
    const testCredentials = {
      client_email: "pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIbv1qglam9V6L
5Vra7dLxYfXG0N3VPLfNw3zYVZg+Xg0cQfhf8mZ2g6woS+BWpyNZtZsvse+HHvXg
nYkEqbpf1NICXeLpY+34EEy1Oz8vueOYNr6wGE0Kh0DKiQgXSiskEFanjJFmJjYY
0lSMTdjYAunWPFgY6iRblbOsB/5le55+bumqYG0FNoWNOrs0m/LyHgor1tfT+7Mj
YJAJkmVPwJM8fBDEqeaJcosGo/4YqRUSF8mn91Z9CR1Qz7sIhc3pEMDWUUXphwQ9
ymdlU5zDuAk7cIe3NYwCe9Hs04EU4eN/C0ektrZxBfjbvqafAI3cG9g9uj6Ghlfe
WNFWWGklAgMBAAECggEACIkpg6qvVAbpEt4eo2ozbJI2bFQizlz6mumzXGcwx58r
wcNRd4yULoHnCARLNoWBrOVeCYbzY3a/E+TBnBA6XrBqjS1AZ54Y2VKgYat3QmoR
Nj9Gmas/RK6D5Nw3Gv7OnYeQmSwUWRxRe3choKQEExb0rGn/engmOjxC3ZWtkNbC
k+0nbxRYzI9mDR+HLfkXCLLi90WRehpabxWaqf0872t8pT9Q9mbkSzWIBNHF6RUy
i6C3vi8dw2hGgGwgTp/0ibfVEDI4Leo2SXlwZNdROnH9IlR3V9NBmsjfsdX199XY
kMeXdvNILJFJjsjwmzjisKsVmQaesJf4FdoEZZEP9QKBgQDu+3SZlIW2XSN/qEfu
wRGjpbGp1tYG6uBxJoQ/ZQqy5RIMcy2FYZUEtdisH72h7l4+e5pCwTiXaN7bE+E6
cXC0zZEOiElqZV0g509RMR9yPlZC13y2yzbM78NrwYSL7ZVfWYkWBtV0mvaB0h1a
fGoP0ziddftV24b75ICFku1cYwKBgQDWtM7lBdKnKe++wsYxfAu7F8gJ6gE0vFxs
gdslS3nDDM9bhG0RsikW1VwetZJdvNs+tb5u4Pq9A0jPnIqj7S/GT6fMt/H+LOYV
/3Xe3ngI+Nd+oi1yyXO++kcrID3SxqO1WDeZrE3BKXyDOu5+HAfHXNXQR38Yb68J
/d8PigyG1wKBgQCQX4jJX1iIGyxe6qLKMgkd+/OgzxDtjOeac9JhGgGkoY6Nxucx
NQp5lgIXufUt5ns49CL1QRWXItu/Lfta+z1DfQys4ti3VhU004ivXCXLNq2WI+hL
5ehtVkuQxY/1mMosmEKg8+/wSc2yD+V7zL2mYcxKFASKkdyyQBEEoQaUUQKBgQDV
ZixlMV5oS6RAY/L9aB94u3BVekHsmnL6Xi7kaJoDJY5LldmaRwvT6AiBdVKe3IDF
WXqHVhGhH8yUnTCnMa3UW4OaVBGv4gxmPNx4wYFo2XvGH4cwmc3zOWrXEFqiTlCU
g7Pvh3RY0tUw0bgNm+qXWkwhkY5fSVIeijfUiA9fTQKBgEecFhbiyO9OZvifjBiP
H3MifATbgAFzuc8Mblm02Xc9LBI136YcqghQaWqCLJfxGppyFqBJJx/sqNoCvDJ9
SgzyUWpEtfFWsEKE2QG/6tqgJbuigShHKaNmHnf2vpRdpe1NjRxBWaLF9xa90iaK
mVnTVDdQov9o/+na7hmhfiKd
-----END PRIVATE KEY-----`,
    }

    console.log("🔑 Usando credenciales del proyecto pdfbusqueda")
    console.log("📧 Service Account:", testCredentials.client_email)

    const auth = new google.auth.GoogleAuth({
      credentials: testCredentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Probar acceso básico a Google Drive
    console.log("🔍 Probando acceso básico a Google Drive...")
    const response = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name)",
    })

    console.log("✅ Acceso básico a Google Drive exitoso!")

    // Probar acceso específico a la carpeta de PDFs
    console.log("📁 Probando acceso a la carpeta específica...")
    const folderResponse = await drive.files.list({
      q: "'18W0EM6vs0sJ1M0Qrpu6HC2r32ZQ8IIgV' in parents and mimeType='application/pdf'",
      pageSize: 5,
      fields: "files(id, name, size)",
    })

    console.log("✅ Acceso a carpeta específica exitoso!")

    // Probar obtener un PDF específico
    console.log("📄 Probando acceso a PDF específico...")
    try {
      const pdfTest = await drive.files.get({
        fileId: "1S4AS3ZgN2i7XMj57EbE1XkILKkmfsk-T",
        fields: "id, name, size, webViewLink",
      })
      console.log("✅ Acceso a PDF específico exitoso!")
    } catch (pdfError) {
      console.log("⚠️ Error accediendo a PDF específico:", pdfError.message)
    }

    res.status(200).json({
      success: true,
      message: "🎉 Credenciales hardcodeadas funcionan correctamente",
      proyecto: "pdfbusqueda",
      serviceAccount: testCredentials.client_email,
      pruebas: {
        accesoBasico: {
          exitoso: true,
          archivosEncontrados: response.data.files?.length || 0,
          ejemplos: response.data.files || [],
        },
        carpetaEspecifica: {
          exitoso: true,
          pdfsEncontrados: folderResponse.data.files?.length || 0,
          ejemplos: folderResponse.data.files || [],
        },
      },
      diagnostico: {
        credencialesCorrectas: true,
        formatoPrivateKey: "Correcto (hardcodeado)",
        accesoGoogleDrive: true,
        accesoACarpeta: folderResponse.data.files?.length > 0,
      },
      solucion:
        "Las credenciales funcionan cuando están hardcodeadas. Si la aplicación principal falla, el problema está en el formato de las variables de entorno en Vercel.",
      siguientesPasos: [
        "1. Verifica que las variables de entorno en Vercel tengan exactamente estos valores",
        "2. Asegúrate de que GOOGLE_PRIVATE_KEY incluya los \\n literales",
        "3. Redespliega después de configurar las variables",
        "4. Prueba /api/test-credentials para verificar las variables de entorno",
      ],
    })
  } catch (error) {
    console.error("❌ Error con credenciales hardcodeadas:", error)

    res.status(500).json({
      error: "Error incluso con credenciales hardcodeadas",
      details: error.message,
      proyecto: "pdfbusqueda",
      serviceAccount: "pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
      diagnostico: {
        problema: error.message.includes("invalid_grant") ? "JWT Signature inválida" : "Error de configuración",
        posiblesCausas: [
          "Service Account no tiene permisos",
          "Google Drive API no está habilitada",
          "Carpeta no está compartida con el service account",
          "Credenciales incorrectas o expiradas",
        ],
      },
      solucion: [
        "1. Verifica que la carpeta esté compartida con: pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
        "2. Verifica que Google Drive API esté habilitada en el proyecto pdfbusqueda",
        "3. Verifica que las credenciales sean las correctas del archivo JSON",
      ],
    })
  }
}
