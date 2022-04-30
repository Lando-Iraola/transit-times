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

   const alterObject = {};
   extractStops(lines.ida, bus, alterObject);
   extractStops(lines.regreso, bus, alterObject);

   addNeighboringStops(alterObject);

   return alterObject;
}

/**
 * Modifies the data structure given by red.cl
 * @param {*} dataToProcess By the given url in getLinesByBus this is either object.ida or object.regreso
 * @param {*} bus Bus number
 * @param {*} alterObject Object to be modified by reference
 */
function extractStops(dataToProcess, bus, alterObject)
{
   if(!dataToProcess)
      throw Error("Failed bus lines data extraction. \nNo data received");
   if(!bus)
      throw Error("Failed bus lines data extraction. \nNo bus specified");
   if(!alterObject)
      throw Error("Failed bus lines data extraction. \nNo object reference for modification given");

   dataToProcess.paraderos.forEach(
      paradero =>
      {
         paradero.servicios.forEach(
            servicio =>
            {
               if(servicio.cod != bus)
                  return;

               if(!alterObject[servicio.cod])
               {
                  alterObject[servicio.cod] = {};
                  alterObject[servicio.cod].bus = servicio.cod;
                  alterObject[servicio.cod].lines = {};
               }

               if(!alterObject[servicio.cod].lines[servicio.destino] && servicio.destino.toLowerCase() !== "fin de recorrido")
               {
                  alterObject[servicio.cod].lines[servicio.destino] = 
                  {
                        destination: servicio.destino,
                        stops: 
                        {
                           [paradero.cod] :
                           {
                              stop : paradero.cod,
                              stopOrder : servicio.orden,
                              commune: paradero.comuna,
                              geoLocation: paradero.pos,
                              street: paradero.name,
                              endOfTrip: false
                           }
                        }
                  }
               }
               else if(servicio.destino.toLowerCase() !== "fin de recorrido")
               {
                  alterObject[servicio.cod]
                  .lines[servicio.destino]
                  .stops[paradero.cod] =
                  {
                        stop : paradero.cod,
                        stopOrder : servicio.orden,
                        commune: paradero.comuna,
                        geoLocation: paradero.pos,
                        street: paradero.name,
                        endOfTrip: false
                  }
                  
               }
               else
               {
                  const entries = Object.keys(alterObject[bus].lines);
                  for(let i = 0; i < entries.length; i++)
                  {
                        let communeEntry = Object.keys(alterObject[bus].lines[entries[i]].stops);
                        communeEntry = communeEntry[communeEntry.length - 1];
                        if(alterObject[bus].lines[entries[i]].stops[communeEntry].commune === paradero.comuna)
                        {
                           alterObject[servicio.cod]
                           .lines[entries[i]]
                           .stops[paradero.cod] =
                           {
                              stop : paradero.cod,
                              stopOrder : servicio.orden,
                              commune: paradero.comuna,
                              geoLocation: paradero.pos,
                              street: paradero.name,
                              endOfTrip: true
                           }
                           break;
                        }
                  }
                  
               }
            }
         )
      }
   )
}

function addNeighboringStops(alterObject)
{
   if(!alterObject)
      throw Error("Failed bus lines data extraction. \nCouldn't add neighbaring stops data. \nNo object reference for modification given");
   
   const busNumber = Object.keys(alterObject)[0];
   for(line in alterObject[busNumber].lines)
   {
      const alteringLine = alterObject[busNumber].lines[line];
      const stops = alteringLine.stops;
      for(busStop in stops)
      {
         const alteringBusStop = stops[busStop];
         const nextOrder = alteringBusStop.stopOrder + 1;
         const previousOrder = alteringBusStop.stopOrder - 1;

         findNeighboringStops(alteringBusStop, stops, nextOrder, previousOrder);
      }
   }
}

function findNeighboringStops(stopUnderAlteration, stops, next, previous)
{
   if(previous === 0)
      stopUnderAlteration.previous = null;

   for(busStop in stops)
   {
      if(busStop === stopUnderAlteration.stop)
         continue;      

      if(stopUnderAlteration.hasOwnProperty("previous") && stopUnderAlteration.hasOwnProperty("next"))
         break;
      
      if(stops[busStop].stopOrder === next)
         stopUnderAlteration.next = busStop;
      if(stops[busStop].stopOrder === previous)
         stopUnderAlteration.previous = busStop;
   }

   if(!stopUnderAlteration.hasOwnProperty("next"))
   {
      stopUnderAlteration.next = null;
   }
}

module.exports = 
{
   getLinesByBus
}