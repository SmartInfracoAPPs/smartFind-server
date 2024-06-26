// Utility function to check if a point is within a circular DIV
export const isWithinCircularDIV = (searchLat, searchLng, centerLat, centerLng, radiusInKm) => {
  const searchLatNum = parseFloat(searchLat);
  const searchLngNum = parseFloat(searchLng);
  const centerLatNum = parseFloat(centerLat);
  const centerLngNum = parseFloat(centerLng);

  if (isNaN(searchLatNum) || isNaN(searchLngNum) || isNaN(centerLatNum) || isNaN(centerLngNum)) {
    return 'Invalid coordinates';
  }

  const distance = haversineDistance(centerLatNum, centerLngNum, searchLatNum, searchLngNum);
  return distance <= radiusInKm ? 'Within circular DIV' : 'Outside circular DIV';
};

// Utility function to check if a point is within a polygonal DIV
export const isWithinPolygonalDIV = (searchLat, searchLng, polygon) => {
  const searchLatNum = parseFloat(searchLat);
  const searchLngNum = parseFloat(searchLng);

  if (isNaN(searchLatNum) || isNaN(searchLngNum)) {
    return 'Invalid coordinates';
  }

  const isInside = isPointInPolygon(searchLatNum, searchLngNum, polygon);
  return isInside ? 'Within polygonal DIV' : 'Outside polygonal DIV';
};

// Haversine distance function remains the same
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Function to determine if a point is in a polygon using ray-casting algorithm
export const isPointInPolygon = (lat, lng, polygon) => {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
};

// Example usage
const searchLat = 12.9716; // example latitude
const searchLng = 77.5946; // example longitude

// Circular DIV example
const centerLat = 12.9716; // center latitude of the circular DIV
const centerLng = 77.5946; // center longitude of the circular DIV
const radiusInKm = 3; // radius of the circular DIV in kilometers

console.log(isWithinCircularDIV(searchLat, searchLng, centerLat, centerLng, radiusInKm));

// Polygonal DIV example
const polygon = [
  [12.9716, 77.5946],
  [12.9717, 77.5947],
  [12.9718, 77.5948],
  [12.9719, 77.5949],
]; // example polygon coordinates
console.log(isWithinPolygonalDIV(searchLat, searchLng, polygon));

// Modified endpoint
app.post('/checkConnectivity', async (req, res, next) => {
  console.log('Received request data:', req.body);
  
  const { clientlatitude, clientlongitude } = req.body;

  try {
    const basestations = await Basestation.find({}, 'Latitude Longitude');
    const divs = await Div.find({});

    let connectivityStatusLTE = 'No connectivity';
    let connectivityStatusDIV = 'Outside DIV';

    // Check LTE connectivity
    for (const basestation of basestations) {
      const { Latitude, Longitude } = basestation._doc;

      if (isNaN(Latitude) || isNaN(Longitude)) {
        console.log('Invalid coordinates');
        continue;
      }

      const radiusInKm = 10;
      connectivityStatusLTE = isWithinRadius(clientlatitude, clientlongitude, Latitude, Longitude, radiusInKm);
      
      if (connectivityStatusLTE === 'Network available') {
        req.nLat = Latitude;
        req.nLng = Longitude; // Store the values in the request object
        break;
      }
    }

    // Check DIV connectivity (Circular and Polygonal)
    for (const div of divs) {
      const { centerLat, centerLng, radiusInKm, polygon } = div; // Assume these fields exist in DivSchema

      const circularDIVStatus = isWithinCircularDIV(clientlatitude, clientlongitude, centerLat, centerLng, radiusInKm);
      const polygonalDIVStatus = isWithinPolygonalDIV(clientlatitude, clientlongitude, polygon);

      if (circularDIVStatus === 'Within circular DIV' || polygonalDIVStatus === 'Within polygonal DIV') {
        connectivityStatusDIV = 'Inside DIV';
        break; 
        // Exit the loop if within any DIV
      }
    }

    // Combine results
    if (connectivityStatusLTE === 'Network available' || connectivityStatusDIV === 'Inside DIV') {
      const responseData = { 
        message: 'Network is Available', 
        LTEStatus: connectivityStatusLTE, 
        DIVStatus: connectivityStatusDIV, 
        coordinates: { nLat: req.nLat, nLng: req.nLng } 
      };
      console.log('Sending response data:', responseData);
      return res.json(responseData);
    }

    const noConnectivityResponse = { 
      message: 'No connectivity', 
      LTEStatus: connectivityStatusLTE, 
      DIVStatus: connectivityStatusDIV 
    };
    console.log('Sending response data:', noConnectivityResponse);
    res.json(noConnectivityResponse);

  } catch (error) {
    console.error('Error querying basestations or divs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

