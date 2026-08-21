# Tablero TV (app Android)

Reconstrucción del wrapper WebView que ya estaba instalado en las TV (`apk/Tablero_Auto.apk`, `apk/Tablero_Nuevo_TV.apk`), con un agregado: expone `window.TableroAndroid.getDeviceId()` a la página, usando el `Settings.Secure.ANDROID_ID` del sistema Android.

`licencia-check.js` ya sabía usar ese puente si existía (commit `ad0fc3c`), pero como los APK instalados no lo tenían, cada dispositivo se identificaba con un código guardado en `localStorage` — y un "Borrar datos" en la TV lo borraba, generando un código nuevo y pidiendo reactivación de nuevo. Con este ID del sistema, el código sobrevive a un "Borrar datos" o a un limpiador de caché.

## Compilar

1. Instalar [Android Studio](https://developer.android.com/studio) (gratis) si no lo tenés.
2. Abrir esta carpeta (`tv-app/`) como proyecto en Android Studio (`File > Open`).
3. Dejar que sincronice Gradle (la primera vez puede pedir crear el wrapper de Gradle o bajar el Android SDK — aceptar todo).
4. `Build > Generate Signed Bundle / APK` o simplemente `Build > Build APK(s)` para un APK de prueba sin firmar/firmado con clave debug.

Si Android Studio sugiere actualizar la versión de Gradle/AGP al abrir el proyecto, aceptar — quedó fijado en una versión razonablemente reciente pero puede haber una más nueva disponible.

## ⚠️ Importante: la firma va a cambiar

Los APK que ya están instalados en las TV están firmados con una clave que no está en este repo (`apk/README.md` no la documenta, y las claves de firma nunca se suben a git). Este proyecto nuevo se va a firmar con una clave distinta (la que generes vos en Android Studio).

Android no deja instalar una app con el mismo nombre de paquete (`com.tableronuevo.tv`) pero firma distinta encima de la existente — vas a tener que **desinstalar la app vieja de la TV antes de instalar esta**.

Eso significa que la primera vez vas a tener que reactivar el código de licencia de nuevo desde `licencias.html` (una sola vez). Después de esa reactivación, el código va a ser estable (basado en `ANDROID_ID`) y va a sobrevivir cualquier "Borrar datos" futuro.

**Recomendación:** una vez que generes tu clave de firma en Android Studio, guardala en un lugar seguro (fuera del repo) y reusala siempre para este proyecto — así las próximas actualizaciones si se pueden instalar encima sin desinstalar.

## Autoinicio al prender la TV

La app tiene un `BootReceiver` que la lanza sola apenas el sistema Android termina de arrancar (`BOOT_COMPLETED` / `QUICKBOOT_POWERON`).

Ojo con una distinción importante: en un Smart TV normal (o una TV box cara), "prender la TV" con el control remoto casi siempre es **despertar de un estado de reposo (standby)**, no un arranque completo de Android — en ese caso el sistema nunca vuelve a bootear y este mecanismo no aplica; simplemente vuelve a mostrar lo que ya estaba en memoria (el propio tablero, si ya estaba abierto, o el launcher/home si no). En cambio, en TV boxes chicas tipo ONN/genéricas que se apagan de verdad (sin standby real), cada "prendido" sí dispara un boot completo y ahí este mecanismo funciona como autoinicio real.

Si después de instalar esto la TV no abre la app sola al encenderla, revisar en Ajustes del dispositivo si existe algo como "Autostart" / "Inicio automático" / "Administrador de apps en segundo plano" — muchas TV boxes Android (sobre todo las económicas) traen un permiso aparte por app para poder correr en el arranque, además del permiso que ya declara el manifest.

## Si cambia la URL del tablero

Está hardcodeada en `app/src/main/java/com/tableronuevo/tv/MainActivity.java`, constante `TABLERO_URL`.

## Instalar en la TV

- Con la TV en la misma red que tu PC: `adb connect <ip-de-la-tv>` y después `adb install app-debug.apk` (necesita "Depuración USB/red" habilitada en Ajustes de desarrollador de la TV).
- O copiar el `.apk` a un pendrive y abrirlo desde un explorador de archivos en la TV (necesita permitir "orígenes desconocidos").
