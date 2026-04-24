/**
 * CRYSIS OS Emergency Data
 * Durgapur-Asansol Region Dataset
 * 
 * This data structure is scalable for any city.
 * Each service type has:
 * - name: Display name
 * - lat/lng: Geographic coordinates
 * - phone: Contact number
 * - address: Physical location
 * - capacity: Resource count
 */

export const emergencyData = {
  // Police Stations
  policeStations: [
    { id: "police_001", name: "Asansol North Police Station", lat: 23.6875, lng: 87.2667, phone: "100", address: "Asansol North", capacity: 50 },
    { id: "police_002", name: "Durgapur Police Station", lat: 23.4833, lng: 87.3167, phone: "100", address: "Durgapur Downtown", capacity: 45 },
    { id: "police_003", name: "Kulti Police Station", lat: 23.6833, lng: 87.1333, phone: "100", address: "Kulti Area", capacity: 30 },
    { id: "police_004", name: "Asansol South Police Station", lat: 23.6333, lng: 87.2833, phone: "100", address: "Asansol South", capacity: 40 },
    { id: "police_005", name: "New Township Police Station", lat: 23.4917, lng: 87.2333, phone: "100", address: "Durgapur Township", capacity: 35 },
    { id: "police_006", name: "Baraboni Police Station", lat: 23.4167, lng: 87.3667, phone: "100", address: "Baraboni", capacity: 25 },
    { id: "police_007", name: "Asansol Women Police Station", lat: 23.6583, lng: 87.2917, phone: "100", address: "Asansol City", capacity: 20 },
    { id: "police_008", name: "Coke Oven Police Station", lat: 23.6917, lng: 87.3083, phone: "100", address: "Coke Oven Area", capacity: 28 },
    { id: "police_009", name: "Hirapur Police Station", lat: 23.5583, lng: 87.1917, phone: "100", address: "Hirapur", capacity: 22 },
    { id: "police_010", name: "Cyber Crime Police Station", lat: 23.6667, lng: 87.3, phone: "100", address: "Asansol", capacity: 15 },
    { id: "police_011", name: "Andal Police Station", lat: 23.5833, lng: 87.3583, phone: "100", address: "Andal", capacity: 20 },
    { id: "police_012", name: "Salanpur Police Station", lat: 23.4583, lng: 87.45, phone: "100", address: "Salanpur", capacity: 18 },
    { id: "police_013", name: "Jamuria Police Station", lat: 23.4167, lng: 87.55, phone: "100", address: "Jamuria", capacity: 16 },
    { id: "police_014", name: "Faridpur Police Station", lat: 23.38, lng: 87.3333, phone: "100", address: "Faridpur", capacity: 12 },
    { id: "police_015", name: "Chittaranjan Police Station", lat: 23.35, lng: 87.1667, phone: "100", address: "Chittaranjan", capacity: 14 },
    { id: "police_016", name: "Raniganj Police Station", lat: 23.3833, lng: 87.55, phone: "100", address: "Raniganj", capacity: 18 },
    { id: "police_017", name: "Pandabeswar Police Station", lat: 23.52, lng: 87.65, phone: "100", address: "Pandabeswar", capacity: 16 },
    { id: "police_018", name: "Durgapur Women Police Station", lat: 23.4917, lng: 87.3333, phone: "100", address: "Durgapur", capacity: 18 },
    { id: "police_019", name: "Kanksa Police Station", lat: 23.5417, lng: 87.4333, phone: "100", address: "Kanksa", capacity: 14 },
    { id: "police_020", name: "Budbud Police Station", lat: 23.505, lng: 87.285, phone: "100", address: "Budbud", capacity: 13 }
  ],

  // Hospitals & Medical Centers
  hospitals: [
    { id: "hosp_001", name: "Mission Hospital", lat: 23.4917, lng: 87.3167, phone: "0343-2501111", address: "Durgapur Downtown", capacity: 500, ICU: 50, beds: 300 },
    { id: "hosp_002", name: "IQ City Medical College", lat: 23.5083, lng: 87.2667, phone: "0343-2560666", address: "IQ City, Durgapur", capacity: 400, ICU: 40, beds: 250 },
    { id: "hosp_003", name: "Asansol District Hospital", lat: 23.6667, lng: 87.2833, phone: "0340-2240251", address: "Asansol Central", capacity: 300, ICU: 30, beds: 200 },
    { id: "hosp_004", name: "Ashok Nursing Home", lat: 23.48, lng: 87.32, phone: "0343-2510234", address: "Durgapur", capacity: 100, ICU: 5, beds: 80 },
    { id: "hosp_005", name: "Prabhat Diagnostic Centre", lat: 23.52, lng: 87.3334, phone: "0343-2505000", address: "Durgapur", capacity: 50, ICU: 0, beds: 0 },
    { id: "hosp_006", name: "Kulti Primary Health Centre", lat: 23.6833, lng: 87.1333, phone: "0341-2253001", address: "Kulti", capacity: 80, ICU: 2, beds: 40 },
    { id: "hosp_007", name: "Baraboni Community Health", lat: 23.4167, lng: 87.3667, phone: "0343-2502120", address: "Baraboni", capacity: 50, ICU: 0, beds: 30 },
    { id: "hosp_008", name: "Andal Primary Health", lat: 23.5833, lng: 87.3583, phone: "0341-2254001", address: "Andal", capacity: 40, ICU: 0, beds: 25 }
  ],

  // Fire Stations
  fireStations: [
    { id: "fire_001", name: "Durgapur Fire Station", lat: 23.4917, lng: 87.3167, phone: "101", address: "Durgapur Downtown", vehicles: 6 },
    { id: "fire_002", name: "Asansol Fire Station", lat: 23.6667, lng: 87.2833, phone: "101", address: "Asansol Central", vehicles: 8 },
    { id: "fire_003", name: "New Township Fire Sub-Station", lat: 23.4917, lng: 87.2333, phone: "101", address: "Durgapur Township", vehicles: 3 },
    { id: "fire_004", name: "Kulti Fire Sub-Station", lat: 23.6833, lng: 87.1333, phone: "101", address: "Kulti", vehicles: 2 }
  ],

  // Shelters & Relief Centers
  shelters: [
    { id: "shelter_001", name: "Durgapur Municipal Stadium", lat: 23.49, lng: 87.32, address: "Durgapur", capacity: 5000, type: "Community Center" },
    { id: "shelter_002", name: "Asansol Town Hall", lat: 23.667, lng: 87.283, address: "Asansol", capacity: 2000, type: "Community Center" },
    { id: "shelter_003", name: "Government School Durgapur", lat: 23.48, lng: 87.33, address: "Durgapur", capacity: 1000, type: "School" },
    { id: "shelter_004", name: "Government School Asansol", lat: 23.67, lng: 87.28, address: "Asansol", capacity: 1500, type: "School" },
    { id: "shelter_005", name: "Salanpur Community Hall", lat: 23.4583, lng: 87.45, address: "Salanpur", capacity: 800, type: "Community Center" }
  ],

  // Important Places (Schools, Government Buildings, etc.)
  importantPlaces: [
    { id: "imp_001", name: "Durgapur Municipal Corporation", lat: 23.49, lng: 87.33, type: "Government", phone: "0343-2500123" },
    { id: "imp_002", name: "Asansol Municipal Corporation", lat: 23.667, lng: 87.283, type: "Government", phone: "0340-2240111" },
    { id: "imp_003", name: "District Headquarters", lat: 23.667, lng: 87.283, type: "Government", phone: "0340-2240001" },
    { id: "imp_004", name: "Railway Station Durgapur", lat: 23.505, lng: 87.285, type: "Transportation", phone: "0343-2505555" },
    { id: "imp_005", name: "Railway Station Asansol", lat: 23.675, lng: 87.3, type: "Transportation", phone: "0340-2283555" },
    { id: "imp_006", name: "Bus Station Durgapur", lat: 23.49, lng: 87.32, type: "Transportation", phone: "0343-2500500" },
    { id: "imp_007", name: "Central Business District", lat: 23.48, lng: 87.32, type: "Commercial", phone: "" }
  ],

  // High-Risk Zones (Industrial, Water bodies, etc.)
  highRiskZones: [
    { id: "risk_001", name: "Durgapur Steel Plant Area", lat: 23.485, lng: 87.315, radius: 2, type: "Industrial" },
    { id: "risk_002", name: "ASP Industrial Zone", lat: 23.675, lng: 87.31, radius: 3, type: "Industrial" },
    { id: "risk_003", name: "Damodar River (Flood Zone)", lat: 23.52, lng: 87.4, radius: 1.5, type: "Water" },
    { id: "risk_004", name: "Chemical Processing Plants", lat: 23.47, lng: 87.35, radius: 2.5, type: "Industrial" }
  ]
};

export default emergencyData;
