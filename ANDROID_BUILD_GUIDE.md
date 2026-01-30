# 📱 Monster Band - Android APK Build Guide

## Pre-requisitos

### 1. Android Studio

Descarga e instala [Android Studio](https://developer.android.com/studio)

### 2. Java JDK 17+

Asegúrate de tener Java 17 o superior instalado.

### 3. Variables de Entorno

```bash
# Windows (PowerShell como Admin)
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx PATH "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

---

## 🔥 IMPORTANTE: Configurar Firebase para Notificaciones Push

### Paso 1: Descargar google-services.json

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **monster-band**
3. Ve a **Configuración del proyecto** (⚙️) > **Tus apps**
4. Busca la app Android o agrégala:
   - Package name: `com.monsterband.app`
   - App nickname: `Monster Band Android`
5. Descarga el archivo `google-services.json`
6. **Cópialo a:** `monster-front/android/app/google-services.json`

### Paso 2: Verificar configuración FCM

El proyecto ya está configurado para usar Firebase Cloud Messaging. Solo necesitas el archivo `google-services.json`.

---

## 🏗️ Generar APK

### Opción 1: Usando Android Studio (Recomendado)

```bash
# Desde monster-front/
npx cap open android
```

En Android Studio:

1. Espera a que Gradle sincronice
2. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 2: Usando línea de comandos

```bash
# Desde monster-front/android/
./gradlew assembleDebug

# El APK estará en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Generar APK de Release (Para producción)

### 1. Crear keystore (solo una vez)

```bash
keytool -genkey -v -keystore monster-band-release.keystore -alias monster-band -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar signing en `android/app/build.gradle`

Agrega dentro de `android { }`:

```gradle
signingConfigs {
    release {
        storeFile file('monster-band-release.keystore')
        storePassword 'TU_PASSWORD'
        keyAlias 'monster-band'
        keyPassword 'TU_PASSWORD'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Generar APK de release

```bash
./gradlew assembleRelease

# APK en: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔧 Comandos Útiles

```bash
# Reconstruir y sincronizar
npm run build && npx cap sync android

# Abrir en Android Studio
npx cap open android

# Ejecutar en emulador/dispositivo conectado
npx cap run android

# Ver logs de la app
adb logcat | grep -i "monster\|capacitor"
```

---

## 📱 Permisos Configurados

La app ya tiene configurados los siguientes permisos en `AndroidManifest.xml`:

- ✅ **INTERNET** - Conexión a la API
- ✅ **ACCESS_NETWORK_STATE** - Estado de red
- ✅ **POST_NOTIFICATIONS** - Notificaciones push (Android 13+)
- ✅ **VIBRATE** - Vibración para notificaciones
- ✅ **ACCESS_FINE_LOCATION** - GPS para asistencia
- ✅ **ACCESS_COARSE_LOCATION** - Ubicación aproximada
- ✅ **CAMERA** - Para fotos de perfil
- ✅ **READ/WRITE_EXTERNAL_STORAGE** - Descargar archivos

---

## 🐛 Solución de Problemas

### Error: "No se puede sincronizar Gradle"

```bash
# Limpiar cache de Gradle
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

### Error: "google-services.json not found"

Descarga el archivo desde Firebase Console y colócalo en `android/app/`

### La app no se conecta a la API

Verifica que la URL de la API esté correcta en `.env.production`:

```
VITE_API_URL=https://api.simba.xpertiaplus.com/api
```

### Notificaciones no funcionan

1. Verifica que `google-services.json` esté en su lugar
2. Revisa los logs: `adb logcat | grep -i firebase`

---

## 📄 Estructura del Proyecto Android

```
monster-front/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # Permisos
│   │   │   ├── res/                  # Recursos (iconos, splash)
│   │   │   └── java/                 # Código nativo
│   │   ├── build.gradle              # Config de build
│   │   └── google-services.json      # ⚠️ DEBES AGREGAR ESTE
│   └── build.gradle                  # Config general
├── capacitor.config.json             # Config de Capacitor
└── dist/                             # Build de la web app
```

---

## 🎨 Iconos y Splash Screen

Los iconos y splash screen fueron generados automáticamente desde `logo_mb.png`.
Si necesitas regenerarlos:

```bash
npx @capacitor/assets generate --android
```

---

**Desarrollado para Monster Band 🎸**
