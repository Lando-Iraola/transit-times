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
async function getBusData(token, stop)
{
    const url = `https://www.red.cl/predictor/prediccion?t=${token}&codsimt=${stop}&codser=`;
    const fetch = require('node-fetch');
    let busData;
    await fetch(url)
    .then(response => response.json())
    .then(data => busData = data);
 
    return busData;
}

module.exports =
{
    getBusData,
    extractToken
}