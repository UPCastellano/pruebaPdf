// Script para probar las credenciales localmente
import { google } from "googleapis"

async function testCredentials() {
  try {
    console.log("Testing Google Service Account credentials...")

    // Estas son las credenciales que debes usar
    const credentials = {
      client_email: "pdf-busqueda@bitacora-458317.iam.gserviceaccount.com",
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDH0YubQVtPSDNL
YMER8IV6SfEKA+lvlRXKO5nSvkrgnPuy9Mty7rWTvy7KHYewKBdQh2uZEcmLMIM8
sUzP8fHMjc0OpUFLu7VXWn3u3sl37NEA3snHvCg8rRdE7ZUioqPJH8hC269d4ipQ
Vr+o7soTFGeXTmnPC89HsZ2j8Rc8ngxefJLYxt4wviaRw1S6j05K1CAFdO86xQf0
Xakt6ObhO63AeCRbxVO8YBMWIUdb1tVTVhDvnrRETuR3/DYdDVo5GqVcD/PsekBy
VQAcoICrPoYEa2PIXdwHEFWS/+Kfat+LZn4rhgAlMvxmvQac8qVMtKHOQhyDSme1
7DoVdJnrAgMBAAECggEAAXHXPQ71aTbVQXEYeZflbH4WszhWWpCs4NKafka9mtnN
C2ewBYuKnjVZJ2vxkbP7KywMz/ABfDNPF5lpO+2nY7pjZlI1N9DKcwW7+FtTAJN3
6rYxpkiKz+7Txr34VeZFdzb2xzOjFR4v/ncKGV9p8EZgU1yP8PJzFAp0NdMQlHHF
fAiyhV3Mgw73gHpoEU7CI6OVDwF6HVZR9hTh2khSU3YxYyg8FgxsVvY+ppC0wrLW
a9J4GpfSCd2LHY5ScWLOYeZR+0Fjet3VodZLMvHrweoUyzdx8hU/kVJC0CUq9/Yl
3O0GwIWB69ZLmubw+i4akZapk560PNGPUKK+U8qJmQKBgQDm2JGLPFcTbQ/+acXq
qFQCmIEFCXKcNIH7XRyd/ti9zLHP5mthh8xkzIcxKLoN6hyy+wXYU0tkktmkv4I3
3GiKLvb/VNzGXpEj+kyDERHm834idBRshP6behYhAewevkPZSZ/d9iXJWrjb2qDY
H/cvUrg7apPlYNyyi1JatBGwWQKBgQDdl3gC+/uEyS8/9UDshZWM2ufYH3fE2kPJ
1HrMbEpFeL/Lp0nFSUwEEdbALD4T20w2svVnq8OeBclcqWHzmtM4psyjd0l43/PT
zKBJOts1xBW61lszTvkmITH2CR5UPjJf/h8LbVWHjkyvbukCwBzSzL+HpM/hIOrM
kA0PoE+z4wKBgQDJF6thwUSRVZZzJ60TR2M3h6YMvzgpvsvkLi55q8EfRas30h+E
rIlu3YR/XF0HNgOeHnHvClBI4mvZykIja0td5J+huUlBPKvuzWHNYxdXOpGMbdZE
2m34/pc8VbJc7Z2pMSukbYJpLzCNxJwM6Xuoq8R1bdg8Hu7iUd+ByA8IsQKBgHzW
6vvzbp4+oeoMiAk4sSpr4ZY3FEjJFsvMc2pbz/QXtSZNFxiY1MSuMCiQRGD3eZaP
eAZyFIEgjXMw0khl/325Ky0k9TWuJjY64EqhaAKAeCWMwlDDu0YqCXWtaXLYn5TJ
HEBZ1ofKOZXUjF3KUfLI+1a2GY+h9eZNea5GCOE1AoGBAKLEN/M5rJvrraHCoysD
LQMiQTY4AHzcCnIsjk+MDIQq9r7eIhMzYFQB7ntCZNREHHorR6nEaf9pUKbQa4aR
DAtGgnzchWZxxLb40Kf1v0UeTJDhw1MoxIe1gX6oJfVJsVdFyyXY4lmpKGGwuhFu
eWGlYC5i8FErUekHdg/4zjln
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

    console.log("✅ Credentials are working!")
    console.log("Sample files:", response.data.files)
  } catch (error) {
    console.error("❌ Credential test failed:", error.message)
  }
}

testCredentials()
