function readFile(filePath = "./original-trash.json")
{
    let staticFile;
    const fs = require("fs");
    let file = fs.readFileSync(filePath);
    staticFile = JSON.parse(file);
    
    
    return staticFile;
}

function extractStops(dataToProcess, bus)
{
   if(!dataToProcess)
      throw Error("Failed bus lines data extraction. \nNo data received");
   if(!bus)
      throw Error("Failed bus lines data extraction. \nNo bus specified");

    let destination;
    let stops = {};
    dataToProcess.paraderos.forEach(
        paradero =>
        {
            const extractingBus = paradero.servicios.filter(b => b.cod === bus)[0];
            if(!destination && extractingBus.destino !== "Fin de recorrido")
            {
                destination = extractingBus.destino
            }

            stops[paradero.cod] = {
                stop: paradero.cod,
                stopOrder: extractingBus.orden,
                commune: paradero.comuna,
                geoLocation: paradero.pos,
                street: paradero.name,
                endOfTrip: extractingBus.destino === "Fin de recorrido" ? true : false
            }
        }
    )
    let lines = {};
    lines[destination] = stops;
    
    return lines;
}

let forward = extractStops(readFile().ida, "C18", {});
let backward = extractStops(readFile().regreso, "C18", {});

let obj = {};
obj["C18"] = 
{
    bus: "C18",
    lines: 
    {
        [Object.keys(forward)[0]]: forward,
        [Object.keys(backward)[0]]: backward
    }
}

console.log(obj);
