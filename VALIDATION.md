# Validación de la primera versión

## Comprobado

- 11 pruebas automatizadas de la lógica de puntajes, límites, corrección, ganador, revancha y persistencia.
- TypeScript y compilación de producción Vite.
- `npm audit`: 0 vulnerabilidades tras fijar `uuid` 11.1.1 en la dependencia de desarrollo `xcode`. Se conserva la API CommonJS `v4()` que utiliza esa herramienta.
- Navegador: sumar, puntaje personalizado, recargar y recuperar partida, ganar a 30, deshacer la victoria, cambiar equipos, ganar a 15, revancha e historial.
- Navegador: modo claro y oscuro; anchos de 320, 390 y 768 píxeles y orientación horizontal de 844 × 390. Sin desbordamiento horizontal; controles de anotación de al menos 48 × 48 píxeles.
- Proyecto Android 14+ compilado correctamente en GitHub Actions. Las ejecuciones posteriores vuelven a compilar cada cambio en `main`.
- Proyectos nativos sincronizados con Capacitor; iconos y pantallas iniciales propios. Proyecto iOS configurado para iOS 16+ con manifiesto de privacidad para Preferences.

## Pendiente de prueba en dispositivos

No se conectaron celulares físicos ni un simulador iOS. Faltan pruebas de instalación y uso en Android e iPhone, vibración real, comportamiento de barras del sistema, interrupciones del sistema operativo y distribución firmada de producción. El proyecto iOS requiere compilar y firmar en Xcode; no se generó un IPA.

La caché offline de la web se genera con todos los recursos de la compilación. La experiencia offline debe probarse también en Safari/Chrome del teléfono después de alojar la web en HTTPS. La app nativa incluye esos recursos dentro del paquete.

## Rediseño gaucho 1.1.0

Comprobado en navegador: nombre modificado con 3 tantos conserva el puntaje; nombres de varias palabras; menú, ajustes y modo oscuro. El marcador no desborda horizontal ni verticalmente en 320 × 640 y 844 × 390; controles de anotación de al menos 48 × 48 píxeles. También se inspeccionó visualmente a 390 × 844.

## Fósforos y guía 1.2.0

Navegador: paso a 17 (15 malas y 2 buenas), resta a 16 conservando las malas, 12 cuadrados entre ambos equipos y guía de 14 niveles con valores de envido. Revisión visual a 390 × 844 y 320 × 640; sin desbordamiento a 320 × 640.
