const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getBusStops} = require("./../external-data-extraction/stops");

async function Handle()
{
    const stops = await getBusStops();
    const token = await extractToken();

    const information = getBusData(token, stops[150]);

    return information;
}

Handle()
.then((info) => console.log(info))
.catch((fail) => console.log(fail));