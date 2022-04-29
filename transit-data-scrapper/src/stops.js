/**
 * Fetch the bus stops names available
 * @returns Array with the available bus stops names
 */
 async function getBusStops()
 {
    const fetch = require('node-fetch');
 
    const busStops = `https://www.red.cl/restservice_v2/rest/getparadas/all`;
 
    let lines;
    await fetch(busStops)
    .then(response => response.json())
    .then(data => lines = data);
    
    return lines;
 }

(async() =>console.log(await getBusStops() ))();