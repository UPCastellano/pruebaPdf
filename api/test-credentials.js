// API para probar las nuevas credenciales del proyecto pdfbusqueda
const { google } = require("googleapis")

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  let diagnostico

  try {
    console.log("🔍 Probando nuevas credenciales del proyecto pdfbusqueda...")

    // Verificar variables de entorno
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    diagnostico = {
      timestamp: new Date().toISOString(),
      proyecto: "pdfbusqueda",
      variables: {
        GOOGLE_CLIENT_EMAIL: {
          presente: !!clientEmail,
          valor: clientEmail || "NO CONFIGURADA",
          esperado: "pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
          correcto: clientEmail === "pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
        },
        GOOGLE_PRIVATE_KEY: {
          presente: !!privateKey,
          longitud: privateKey ? privateKey.length : 0,
          tieneBegin: privateKey ? privateKey.includes("-----BEGIN PRIVATE KEY-----") : false,
          tieneEnd: privateKey ? privateKey.includes("-----END PRIVATE KEY-----") : false,
          primeros50: privateKey ? privateKey.substring(0, 50) + "..." : "NO CONFIGURADA",
        },
        GOOGLE_DRIVE_FOLDER_ID: {
          presente: !!folderId,
          valor: folderId || "NO CONFIGURADA",
          esperado: "18W0EM6vs0sJ1M0Qrpu6HC2r32ZQ8IIgV",
          correcto: folderId === "18W0EM6vs0sJ1M0Qrpu6HC2r32ZQ8IIgV",
        },
      },
    }

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({
        error: "Variables de entorno faltantes",
        diagnostico: diagnostico,
        solucion: [
          "1. Ve a Vercel Dashboard → Settings → Environment Variables",
          "2. Configura GOOGLE_CLIENT_EMAIL = pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
          "3. Configura GOOGLE_PRIVATE_KEY con la clave completa incluyendo \\n",
          "4. Configura GOOGLE_DRIVE_FOLDER_ID = 18W0EM6vs0sJ1M0Qrpu6HC2r32ZQ8IIgV",
          "5. Redespliega el proyecto",
        ],
      })
    }

    // Intentar formatear la private key
    let formattedPrivateKey = privateKey

    // Reemplazar \\n con \n reales
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n")

    // Verificar formato después del reemplazo
    diagnostico.privateKeyFormateada = {
      longitud: formattedPrivateKey.length,
      tieneBegin: formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"),
      tieneEnd: formattedPrivateKey.includes("-----END PRIVATE KEY-----"),
      saltosDeLínea: (formattedPrivateKey.match(/\n/g) || []).length,
      formatoCorrecto:
        formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----") &&
        formattedPrivateKey.includes("-----END PRIVATE KEY-----") &&
        (formattedPrivateKey.match(/\n/g) || []).length > 20,
    }

    // Intentar crear la autenticación
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    // Probar la autenticación
    const authClient = await auth.getClient()
    console.log("✅ Autenticación exitosa con nuevas credenciales")

    // Probar acceso a Drive
    const drive = google.drive({ version: "v3", auth })
    const testResponse = await drive.files.list({
      pageSize: 3,
      fields: "files(id, name)",
    })

    console.log("✅ Acceso a Google Drive exitoso")

    // Probar acceso a la carpeta específica
    let carpetaAcceso = null
    try {
      const carpetaResponse = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/pdf'`,
        pageSize: 3,
        fields: "files(id, name)",
      })
      carpetaAcceso = {
        exitoso: true,
        archivosEncontrados: carpetaResponse.data.files?.length || 0,
        ejemplos: carpetaResponse.data.files || [],
      }
    } catch (carpetaError) {
      carpetaAcceso = {
        exitoso: false,
        error: carpetaError.message,
      }
    }

    res.status(200).json({
      success: true,
      message: "🎉 Nuevas credenciales funcionando correctamente",
      proyecto: "pdfbusqueda",
      serviceAccount: "pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
      diagnostico: diagnostico,
      pruebaAcceso: {
        autenticacionExitosa: true,
        accesoADriveExitoso: true,
        archivosGenerales: testResponse.data.files?.length || 0,
        carpetaEspecifica: carpetaAcceso,
      },
      siguientePaso: "Probar /api/pdf-data para cargar la tabla completa",
    })
  } catch (error) {
    console.error("❌ Error en prueba de nuevas credenciales:", error)

    res.status(500).json({
      error: "Error en las nuevas credenciales",
      details: error.message,
      proyecto: "pdfbusqueda",
      diagnostico: diagnostico || {},
      solucion: {
        problema: error.message.includes("invalid_grant") ? "Invalid JWT Signature" : "Error de configuración",
        pasos: [
          "1. Verifica que GOOGLE_CLIENT_EMAIL = pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com",
          "2. Verifica que GOOGLE_PRIVATE_KEY tenga el formato correcto con \\n",
          "3. Verifica que la carpeta esté compartida con el service account",
          "4. Redespliega después de cualquier cambio",
        ],
      },
    })
  }
}
