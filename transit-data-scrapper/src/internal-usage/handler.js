const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getBusStops, getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "321")
{
    const token = await extractToken();

    const lines = await getLinesByBus();
    const busKey = Object.keys(lines)[0];
    console.log("bus key", busKey);

    const firstLine = Object.keys(lines[busKey].lines)[0];
    console.log("first line", firstLine);

    const stops = Object.keys(lines[busKey].lines[firstLine].stops);
    console.log("stops", stops);

    const stop = stops[stops.length / 2];
    
    console.log("stop", stop);

    const information = await getBusData(token, stop);
    return information.servicios;
}

Handle()
.then((info) => console.log(info))
.catch((fail) => console.log(fail));