/**
 * Fetch the service lines available
 * @returns Array with the available lines
 */
async function getServiceLines()
{
   const fetch = require('node-fetch');

   const busLines = `https://www.red.cl/restservice_v2/rest/getservicios/all`;

   let lines;
   await fetch(busLines)
   .then(response => response.json())
   .then(data => lines = data);
   
   return lines;
}

module.exports = {getServiceLines}