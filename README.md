# Conversor UTM a LatLong - Generador KML

Una aplicación web para convertir coordenadas UTM (Universal Transverse Mercator) a coordenadas geográficas (Latitud/Longitud), visualizar los puntos en un mapa interactivo y generar archivos KML compatibles con Google Earth.

## 🚀 Características

- **Conversión precisa**: Convierte coordenadas UTM a LatLong usando la librería Proj4js
- **Visualización en mapa**: Muestra los puntos convertidos como pines en un mapa interactivo (Leaflet)
- **Controles de mapa**: Centra el mapa y alterna entre vista satelital y calles
- **Múltiples métodos de entrada**:
  - Ingreso manual punto por punto
  - Ingreso masivo desde texto (CSV, TSV, etc.)
- **Soporte completo de zonas UTM**: Todas las zonas UTM (1-60) y hemisferios (Norte/Sur)
- **Generación de KML**: Crea archivos KML listos para Google Earth
- **Interfaz intuitiva**: Diseño responsivo y fácil de usar
- **Vista previa**: Muestra el contenido del KML antes de descargar
- **Gestión de puntos**: Agregar, eliminar y visualizar puntos individualmente

## 📍 Mapa Interactivo

- Los puntos agregados se muestran como pines en el mapa
- Al hacer clic en un pin, se muestra la información del punto
- Botón para centrar el mapa en todos los puntos
- Botón para alternar entre vista satelital y calles

## 📋 Formato de Datos de Entrada

### Ingreso Manual

- **Este UTM**: Coordenada Este en metros (ej: 441143.76)
- **Norte UTM**: Coordenada Norte en metros (ej: 7536713.21)
- **Nombre del Punto**: Opcional (ej: "Punto 1")

### Ingreso Masivo

Puede pegar datos en varios formatos separados por:

- Comas: `441143.76,7536713.21,Punto 1`
- Tabulaciones: `441143.76\t7536713.21\tPunto 1`
- Punto y coma: `441143.76;7536713.21;Punto 1`
- Espacios: `441143.76 7536713.21 Punto 1`
- Formato europeo: `441.143,76 7.536.713,21`

Ejemplo de datos masivos:

```
441143.76,7536713.21
441294.10,7536781.02
441575.16,7536791.93
441779.34,7536799.36
441781.77,7536737.54
```

## 🗺️ Configuración de Zona UTM

Antes de ingresar coordenadas, asegúrese de configurar correctamente:

- **Zona UTM**: Número de zona (1-60)
- **Hemisferio**: Norte (N) o Sur (S)

## 🎯 Cómo Usar

1. **Configurar Zona UTM**:
   - Seleccione la zona UTM correcta (por defecto: zona 19 Sur)
   - Elija el hemisferio (Norte/Sur)
2. **Ingresar Coordenadas**:
   - **Método Manual**: Ingrese una coordenada a la vez
   - **Método Masivo**: Pegue múltiples coordenadas desde Excel u otra fuente
3. **Revisar Puntos**:
   - Verifique las coordenadas convertidas en la tabla y en el mapa
   - Elimine puntos incorrectos si es necesario
4. **Visualizar en el Mapa**:
   - Los puntos aparecerán como pines
   - Use los controles para centrar el mapa o cambiar la vista
5. **Generar KML**:
   - Haga clic en "Generar KML"
   - Revise la vista previa del contenido
6. **Descargar**:
   - Haga clic en "Descargar KML"
   - Abra el archivo en Google Earth

## 📁 Estructura del Proyecto

```
utm-latlong/
├── index.html          # Interfaz principal
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de la aplicación
└── README.md           # Este archivo
```

## 🌐 Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Diseño responsivo y estilos
- **JavaScript**: Lógica de conversión y manejo de datos
- **Proj4js**: Librería para conversiones de proyecciones cartográficas
- **Leaflet**: Mapa interactivo y visualización de pines
- **KML**: Formato de archivo para Google Earth

## 🔧 Instalación y Uso

1. Clone o descargue este repositorio
2. Abra `index.html` en un navegador web moderno
3. No requiere instalación de servidor web

## 📊 Ejemplo de Uso con sus Datos

Basado en los datos de su imagen, estos son los pasos:

1. Configure **Zona UTM: 19** y **Hemisferio: Sur** (por defecto)
2. Use el ingreso masivo con estos datos:

```
441143.76,7536713.21
441294.10,7536781.02
441575.16,7536791.93
441779.34,7536799.36
441781.77,7536737.54
441783.85,7536654.25
441785.81,7536575.95
441787.91,7536495.94
441732.04,7536474.77
441730.13,7536428.64
441762.78,7536414.27
```

## ⚠️ Consideraciones Importantes

- **Precisión**: La conversión es precisa para la mayoría de aplicaciones civiles
- **Zona UTM**: Es crítico seleccionar la zona UTM correcta
- **Formato de Entrada**: Los decimales pueden usar punto (.) o coma (,) según el formato
- **Navegadores**: Funciona en navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🤝 Contribuir

Si encuentra errores o desea mejoras:

1. Reporte issues
2. Envíe pull requests
3. Sugiera nuevas características

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**¿Necesita ayuda?** Use el botón "Ayuda" en la aplicación, consulte el README o contacte al responsable del proyecto.
