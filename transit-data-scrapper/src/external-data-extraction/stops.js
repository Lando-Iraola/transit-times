const {formatBusNumber} = require("./bus");
/**
 * Extracts bus line data from red.cl
 * @param {*} bus number of the bus
 * @returns object with lines data
 */
async function getLinesByBus(bus)
{
   bus = formatBusNumber(bus);
   const linesByBus = `https://www.red.cl/restservice_v2/rest/conocerecorrido?codsint=${bus}`;
   
   const fetch = require('node-fetch');
   let lines;
   await fetch(linesByBus)
   .then(response => response.json())
   .then(data => lines = data);

   const forward = extractStops(lines.ida, bus);
   const backward = extractStops(lines.regreso, bus);
   const forwardKey = Object.keys(forward)[0];
   const backwardKey = Object.keys(backward)[0];

   let busLines = {};
   busLines[bus] = 
   {
      bus: bus,
      lines: 
      {
         [forwardKey]: {stops: forward[forwardKey]},
         [backwardKey]: {stops: backward[backwardKey]}
      }
   }

   return busLines;
}

/**
 * Modifies the data structure given by red.cl
 * @param {*} dataToProcess Original data from red.cl, must be either object.ida or object.regreso
 * @param {*} bus Bus number
 * @returns Object with the line name and its stops
 */
function extractStops(dataToProcess, bus)
{
   if(!dataToProcess)
      throw Error("Failed bus lines data extraction. \nNo data received");
   if(!bus)
      throw Error("Failed bus lines data extraction. \nNo bus specified");

   let destination;
   let stops = {};
   dataToProcess.paraderos.forEach(
      paradero =>
      {
         const extractingBus = paradero.servicios.filter(b => b.cod === bus)[0];
         if(!destination && extractingBus.destino !== "Fin de recorrido")
            destination = extractingBus.destino

         stops[paradero.cod] = 
         {
            stop: paradero.cod,
            stopOrder: extractingBus.orden,
            commune: paradero.comuna,
            geoLocation: paradero.pos,
            street: paradero.name,
            endOfTrip: extractingBus.destino === "Fin de recorrido"
         }
      }
   );

   for(s in stops)
   {
      stops[s].previous = findBackNeighbor(s, stops);
      stops[s].next = findForwardNeighbor(s, stops);
   }

   let lines = {};
   lines[destination] = stops;
   
   return lines;
}
/**
 * Find the previous stop in relation to the stop in examination
 * @param {*} stop key of the stop in examination of the stops object. 
 * @param {*} stops object with all the stops
 * @returns the key of the neighboring stop. if it doesn't exist, then null
 */
function findBackNeighbor(stop, stops)
{
   const backNeighbor = stops[stop].stopOrder - 1;
   if(backNeighbor === 0)
      return null;
   
   for(s in stops)
   {
      if(stops[s].stopOrder === backNeighbor)
         return stops[s].stop;
   }
   
   return null;
}

/**
 * Find the next stop in relation to the stop in examination
 * @param {*} stop key of the stop in examination of the stops object. 
 * @param {*} stops object with all the stops
 * @returns the key of the neighboring stop. if it doesn't exist, then null
 */
function findForwardNeighbor(stop, stops)
{
   const forwardNeighbor = stops[stop].stopOrder + 1;
   
   for(s in stops)
   {
      if(stops[s].stopOrder === forwardNeighbor)
         return stops[s].stop;
   }
   
   return null;
}

module.exports = 
{
   getLinesByBus
}