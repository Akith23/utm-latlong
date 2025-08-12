// Array para almacenar los puntos
let points = [];
let pointCounter = 1;

// Variables del mapa
let map;
let markersLayer;
let currentMapView = "satellite";

// Configuración de proyecciones
let utmProjection;
let wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", function () {
  updateUTMProjection();
  initializeMap();
  setupDragAndDrop();

  // Event listeners para cambios en zona UTM
  document
    .getElementById("utmZone")
    .addEventListener("change", updateUTMProjection);
  document
    .getElementById("hemisphere")
    .addEventListener("change", updateUTMProjection);

  // Event listeners para tecla Enter
  document.getElementById("esteUTM").addEventListener("keypress", function (e) {
    if (e.key === "Enter") addPoint();
  });
  document
    .getElementById("norteUTM")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") addPoint();
    });
  document
    .getElementById("pointName")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") addPoint();
    });
});

// Actualizar la proyección UTM basada en la zona seleccionada
function updateUTMProjection() {
  const zone = document.getElementById("utmZone").value;
  const hemisphere = document.getElementById("hemisphere").value;

  if (hemisphere === "N") {
    utmProjection = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`;
  } else {
    utmProjection = `+proj=utm +zone=${zone} +south +datum=WGS84 +units=m +no_defs`;
  }
}

// Cambiar entre pestañas
function switchTab(tabName) {
  // Remover clase active de todos los botones y contenido
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Agregar clase active al botón y contenido seleccionado
  event.target.classList.add("active");
  document.getElementById(tabName + "-tab").classList.add("active");
}

// Convertir coordenadas UTM a LatLong
function utmToLatLong(easting, northing) {
  try {
    const [longitude, latitude] = proj4(utmProjection, wgs84, [
      easting,
      northing,
    ]);
    return {
      latitude: parseFloat(latitude.toFixed(8)),
      longitude: parseFloat(longitude.toFixed(8)),
    };
  } catch (error) {
    console.error("Error en conversión:", error);
    return null;
  }
}

// Agregar un punto individual
function addPoint() {
  const esteUTM = parseFloat(document.getElementById("esteUTM").value);
  const norteUTM = parseFloat(document.getElementById("norteUTM").value);
  const pointName =
    document.getElementById("pointName").value || `Punto ${pointCounter}`;

  if (isNaN(esteUTM) || isNaN(norteUTM)) {
    showMessage("Por favor ingrese coordenadas válidas", "error");
    return;
  }

  const latLong = utmToLatLong(esteUTM, norteUTM);

  if (!latLong) {
    showMessage("Error al convertir las coordenadas", "error");
    return;
  }

  const point = {
    id: Date.now(),
    name: pointName,
    esteUTM: esteUTM,
    norteUTM: norteUTM,
    latitude: latLong.latitude,
    longitude: latLong.longitude,
    source: 'manual' // Marcar como ingreso manual
  };

  points.push(point);
  pointCounter++;

  // Limpiar campos
  document.getElementById("esteUTM").value = "";
  document.getElementById("norteUTM").value = "";
  document.getElementById("pointName").value = "";

  updatePointsTable();
  updateMap();
  showMessage("Punto agregado correctamente", "success");
}

// Procesar datos masivos
function processBulkData() {
  const bulkData = document.getElementById("bulkData").value.trim();

  if (!bulkData) {
    showMessage("Por favor ingrese los datos", "error");
    return;
  }

  const lines = bulkData.split("\n");
  let addedCount = 0;
  let errorCount = 0;

  lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return;

    // Intentar diferentes separadores
    let parts = [];
    if (line.includes("\t")) {
      parts = line.split("\t");
    } else if (line.includes(",")) {
      // Si hay más de una coma, probablemente es formato europeo
      const matches = line.match(/([\d\.]+,[\d]+)/g);
      if (matches && matches.length >= 2) {
        // Extraer los dos primeros valores y convertirlos
        let esteUTM = matches[0].replace(/\./g, "").replace(",", ".");
        let norteUTM = matches[1].replace(/\./g, "").replace(",", ".");
        const pointName =
          line.split(matches[1])[1]?.trim() || `Punto ${pointCounter}`;
        esteUTM = parseFloat(esteUTM);
        norteUTM = parseFloat(norteUTM);
        if (!isNaN(esteUTM) && !isNaN(norteUTM)) {
          const latLong = utmToLatLong(esteUTM, norteUTM);

          if (latLong) {
        const point = {
          id: Date.now() + index,
          name: pointName,
          esteUTM: esteUTM,
          norteUTM: norteUTM,
          latitude: latLong.latitude,
          longitude: latLong.longitude,
          source: 'bulk' // Marcar como ingreso masivo
        };            points.push(point);
            pointCounter++;
            addedCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
        return;
      } else {
        parts = line.split(",");
      }
    } else if (line.includes(";")) {
      parts = line.split(";");
    } else {
      parts = line.split(/\s+/);
    }

    // Normalizar formato si es europeo (comas decimales y puntos de miles)
    if (parts.length >= 2) {
      let esteUTM = parts[0].replace(/\./g, "").replace(",", ".");
      let norteUTM = parts[1].replace(/\./g, "").replace(",", ".");
      const pointName = parts[2] ? parts[2].trim() : `Punto ${pointCounter}`;
      esteUTM = parseFloat(esteUTM);
      norteUTM = parseFloat(norteUTM);
      if (!isNaN(esteUTM) && !isNaN(norteUTM)) {
        const latLong = utmToLatLong(esteUTM, norteUTM);
        if (latLong) {
          const point = {
            id: Date.now() + index,
            name: pointName,
            esteUTM: esteUTM,
            norteUTM: norteUTM,
            latitude: latLong.latitude,
            longitude: latLong.longitude,
            source: 'bulk' // Marcar como ingreso masivo
          };

          points.push(point);
          pointCounter++;
          addedCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    } else {
      errorCount++;
    }
  });

  updatePointsTable();

  if (addedCount > 0) {
    updateMap();
    showMessage(
      `Se agregaron ${addedCount} puntos correctamente${
        errorCount > 0 ? `. ${errorCount} líneas tuvieron errores.` : "."
      }`,
      "success"
    );
  } else {
    showMessage(
      "No se pudieron procesar los datos. Verifique el formato.",
      "error"
    );
  }

  // Limpiar el textarea
  document.getElementById("bulkData").value = "";
}

// Actualizar la tabla de puntos
function updatePointsTable() {
  const tableBody = document.getElementById("pointsTableBody");
  tableBody.innerHTML = "";

  points.forEach((point) => {
    const sourceLabel = {
      'manual': '✏️ Manual',
      'bulk': '📝 Masivo', 
      'imported': '📁 Archivo'
    };
    
    // Formatear altitud - mostrar valor si existe, sino mostrar vacío
    const altitudeDisplay = point.altitude !== undefined && point.altitude !== null 
      ? point.altitude.toFixed(2) + ' m' 
      : '';
    
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${point.name}</td>
            <td>${point.esteUTM.toFixed(2)}</td>
            <td>${point.norteUTM.toFixed(2)}</td>
            <td>${point.latitude.toFixed(8)}</td>
            <td>${point.longitude.toFixed(8)}</td>
            <td>${altitudeDisplay}</td>
            <td>${sourceLabel[point.source] || '❓ Desconocido'}</td>
            <td>
                <button class="btn-remove" onclick="removePoint(${
                  point.id
                })">Eliminar</button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Habilitar/deshabilitar botones
  const generateBtn = document.querySelector(".btn-generate");
  const exportBtn = document.querySelector(".btn-export");
  if (generateBtn) {
    generateBtn.disabled = points.length === 0;
  }
  if (exportBtn) {
    exportBtn.disabled = points.length === 0;
  }
}

// Eliminar un punto
function removePoint(pointId) {
  points = points.filter((point) => point.id !== pointId);
  updatePointsTable();
  updateMap();
  showMessage("Punto eliminado", "success");
}

// Limpiar todos los puntos
function clearAllPoints() {
  if (points.length === 0) {
    showMessage("No hay puntos para limpiar", "error");
    return;
  }

  if (confirm("¿Está seguro que desea eliminar todos los puntos?")) {
    points = [];
    pointCounter = 1;
    updatePointsTable();
    updateMap();
    document.getElementById("kmlPreview").value = "";
    document.getElementById("downloadBtn").disabled = true;
    showMessage("Todos los puntos han sido eliminados", "success");
  }
}

// Limpiar solo puntos importados
function clearImportedPoints() {
  const importedPoints = points.filter(point => point.source === 'imported');
  
  if (importedPoints.length === 0) {
    showMessage("No hay puntos importados para limpiar", "error");
    return;
  }

  if (confirm(`¿Está seguro que desea eliminar los ${importedPoints.length} puntos importados?`)) {
    points = points.filter(point => point.source !== 'imported');
    updatePointsTable();
    updateMap();
    showMessage(`Se eliminaron ${importedPoints.length} puntos importados`, "success");
  }
}

// Generar KML
function generateKML() {
  if (points.length === 0) {
    showMessage("No hay puntos para generar el KML", "error");
    return;
  }

  const zone = document.getElementById("utmZone").value;
  const hemisphere = document.getElementById("hemisphere").value;
  const kmlContent = createKMLContent(points, zone, hemisphere);

  document.getElementById("kmlPreview").value = kmlContent;
  document.getElementById("downloadBtn").disabled = false;

  showMessage("KML generado correctamente", "success");
}

// Crear contenido KML
function createKMLContent(points, zone, hemisphere) {
  const now = new Date().toISOString();

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>Coordenadas UTM Zona ${zone}${hemisphere} - ${new Date().toLocaleDateString()}</name>
        <description>Puntos convertidos de UTM a LatLong generados el ${new Date().toLocaleString()}</description>
        
        <Style id="pointStyle">
            <IconStyle>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
                </Icon>
                <scale>1.2</scale>
            </IconStyle>
            <LabelStyle>
                <scale>1.0</scale>
            </LabelStyle>
        </Style>
        
        <Folder>
            <name>Puntos UTM</name>
            <description>Puntos convertidos desde coordenadas UTM Zona ${zone}${hemisphere}</description>
`;

  points.forEach((point) => {
    kml += `
            <Placemark>
                <name>${point.name}</name>
                <description><![CDATA[
                    <table border="1" cellpadding="3" cellspacing="0">
                        <tr><td><b>Nombre:</b></td><td>${point.name}</td></tr>
                        <tr><td><b>Este UTM:</b></td><td>${point.esteUTM.toFixed(
                          2
                        )} m</td></tr>
                        <tr><td><b>Norte UTM:</b></td><td>${point.norteUTM.toFixed(
                          2
                        )} m</td></tr>
                        <tr><td><b>Zona UTM:</b></td><td>${zone}${hemisphere}</td></tr>
                        <tr><td><b>Latitud:</b></td><td>${point.latitude.toFixed(
                          8
                        )}°</td></tr>
                        <tr><td><b>Longitud:</b></td><td>${point.longitude.toFixed(
                          8
                        )}°</td></tr>
                    </table>
                ]]></description>
                <styleUrl>#pointStyle</styleUrl>
                <Point>
                    <coordinates>${point.longitude},${
      point.latitude
    },0</coordinates>
                </Point>
            </Placemark>`;
  });

  kml += `
        </Folder>
    </Document>
</kml>`;

  return kml;
}

// Descargar KML
function downloadKML() {
  const kmlContent = document.getElementById("kmlPreview").value;

  if (!kmlContent) {
    showMessage("Primero debe generar el KML", "error");
    return;
  }

  const zone = document.getElementById("utmZone").value;
  const hemisphere = document.getElementById("hemisphere").value;
  const filename = `coordenadas_utm_zona_${zone}${hemisphere}_${new Date()
    .toISOString()
    .slice(0, 10)}.kml`;

  const blob = new Blob([kmlContent], {
    type: "application/vnd.google-earth.kml+xml",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showMessage(`Archivo ${filename} descargado correctamente`, "success");
}

// Mostrar mensajes al usuario
function showMessage(message, type) {
  // Remover mensajes anteriores
  const existingMessages = document.querySelectorAll(
    ".success-message, .error-message"
  );
  existingMessages.forEach((msg) => msg.remove());

  const messageDiv = document.createElement("div");
  messageDiv.className =
    type === "success" ? "success-message" : "error-message";
  messageDiv.textContent = message;

  const container = document.querySelector(".container");
  container.insertBefore(messageDiv, container.firstChild.nextSibling);

  // Remover mensaje después de 5 segundos
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 5000);
}

// Validar coordenadas UTM
function validateUTMCoordinates(easting, northing) {
  // Validaciones básicas para coordenadas UTM
  if (easting < 160000 || easting > 840000) {
    return {
      valid: false,
      message: "El valor Este UTM debe estar entre 160,000 y 840,000 metros",
    };
  }

  if (northing < 0 || northing > 10000000) {
    return {
      valid: false,
      message: "El valor Norte UTM debe estar entre 0 y 10,000,000 metros",
    };
  }

  return { valid: true };
}

// Inicializar el mapa
function initializeMap() {
  // Crear el mapa centrado en una ubicación por defecto
  map = L.map("map").setView([-12.0464, -77.0428], 10); // Lima, Perú como ejemplo

  // Capa de satélite por defecto
  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 18,
    }
  );

  // Capa de calles
  const streetLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }
  );

  // Agregar capa por defecto
  satelliteLayer.addTo(map);

  // Crear grupo de marcadores
  markersLayer = L.layerGroup().addTo(map);

  // Almacenar las capas para poder cambiar entre ellas
  map.satelliteLayer = satelliteLayer;
  map.streetLayer = streetLayer;
}

// Actualizar el mapa con los puntos actuales
function updateMap() {
  if (!map || !markersLayer) return;

  // Limpiar marcadores existentes
  markersLayer.clearLayers();

  if (points.length === 0) return;

  // Agregar marcadores para cada punto
  points.forEach((point) => {
    // Preparar información de altitud para el popup
    const altitudeInfo = point.altitude !== undefined && point.altitude !== null 
      ? `<p><strong>Altitud:</strong> ${point.altitude.toFixed(2)} m</p>` 
      : '';
    
    const marker = L.marker([point.latitude, point.longitude]).bindPopup(`
        <div>
          <h4>${point.name}</h4>
          <p><strong>Este UTM:</strong> ${point.esteUTM.toFixed(2)} m</p>
          <p><strong>Norte UTM:</strong> ${point.norteUTM.toFixed(2)} m</p>
          <p><strong>Latitud:</strong> ${point.latitude.toFixed(8)}°</p>
          <p><strong>Longitud:</strong> ${point.longitude.toFixed(8)}°</p>
          ${altitudeInfo}
        </div>
      `);

    markersLayer.addLayer(marker);
  });

  // Ajustar la vista del mapa para mostrar todos los puntos
  centerMap();
}

// Centrar el mapa en todos los puntos
function centerMap() {
  if (!map || points.length === 0) return;

  if (points.length === 1) {
    // Si solo hay un punto, centrarlo con zoom 15
    map.setView([points[0].latitude, points[0].longitude], 15);
  } else {
    // Si hay múltiples puntos, ajustar la vista para mostrar todos
    const group = new L.featureGroup(markersLayer.getLayers());
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Cambiar entre vista satelital y calles
function toggleMapView() {
  if (!map) return;

  if (currentMapView === "satellite") {
    map.removeLayer(map.satelliteLayer);
    map.addLayer(map.streetLayer);
    currentMapView = "street";
    showMessage("Cambiado a vista de calles", "success");
  } else {
    map.removeLayer(map.streetLayer);
    map.addLayer(map.satelliteLayer);
    currentMapView = "satellite";
    showMessage("Cambiado a vista satelital", "success");
  }
}

// Mostrar modal de ayuda
function showHelpModal() {
  document.getElementById("helpModal").style.display = "flex";
}

// Cerrar modal de ayuda
function closeHelpModal() {
  document.getElementById("helpModal").style.display = "none";
}

// Función para manejar la carga de archivos KML/KMZ
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const isKMZ = fileName.endsWith('.kmz');
  const isKML = fileName.endsWith('.kml');

  if (!isKMZ && !isKML) {
    showMessage("Por favor seleccione un archivo KML o KMZ válido", "error");
    return;
  }

  showUploadProgress(true);

  try {
    let kmlContent;
    
    if (isKMZ) {
      kmlContent = await extractKMLFromKMZ(file);
    } else {
      kmlContent = await readFileAsText(file);
    }

    const extractedPoints = await parseKMLContent(kmlContent);
    
    if (extractedPoints.length > 0) {
      // Agregar puntos extraídos a la lista actual
      points.push(...extractedPoints);
      pointCounter += extractedPoints.length;
      
      updatePointsTable();
      updateMap();
      
      showMessage(`Se extrajeron ${extractedPoints.length} puntos del archivo ${file.name}`, "success");
    } else {
      showMessage("No se encontraron puntos válidos en el archivo", "error");
    }
    
  } catch (error) {
    console.error("Error procesando archivo:", error);
    showMessage("Error al procesar el archivo. Verifique que sea un KML/KMZ válido", "error");
  } finally {
    showUploadProgress(false);
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    event.target.value = '';
  }
}

// Función para extraer KML de un archivo KMZ
async function extractKMLFromKMZ(file) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  
  // Buscar el archivo doc.kml o cualquier archivo .kml
  let kmlFile = contents.files['doc.kml'] || 
                Object.values(contents.files).find(f => f.name.endsWith('.kml'));
  
  if (!kmlFile) {
    throw new Error("No se encontró archivo KML dentro del KMZ");
  }
  
  return await kmlFile.async("text");
}

// Función para leer archivo como texto
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

// Función para parsear contenido KML y extraer coordenadas
async function parseKMLContent(kmlContent) {
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlContent, "text/xml");
  
  // Verificar si hay errores de parsing
  const parserError = kmlDoc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    throw new Error("Error al parsear el archivo KML");
  }
  
  const extractedPoints = [];
  
  // Buscar todos los elementos Placemark
  const placemarks = kmlDoc.getElementsByTagName("Placemark");
  
  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    
    // Obtener nombre del punto
    const nameElement = placemark.getElementsByTagName("name")[0];
    const pointName = nameElement ? nameElement.textContent.trim() : `Punto importado ${i + 1}`;
    
    // Buscar coordenadas en Point
    const pointElement = placemark.getElementsByTagName("Point")[0];
    if (pointElement) {
      const coordinatesElement = pointElement.getElementsByTagName("coordinates")[0];
      if (coordinatesElement) {
        const coordText = coordinatesElement.textContent.trim();
        const coords = parseCoordinates(coordText);
        
        if (coords) {
          // Convertir de LatLong a UTM
          const utmCoords = latLongToUTM(coords.latitude, coords.longitude);
          
          if (utmCoords) {
            extractedPoints.push({
              id: Date.now() + i,
              name: pointName,
              esteUTM: utmCoords.easting,
              norteUTM: utmCoords.northing,
              latitude: coords.latitude,
              longitude: coords.longitude,
              altitude: coords.altitude, // Incluir altitud si está presente
              source: 'imported' // Marcar como importado
            });
          }
        }
      }
    }
    
    // También buscar en LineString para extraer vértices
    const lineStringElement = placemark.getElementsByTagName("LineString")[0];
    if (lineStringElement) {
      const coordinatesElement = lineStringElement.getElementsByTagName("coordinates")[0];
      if (coordinatesElement) {
        const coordText = coordinatesElement.textContent.trim();
        const coordLines = coordText.split(/[\s\n]+/).filter(line => line.trim());
        
        coordLines.forEach((line, lineIndex) => {
          const coords = parseCoordinates(line);
          if (coords) {
            const utmCoords = latLongToUTM(coords.latitude, coords.longitude);
            
            if (utmCoords) {
              extractedPoints.push({
                id: Date.now() + i * 1000 + lineIndex,
                name: `${pointName} - Vértice ${lineIndex + 1}`,
                esteUTM: utmCoords.easting,
                norteUTM: utmCoords.northing,
                latitude: coords.latitude,
                longitude: coords.longitude,
                altitude: coords.altitude, // Incluir altitud si está presente
                source: 'imported' // Marcar como importado
              });
            }
          }
        });
      }
    }
    
    // Buscar en Polygon
    const polygonElement = placemark.getElementsByTagName("Polygon")[0];
    if (polygonElement) {
      const outerBoundary = polygonElement.getElementsByTagName("outerBoundaryIs")[0];
      if (outerBoundary) {
        const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
        if (linearRing) {
          const coordinatesElement = linearRing.getElementsByTagName("coordinates")[0];
          if (coordinatesElement) {
            const coordText = coordinatesElement.textContent.trim();
            const coordLines = coordText.split(/[\s\n]+/).filter(line => line.trim());
            
            coordLines.forEach((line, lineIndex) => {
              const coords = parseCoordinates(line);
              if (coords) {
                const utmCoords = latLongToUTM(coords.latitude, coords.longitude);
                
                if (utmCoords) {
                  extractedPoints.push({
                    id: Date.now() + i * 1000 + lineIndex,
                    name: `${pointName} - Vértice ${lineIndex + 1}`,
                    esteUTM: utmCoords.easting,
                    norteUTM: utmCoords.northing,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    altitude: coords.altitude, // Incluir altitud si está presente
                    source: 'imported' // Marcar como importado
                  });
                }
              }
            });
          }
        }
      }
    }
  }
  
  return extractedPoints;
}

// Función para parsear coordenadas individuales
function parseCoordinates(coordString) {
  const parts = coordString.trim().split(',');
  if (parts.length >= 2) {
    const longitude = parseFloat(parts[0]);
    const latitude = parseFloat(parts[1]);
    let altitude = null;
    
    // Capturar altitud si está presente (tercer valor)
    if (parts.length >= 3) {
      const altValue = parseFloat(parts[2]);
      if (!isNaN(altValue)) {
        altitude = altValue;
      }
    }
    
    if (!isNaN(longitude) && !isNaN(latitude)) {
      return { latitude, longitude, altitude };
    }
  }
  return null;
}

// Función para convertir LatLong a UTM
function latLongToUTM(latitude, longitude) {
  try {
    const [easting, northing] = proj4(wgs84, utmProjection, [longitude, latitude]);
    return {
      easting: parseFloat(easting.toFixed(2)),
      northing: parseFloat(northing.toFixed(2))
    };
  } catch (error) {
    console.error("Error en conversión LatLong a UTM:", error);
    return null;
  }
}

// Función para mostrar/ocultar progreso de carga
function showUploadProgress(show) {
  const progressElement = document.getElementById("uploadProgress");
  if (progressElement) {
    progressElement.style.display = show ? "block" : "none";
  }
}

// Función para exportar a Excel (CSV)
function exportToExcel() {
  if (points.length === 0) {
    showMessage("No hay puntos para exportar", "error");
    return;
  }

  const zone = document.getElementById("utmZone").value;
  const hemisphere = document.getElementById("hemisphere").value;
  
  // Crear contenido CSV con punto y coma como separador de columnas y coma como separador decimal
  let csvContent = "Nombre;Este UTM;Norte UTM;Zona UTM;Latitud;Longitud;Altitud (m);Origen\n";

  function formatNumber(num, decimals = 2) {
    // Usar coma como separador decimal
    if (num === undefined || num === null) return '';
    return num.toFixed(decimals).replace('.', ',');
  }

  points.forEach(point => {
    const sourceLabel = {
      'manual': 'Manual',
      'bulk': 'Masivo',
      'imported': 'Archivo KML/KMZ'
    };
    
    // Formatear altitud para CSV
    const altitudeValue = formatNumber(point.altitude);
    
    csvContent += `"${point.name}";"${formatNumber(point.esteUTM)}";"${formatNumber(point.norteUTM)}";"${zone}${hemisphere}";"${formatNumber(point.latitude, 8)}";"${formatNumber(point.longitude, 8)}";"${altitudeValue}";"${sourceLabel[point.source] || 'Desconocido'}"\n`;
  });

  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const filename = `coordenadas_utm_zona_${zone}${hemisphere}_${new Date().toISOString().slice(0, 10)}.csv`;
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  showMessage(`Archivo ${filename} exportado correctamente`, "success");
}

// Configurar funcionalidad de arrastrar y soltar
function setupDragAndDrop() {
  const uploadTab = document.getElementById('upload-tab');
  const fileUpload = uploadTab.querySelector('.file-upload');
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    fileUpload.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    fileUpload.classList.add('dragover');
  }

  function unhighlight(e) {
    fileUpload.classList.remove('dragover');
  }

  fileUpload.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      const file = files[0];
      // Simular el evento de cambio del input file
      const fileInput = document.getElementById('fileInput');
      
      // Crear un nuevo evento de cambio
      const event = { target: { files: [file] } };
      handleFileUpload(event);
    }
  }
}
