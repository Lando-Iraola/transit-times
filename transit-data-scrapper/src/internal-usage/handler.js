const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "C18")
{
    const lines = await getLinesByBus(busNumber);
    const busKey = Object.keys(lines)[0];

    const firstLine = Object.keys(lines[busKey].lines)[0];
    
    const stops = Object.keys(lines[busKey].lines[firstLine].stops);
    
    let originalStop = stops[Math.floor((stops.length - 1) / 2)];

    const token = await extractToken();
    const information = []
    const fullStops = lines[busKey].lines[firstLine].stops;
    let stop = originalStop;
    for(let i = 0; i < 2; i++)
    {
        console.log(`Previous: ${i}`);
        if(fullStops[stop].previous)
        {
            stop = fullStops[stop].previous
            information.push(await getBusData(token, stop, busNumber));
        }
    }
    stop = originalStop;
    information.push(await getBusData(token, stop, busNumber));
    for(let i = 0; i < 2; i++)
    {
        console.log(`next: ${i}`);
        if(fullStops[stop].next)
        {
            stop = fullStops[stop].next
            information.push(await getBusData(token, stop, busNumber));
        }
    }
    
    
    

    
    return information;
}

function saveFile(newText, filePath = "lines.json")
{
    const fs = require("fs");
    fs.writeFileSync(filePath, JSON.stringify(newText, null, 4));

    return true;
}

Handle()
.then((info) => saveFile(info))
.catch((fail) => console.log(fail));