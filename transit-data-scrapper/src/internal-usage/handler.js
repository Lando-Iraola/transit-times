const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "C18")
{
    const lines = await getLinesByBus(busNumber);
    const busKey = Object.keys(lines)[0];

    const firstLine = Object.keys(lines[busKey].lines)[0];
    
    let stops = Object.keys(lines[busKey].lines[firstLine].stops);
    
    const token = await extractToken();
    const information = []
    
    let stopObj = lines[busKey].lines[firstLine].stops;
    let stop = stops[0];
    let arr = [];
    const pt = previousTwo(stop, stopObj)
    arr = arr.concat(pt);
    arr.push(stop);
    const nt = nextTwo(stop, stopObj);
    arr = arr.concat(nt);

    for(let i = 0; i < arr.length; i++)
    {
        information.push(await getBusData(token, arr[i], busNumber));    
    }
    
    return information;
}

function previousTwo(stop, stops)
{
    let previous;
    let arr = [];
    if(!stops[stop].previous)
        return arr;
        
    if(stops[stop].previous)
    {
        previous = stops[stop].previous;
    }
    if(previous && stops[previous].previous)
    {
        previous = stops[previous].previous;
        arr.push(previous);
        previous = stops[previous].next;
        arr.push(previous);
    }
    else
    {
        arr.push(previous);
    }

    return arr;
}

function nextTwo(stop, stops)
{
    let next = stops[stop].next;
    let arr = []
    for(let i = 0; i < 2; i++)
    {
        if(!next)
            break;
        
        next = stops[next].next;
        arr.push(next);
    }

    return arr;
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