export const isWithinRadius = (searchLat, searchLng, Latitude, Longitude, radiusInKm) => {
  const searchLatNum = parseFloat(searchLat);
  const searchLngNum = parseFloat(searchLng);
  const enodeBLatNum = parseFloat(Latitude);
  const enodeBLngNum = parseFloat(Longitude);

  console.log('searchLatNum:', searchLatNum);
  console.log('searchLngNum:', searchLngNum);
  console.log('enodeBLatNum:', enodeBLatNum);
  console.log('enodeBLngNum:', enodeBLngNum);

  if (isNaN(searchLatNum) || isNaN(searchLngNum) || isNaN(enodeBLatNum) || isNaN(enodeBLngNum)) {
    return 'Invalid coordinates';
  }

  const distance = haversineDistance(enodeBLatNum, enodeBLngNum, searchLatNum, searchLngNum);
  console.log('distance:', distance);
  
  return distance <= radiusInKm ? 'Network available' : 'No connectivity';
};



export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  // Radius of the Earth in kilometers
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Distance in kilometers
  const distance = R * c;
  return distance;
};
