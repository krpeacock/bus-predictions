import * as dotenv from "dotenv";
import fetch from "isomorphic-fetch";
dotenv.config();

const key_1 = process.env.KEY_1 as string;
const key_2 = process.env.KEY_1 as string;
const key_3 = process.env.KEY_1 as string;
const key_4 = process.env.KEY_1 as string;

const busStops = [
  { name: "Carl St & Stanyan St", id: "13915", key: key_1 },
  { name: "Hayes St & Shrader St", id: "17561", key: key_2 },
  { name: "Haight & Stanyan (IN)", id: "14963", key: key_3 },
  { name: "Haight & Stanyan (OUT)", id: "14962", key: key_4 },
];

const arrivals = new Map();

const queryAPI = async (busStop: typeof busStops[number]) => {
  const url = `https://api.511.org/transit/StopMonitoring?api_key=${busStop.key}&agency=SF&stopCode=${busStop.id}&format=json`;

  const response = await fetch(url);

  const responseText = await response.text();
  const data = JSON.parse(responseText.trim());

  const vehicles =
    data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;

  // split vehicles into two arrays, one for each line
  const lines = vehicles.reduce((acc: any, vehicle: any) => {
    const line: string = vehicle.MonitoredVehicleJourney.LineRef;
    acc[line] = vehicle;
    return acc;
  }, {});

  console.log("lines", lines);
  Object.keys(lines).forEach((line) => {
    const allVehicles =
      data.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit.filter(
        (vehicle: any) => vehicle.MonitoredVehicleJourney.LineRef === line
      );
    console.log("allVehicles", allVehicles);

    const nextVehicle = allVehicles[0].MonitoredVehicleJourney;
    console.log("nextVehicle", nextVehicle);

    const followingVehicle = allVehicles[1].MonitoredVehicleJourney;

    const arrivalTimes = [
      nextVehicle.MonitoredCall.ExpectedArrivalTime,
      followingVehicle.MonitoredCall.ExpectedArrivalTime,
    ];

    const estimate = {
      line: nextVehicle.LineRef,
      direction: nextVehicle.DirectionRef,
      lineName: nextVehicle.PublishedLineName,
      name: nextVehicle.MonitoredCall.StopPointName,
      nextBusses: arrivalTimes,
    };
    arrivals.set(busStop.name + " - " + line, estimate);
  });
};

async function makeQueries() {
  await Promise.all(
    busStops.map(async (busStop) => {
      await queryAPI(busStop);
    })
  );
}

// .map((arrivalTime) => {
// convert to relative time in minutes
//   return (
//     Math.round((Date.parse(arrivalTime) - Date.now()) / (1000 * 60)) +
//     " min"
//   );
// })

// rotate through arrivals, printing one every 5 seconds
const main = async () => {
  await makeQueries();
  // query bus stops every minute
  setInterval(async () => {
    makeQueries();
  }, 60_000);

  const keys = Array.from(arrivals.keys());
  let i = 0;
  while (true) {
    const key = keys[i];
    const arrival = arrivals.get(key);
    console.clear();
    console.log({
      ...arrival,
      nextBusses: arrival?.nextBusses.map((time: string) => {
        return (
          Math.round((Date.parse(time) - Date.now()) / (1000 * 60)) + " min"
        );
      }),
    });
    i = (i + 1) % keys.length;
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
};

main();
