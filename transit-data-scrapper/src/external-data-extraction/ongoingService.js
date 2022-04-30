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
    data = data.servicios.item.filter(b => b.servicio === bus)[0];

    let newFormat = 
    {
        [`${stop}-${bus}`]:
        {
            bus,
            stop,
            date: new Date().toISOString(),
            vehicle:
            [
                {
                    distanceFromStop: data.distanciabus1,
                    timeUntilArrival: data.horaprediccionbus1,
                    licensePlate: data.ppubus1
                },
                {
                    distanceFromStop: data.distanciabus2,
                    timeUntilArrival: data.horaprediccionbus2,
                    licensePlate: data.ppubus2
                }
            ]
        }
    }

    return newFormat;
}

module.exports =
{
    getBusData,
    extractToken
}