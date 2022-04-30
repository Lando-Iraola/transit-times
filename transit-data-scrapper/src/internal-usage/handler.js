const {getBusData, extractToken} = require("./../external-data-extraction/ongoingService");
const {getLinesByBus} = require("./../external-data-extraction/stops");

async function Handle(busNumber = "c18", stop = "pc70")
{
    const lines = await getLinesByBus(busNumber);

    const busKey = Object.keys(lines)[0];
    stop = stop.toUpperCase();
    let lineName = "";
    console.log(stop);
    for(line in lines[busKey].lines)
    {
        if(lines[busKey].lines[line].stops[stop])
            lineName = line;
    }
        
    const information = [] 
    let stops = lines[busKey].lines[lineName].stops;
    let arr = [];
    arr = arr.concat(previousTwo(stop, stops))
    arr.push(stop);
    arr = arr.concat(nextTwo(stop, stops));
    
    console.log(arr)
    const token = await extractToken();
    console.log(token);
    for(let i = 0; i < arr.length; i++)
    {
        try
        {
            information.push(await getBusData(token, arr[i], busNumber));    
        }
        catch(e)
        {
            console.error(`Bus: ${busNumber}, stop: ${arr[i]} Red.cl endpoint did not work for these`)
            console.error(e);
        }
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

        arr.push(next);
        next = stops[next].next;
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