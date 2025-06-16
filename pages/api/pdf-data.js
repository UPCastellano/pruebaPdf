// API route mejorada con mejor manejo de la private key
import { google } from "googleapis"

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  try {
    // Verificar variables de entorno
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    console.log("Environment check:", {
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      hasFolderId: !!folderId,
      privateKeyStart: privateKey ? privateKey.substring(0, 50) + "..." : "undefined",
    })

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({
        error: "Missing environment variables",
        details: {
          GOOGLE_CLIENT_EMAIL: !!clientEmail,
          GOOGLE_PRIVATE_KEY: !!privateKey,
          GOOGLE_DRIVE_FOLDER_ID: !!folderId,
        },
      })
    }

    // Limpiar y formatear la private key correctamente
    let formattedPrivateKey = privateKey

    // Si la key no tiene los headers, agregarlos
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedPrivateKey}\n-----END PRIVATE KEY-----`
    }

    // Reemplazar \\n con \n reales
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n")

    // Asegurar formato correcto
    formattedPrivateKey = formattedPrivateKey
      .replace(/-----BEGIN PRIVATE KEY-----\s*/, "-----BEGIN PRIVATE KEY-----\n")
      .replace(/\s*-----END PRIVATE KEY-----/, "\n-----END PRIVATE KEY-----")

    console.log("Private key format check:", {
      hasBeginMarker: formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"),
      hasEndMarker: formattedPrivateKey.includes("-----END PRIVATE KEY-----"),
      length: formattedPrivateKey.length,
    })

    // Configurar autenticación con Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Obtener archivos PDF de Google Drive
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name, size, modifiedTime, webViewLink, webContentLink)",
      orderBy: "modifiedTime desc",
      pageSize: 100,
    })

    console.log(`Found ${response.data.files.length} PDF files`)

    // Formatear datos para DataTables
    const formattedData = response.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : "N/A",
      modified: new Date(file.modifiedTime).toLocaleDateString("es-ES"),
      link: file.webViewLink,
      downloadLink: file.webContentLink,
    }))

    // Respuesta en formato DataTables
    res.status(200).json({
      data: formattedData,
      recordsTotal: formattedData.length,
      recordsFiltered: formattedData.length,
    })
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    })

    let errorMessage = "Failed to fetch PDF data"
    let errorDetails = error.message

    if (error.message.includes("invalid_grant")) {
      errorMessage = "Google Authentication Error"
      errorDetails = "Invalid JWT Signature - Check your GOOGLE_PRIVATE_KEY format"
    } else if (error.message.includes("access_denied")) {
      errorMessage = "Google Drive Access Denied"
      errorDetails = "Service Account doesn't have access to the folder"
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      code: error.code || "UNKNOWN_ERROR",
    })
  }
}
