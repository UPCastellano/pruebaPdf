// Script para probar las nuevas credenciales localmente
import { google } from "googleapis"

async function testNewCredentials() {
  try {
    console.log("🧪 Testing nuevas credenciales del proyecto pdfbusqueda...")

    // Nuevas credenciales del proyecto pdfbusqueda
    const credentials = {
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

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })

    // Test básico - listar archivos del root
    const response = await drive.files.list({
      pageSize: 5,
      fields: "files(id, name)",
    })

    console.log("✅ Nuevas credenciales funcionan correctamente!")
    console.log("📁 Archivos de ejemplo:", response.data.files)

    // Test específico - acceso a la carpeta
    const folderTest = await drive.files.list({
      q: "'18W0EM6vs0sJ1M0Qrpu6HC2r32ZQ8IIgV' in parents and mimeType='application/pdf'",
      pageSize: 3,
      fields: "files(id, name)",
    })

    console.log("📄 PDFs en la carpeta:", folderTest.data.files?.length || 0)
    console.log("🎉 Todo configurado correctamente!")
  } catch (error) {
    console.error("❌ Test de nuevas credenciales falló:", error.message)
    console.error("🔍 Verifica:")
    console.error("1. Que la carpeta esté compartida con: pdf-vercel-app@pdfbusqueda.iam.gserviceaccount.com")
    console.error("2. Que Google Drive API esté habilitada en el proyecto pdfbusqueda")
    console.error("3. Que las credenciales sean correctas")
  }
}

testNewCredentials()
