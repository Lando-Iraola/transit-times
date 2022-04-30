const fetch = require('node-fetch');
/**
 * Fetch the bus stops names available
 * @returns Array with the available bus stops names
 */
async function getBusStops()
{
   const busStops = `https://www.red.cl/restservice_v2/rest/getparadas/all`;

   let lines;
   await fetch(busStops)
   .then(response => response.json())
   .then(data => lines = data);
   
   return lines;
}

/**
 * Extracts bus line data from red.cl
 * @param {*} bus number of the bus
 * @returns object with lines data
 */
async function getLinesByBus(bus = "321")
{
   const linesByBus = `https://www.red.cl/restservice_v2/rest/conocerecorrido?codsint=${bus}`;
   
   let lines;
   await fetch(linesByBus)
   .then(response => response.json())
   .then(data => lines = data);

   const alterObject = {};
   extractStops(lines.ida, bus, alterObject);
   extractStops(lines.regreso, bus, alterObject);

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
      throw Error("Failed bus lines data extraction. No data received");
   if(!bus)
      throw Error("Failed bus lines data extraction. No bus specified");
   if(!alterObject)
      throw Error("Failed bus lines data extraction. No object reference for modification given");;

   bus = bus.toLowerCase();

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

module.exports = 
{
   getBusStops,
   getLinesByBus
}