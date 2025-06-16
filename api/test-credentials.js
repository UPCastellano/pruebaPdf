// API para probar las credenciales y diagnosticar el problema
const { google } = require("googleapis")

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  let diagnostico // Declare the diagnostico variable here

  try {
    console.log("🔍 Probando credenciales...")

    // Verificar variables de entorno
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    diagnostico = {
      timestamp: new Date().toISOString(),
      variables: {
        GOOGLE_CLIENT_EMAIL: {
          presente: !!clientEmail,
          valor: clientEmail || "NO CONFIGURADA",
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
        },
      },
    }

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({
        error: "Variables de entorno faltantes",
        diagnostico: diagnostico,
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
    console.log("✅ Autenticación exitosa")

    // Probar acceso a Drive
    const drive = google.drive({ version: "v3", auth })
    const testResponse = await drive.files.list({
      pageSize: 1,
      fields: "files(id, name)",
    })

    console.log("✅ Acceso a Google Drive exitoso")

    res.status(200).json({
      success: true,
      message: "Credenciales funcionando correctamente",
      diagnostico: diagnostico,
      pruebaAcceso: {
        autenticacionExitosa: true,
        accesoADriveExitoso: true,
        archivosEncontrados: testResponse.data.files?.length || 0,
      },
    })
  } catch (error) {
    console.error("❌ Error en prueba de credenciales:", error)

    res.status(500).json({
      error: "Error en las credenciales",
      details: error.message,
      diagnostico: diagnostico || {},
      solucion: {
        problema: "Invalid JWT Signature",
        causa: "Formato incorrecto de GOOGLE_PRIVATE_KEY",
        pasos: [
          "1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables",
          "2. Elimina la variable GOOGLE_PRIVATE_KEY existente",
          "3. Crea una nueva con el formato correcto (ver ejemplo abajo)",
          "4. Redespliega el proyecto",
        ],
      },
    })
  }
}
