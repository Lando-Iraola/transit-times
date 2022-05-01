const {formatBusNumber} = require("./bus");
/**
 * Get the HTML body of red.cl
 * @returns HTML string
 */
async function getBody()
{
    const fetch = require('node-fetch');

    const tokenHost = `https://www.red.cl/en/plan-your-trip/live-arrivals/`;

    let body;
    await fetch(tokenHost)
    .then(response => response.text())
    .then(data => body = data);

    return body;
}
 
/**
 * Extracts the base64 encoded JWT token embedded in HTML
 * @returns JWT token used to make requests on red.cl
 */
async function extractToken()
{
    let body = await getBody();
    let lookFor = /\$jwt\s*=\s*'(.*?)';/;
    let token = lookFor.exec(body)[1];
    
    return atob(token); //They do this on the website I'm taking the data from. The token comes in base64 apparently
}
 
/**
 * Gets data for a specified bus stop
 * @param {*} token is a jwt token required by the red.cl API
 * @returns object containing the API's data
 */
async function getBusData(token, stop, bus)
{
    const url = `https://www.red.cl/predictor/prediccion?t=${token}&codsimt=${stop}&codser=`;
    const fetch = require('node-fetch');
    let busData;
    await fetch(url)
    .then(response => response.json())
    .then(data => busData = data);
    
    busData = cleanData(busData, bus, stop);

    return busData;
}

/**
 * This will transform the ongoing data into something more desirable to this application
 * The original data is too messy for me
 * @param {*} data Source this from red.cl
 * @param {*} bus The bus number
 * @param {*} stop The stop code
 * @returns Object with ongoing bus data
 */
function cleanData(data, bus, stop)
{
    bus = formatBusNumber(bus);
    data = data.servicios.item.filter(b => b.servicio.toLowerCase() === bus.toLowerCase())[0];

    const first = extractTime(data.horaprediccionbus1);
    const second = extractTime(data.horaprediccionbus2);
    let vehicle = [];
    if(data.ppubus1)
    {
        vehicle.push(
            {
                distanceFromStop: data.distanciabus1,
                estimatedTimeUntilArrival: {...first},
                licensePlate: data.ppubus1
            }
        );
    }
    if(data.ppubus2)
    {
        vehicle.push(
            {
                distanceFromStop: data.distanciabus2,
                estimatedTimeUntilArrival: {...second},
                licensePlate: data.ppubus2
            }
        );
    }
    let newFormat = 
    {
        [`${stop}-${bus}`]:
        {
            bus,
            stop,
            date: new Date().toISOString(),
            vehicle
        }
    }

    return newFormat;
}
/**
 * Extracts the minutes from the incoming data. 
 * Also, it assumes some numerical values given some 
 * constant strings the service sends.
 * @param {*} timeString string containing a description of when the bus might arrive
 * @returns Object with integers depicting a range of time in minutes
 */
function extractTime(timeString)
{
    let lookFor = /(\d+)/g;

    let low = null;
    let high = null;
    
    if(timeString !== null)
    {
        let regexMatch = timeString.match(lookFor);
        if(timeString.includes("Menos"))
        {
            low = 0;
            high = parseInt(regexMatch[0], 10);
        }
        else if(timeString === "Llegando.")
        {
            low = 0;
            high = 3;
        }
        else
        {
            low = parseInt(regexMatch[0], 10);
            high = parseInt(regexMatch[1], 10);
        }
    }

    return {low, high, unit: "minutes"}
}
module.exports =
{
    getBusData,
    extractToken
}