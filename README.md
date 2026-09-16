# Truco · El anotador

Anotador de **truco argentino**, pensado para la mesa y el celular. React + TypeScript + Capacitor. Una base de código para Android, iPhone y web instalable.

## Edición gaucha · 1.2.0

El marcador ocupa todo el ancho y alto disponible, con controles siempre a mano y una guarda pampa sobre papel cálido y tonos de cuero. Tocá el lápiz junto a cada equipo para cambiar nombres sin reiniciar la partida. Historial, serie y ajustes están en el menú superior. El diseño se adapta también a orientación horizontal.

## Qué incluye

- Dos equipos con nombres editables, partidas a 15 o 30.
- Malas y buenas, marcador numérico y fósforos en grupos de cinco.
- Botones + y − para anotar de a un tanto y deshacer (incluso la victoria).
- Valor de las cartas para truco y envido en el menú.
- Ganador, revancha, serie por nombres de equipos e historial de las últimas 100 partidas terminadas.
- Guardado automático local con Capacitor Preferences. Sin cuenta, publicidad ni backend.
- Modo claro/oscuro, vibración nativa y controles accesibles.
- App nativa sin conexión; web sin conexión después de una primera carga completa.

## Desarrollo

Node.js 22.21 o superior (recomendado Node 24).

```sh
npm ci
npm run dev
npm test
npm run build
```

`npm run preview` sirve la compilación web. Los recursos y el service worker usan rutas relativas, por lo que se pueden alojar bajo `/truco/`. Para instalar la web en un teléfono, se necesita un alojamiento HTTPS. No se ha configurado automáticamente un servicio de hosting.

## Android 14 o superior

El proyecto `android/` tiene **minSdkVersion 34 (Android 14)**. Android Studio y SDK 36, JDK 21.

```sh
npm ci
npm run sync
cd android
# macOS/Linux
./gradlew assembleDebug
# Windows
gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.

También se compila con **GitHub Actions → Build Android** al subir cambios a `main`. En una ejecución exitosa, descargá el artefacto **truco-android14-debug**, descomprimilo e instalá el APK en Android. Es una compilación de prueba firmada con clave debug; para Google Play hay que generar y firmar un AAB de producción con una clave propia. La clave debug del runner puede cambiar entre ejecuciones: una actualización incompatible de firma requiere desinstalar la anterior y pierde los datos locales.

## iPhone / iPad

El proyecto `ios/` está preparado para **iOS 16 o superior**, usando Swift Package Manager. Compilarlo requiere **macOS y Xcode 26 o superior**:

```sh
npm ci
npm run ios
```

En Xcode, elegí tu equipo de firma en Signing & Capabilities y un dispositivo o simulador. Para distribuir por TestFlight/App Store se necesita firma y una cuenta Apple Developer. El identificador inicial es `com.xaoxay.truco`; cambialo en Capacitor y los proyectos nativos si necesitás otro identificador. No incluye certificados ni se publica automáticamente en tiendas.

Sin compilar iOS, la versión web alojada en HTTPS se puede agregar desde Safari → Compartir → Agregar a inicio.

## Reglas y decisiones

No calcula automáticamente los cantos ni la falta envido: hay variantes de mesa. Sumá con + los tantos acordados. Se muestran dos columnas verticales por equipo: 15 malas y 15 buenas. Las malas permanecen marcadas al pasar a buenas. El ganador queda limitado al objetivo. Para corregir una victoria, usá Deshacer. Una partida incompleta se descarta únicamente al confirmar «Empezar partida» en el formulario.

Los nombres se tratan como texto, nunca HTML. El guardado está versionado y valida movimientos antes de recuperarlos. Borrar datos/desinstalar la app elimina el historial; no hay sincronización entre dispositivos. La serie agrupa los mismos nombres en el mismo orden dentro de las últimas 100 terminadas y la partida actual.

## Validación

`npm test` cubre límites, paso a buenas, ganador, corrección, deshacer, revancha, archivo y recuperación de datos. `npm run build` comprueba TypeScript y genera la web con caché offline. La comprobación del navegador no sustituye pruebas en celulares físicos. Consultá el estado de Actions para la compilación Android.

## Referencias de producto

Se revisaron [Anotador Pro](https://www.anotador.com.ar/) y [Anotador de Truco: Puntos](https://apps.apple.com/ar/app/anotador-de-truco-puntos/id6774312129) para identificar funciones habituales. Diseño y código propios; no se reutilizan sus recursos.

Requisitos multiplataforma: [documentación oficial de Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup).

Orden de cartas contrastado con el [reglamento de Juegos Bonaerenses 2026](https://juegos.gba.gob.ar/wp-content/uploads/2026/reglamentos/especificos/deportes_adultos_mayores/truco.pdf).
