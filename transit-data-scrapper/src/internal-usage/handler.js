const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "C18")
{
    const lines = await getLinesByBus(busNumber);
    const busKey = Object.keys(lines)[0];

    const firstLine = Object.keys(lines[busKey].lines)[0];
    
    const stops = Object.keys(lines[busKey].lines[firstLine].stops);
    
    let stop = stops[Math.floor((stops.length - 1) / 2)];

    const token = await extractToken();
    const information = await getBusData(token, stop, busNumber);
    
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