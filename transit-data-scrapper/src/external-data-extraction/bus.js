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

/**
 * In Chile, bus numbers start with capital letters and end with lower case letters should they have any
 * @param {*} bus bus number
 * @returns formated bus number
 */
 function formatBusNumber(bus)
 {
    bus = bus.toUpperCase();
    let splitNumber = bus.split("");
    let lastIndex = splitNumber.length - 1;
    lastChar = splitNumber[lastIndex];
 
    if(isNaN(lastChar))
    {
       lastChar = lastChar.toLowerCase();
       splitNumber[lastIndex] = lastChar;
       bus = splitNumber.join("");
    }
 
    return bus;
 }
 

module.exports = {getServiceLines, formatBusNumber}