// Script de debug para coordenadas de España
// Para usar en la consola del navegador

async function testSpainCoordinates() {
    console.log("=== Testeando coordenadas de España ===");
    
    // Coordenadas de ejemplo de España (UTM Zone 30N)
    const testPoints = [
        { name: "Madrid", este: 440000, norte: 4474000, zone: 30 },
        { name: "Barcelona", este: 431000, norte: 4582000, zone: 31 },
        { name: "Valencia", este: 725000, norte: 4372000, zone: 30 },
        { name: "Sevilla", este: 235000, norte: 4142000, zone: 30 }
    ];
    
    for (const point of testPoints) {
        console.log(`\n--- Testeando ${point.name} ---`);
        console.log(`Coordenadas UTM: ${point.este}, ${point.norte} (Zona ${point.zone})`);
        
        // Convertir a lat/long
        const latLong = utmToLatLong(point.este, point.norte);
        if (latLong) {
            console.log(`Lat/Long: ${latLong.latitude.toFixed(6)}, ${latLong.longitude.toFixed(6)}`);
            
            // Obtener altitud
            console.log("Obteniendo altitud...");
            try {
                const altitude = await getElevation(latLong.latitude, latLong.longitude);
                console.log(`Altitud: ${altitude ? altitude + ' m' : 'No disponible'}`);
            } catch (error) {
                console.error("Error obteniendo altitud:", error);
            }
        } else {
            console.log("Error en conversión UTM a Lat/Long");
        }
    }
}

// Función para testear las APIs de altitud directamente
async function testElevationAPIs() {
    console.log("\n=== Testeando APIs de Altitud ===");
    
    // Coordenadas de Madrid
    const lat = 40.4168;
    const lon = -3.7038;
    
    console.log(`Coordenadas de prueba: ${lat}, ${lon} (Madrid)`);
    
    // Test Open-Elevation
    console.log("\n--- Open-Elevation API ---");
    try {
        const elevation1 = await getElevationFromOpenElevation(lat, lon);
        console.log(`Resultado: ${elevation1 ? elevation1 + ' m' : 'No disponible'}`);
    } catch (error) {
        console.error("Error con Open-Elevation:", error);
    }
    
    // Test USGS (solo funciona en EE.UU.)
    console.log("\n--- USGS API ---");
    try {
        const elevation2 = await getElevationFromUSGS(lat, lon);
        console.log(`Resultado: ${elevation2 ? elevation2 + ' m' : 'No disponible (esperado para España)'}`);
    } catch (error) {
        console.error("Error con USGS:", error);
    }
}

// Ejecutar ambos tests
async function runAllTests() {
    await testSpainCoordinates();
    await testElevationAPIs();
    console.log("\n=== Tests completados ===");
}

console.log("Para ejecutar los tests, usa:");
console.log("runAllTests()");
console.log("testSpainCoordinates()");
console.log("testElevationAPIs()");
