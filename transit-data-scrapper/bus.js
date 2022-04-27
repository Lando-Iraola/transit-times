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

async function exctractToken()
{
    let body = await getBody();
    let lookFor = /\$jwt\s*=\s*'(.*?)';/;
    let token = lookFor.exec(body)[1];
    
    return atob(token); //They do this on the website I'm taking the data from. The token comes in base64 apparently
}

async function getBusData(token)
{
    const url = `https://www.red.cl/predictor/prediccion?t=${token}&codsimt=${"PA338"}&codser=`;
    const fetch = require('node-fetch');
    let busData;
    await fetch(url)
    .then(response => response.json())
    .then(data => busData = data);

    return JSON.stringify(busData);
}

(async () => console.log(await getBusData(await exctractToken())) )();