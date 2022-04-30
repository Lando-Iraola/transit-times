const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "c18")
{
    const lines = await getLinesByBus(busNumber);
    const busKey = Object.keys(lines)[0];

    const firstLine = Object.keys(lines[busKey].lines)[0];
    
    const stops = Object.keys(lines[busKey].lines[firstLine].stops);
    
    const stop = stops[Math.floor((stops.length - 1) / 2)];

    const token = await extractToken();
    const information = await getBusData(token, stop);
    return information.servicios;
}

Handle()
.then((info) => console.log(info))
.catch((fail) => console.log(fail));