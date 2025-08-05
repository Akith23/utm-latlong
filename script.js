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
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${point.name}</td>
            <td>${point.esteUTM.toFixed(2)}</td>
            <td>${point.norteUTM.toFixed(2)}</td>
            <td>${point.latitude.toFixed(8)}</td>
            <td>${point.longitude.toFixed(8)}</td>
            <td>
                <button class="btn-remove" onclick="removePoint(${
                  point.id
                })">Eliminar</button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  // Habilitar/deshabilitar botón de generar KML
  const generateBtn = document.querySelector(".btn-generate");
  if (generateBtn) {
    generateBtn.disabled = points.length === 0;
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
    const marker = L.marker([point.latitude, point.longitude]).bindPopup(`
        <div>
          <h4>${point.name}</h4>
          <p><strong>Este UTM:</strong> ${point.esteUTM.toFixed(2)} m</p>
          <p><strong>Norte UTM:</strong> ${point.norteUTM.toFixed(2)} m</p>
          <p><strong>Latitud:</strong> ${point.latitude.toFixed(8)}°</p>
          <p><strong>Longitud:</strong> ${point.longitude.toFixed(8)}°</p>
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
