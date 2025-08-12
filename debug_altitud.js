// Script de debug para probar altitud
console.log("=== DEBUGGING ALTITUD ===");

// Simular un punto con altitud para prueba
const testPointWithAltitude = {
  id: 999999,
  name: "Test Point with Altitude",
  esteUTM: 441143.76,
  norteUTM: 7536713.21,
  latitude: -12.0464,
  longitude: -77.0428,
  altitude: 150.5,
  source: 'manual'
};

// Simular un punto sin altitud para comparación
const testPointWithoutAltitude = {
  id: 999998,
  name: "Test Point without Altitude",
  esteUTM: 441200.00,
  norteUTM: 7536800.00,
  latitude: -12.0465,
  longitude: -77.0429,
  altitude: null,
  source: 'manual'
};

console.log("Punto con altitud:", testPointWithAltitude);
console.log("Punto sin altitud:", testPointWithoutAltitude);

// Test de formateo de altitud
function testAltitudeFormatting() {
  const testCases = [
    { altitude: 150.5, expected: "150.50 m" },
    { altitude: 0, expected: "0.00 m" },
    { altitude: null, expected: "" },
    { altitude: undefined, expected: "" },
    { altitude: 2430.123, expected: "2430.12 m" }
  ];
  
  testCases.forEach(testCase => {
    const result = testCase.altitude !== undefined && testCase.altitude !== null 
      ? testCase.altitude.toFixed(2) + ' m' 
      : '';
    console.log(`Altitud: ${testCase.altitude} -> Resultado: "${result}" (Esperado: "${testCase.expected}")`);
    console.assert(result === testCase.expected, `Error en formateo de altitud: ${testCase.altitude}`);
  });
}

testAltitudeFormatting();
console.log("=== FIN DEBUG ===");
