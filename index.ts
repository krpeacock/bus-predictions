import * as dotenv from "dotenv";
import fetch from "isomorphic-fetch";
dotenv.config();

const API_KEY = process.env.API_KEY;

// every 10 seconds, query an API for each bus stop and store the results in a map

const key_1 = process.env.KEY_1 as string;
const key_2 = process.env.KEY_1 as string;
const key_3 = process.env.KEY_1 as string;
const key_4 = process.env.KEY_1 as string;

const busStops = [
  { name: "Carl St & Stanyan St", id: "13915", line: "N", key: key_1 },
  { name: "Hayes St & Shrader St", id: "17561", line: "21", key: key_2 },
  { name: "Haight & Stanyan (IN)", id: "14963", line: "7", key: key_3 },
  { name: "Haight & Stanyan (OUT)", id: "14962", line: "7", key: key_4 },
];

const queryAPI = async (busStop: typeof busStops[number]) => {
  const estimates = [];
  const url = `https://api.511.org/transit/StopMonitoring?api_key=${busStop.key}&agency=SF&stopCode=${busStop.id}&format=json`;

  const response = await fetch(url);

  const responseText = await response.text();
  const arrivals = JSON.parse(responseText.trim());

  const allVehicles =
    arrivals.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit.filter(
      (vehicle: any) => vehicle.MonitoredVehicleJourney.LineRef === busStop.line
    );

  const nextVehicle = allVehicles[0].MonitoredVehicleJourney;

  const followingVehicle = allVehicles[1].MonitoredVehicleJourney;

  const arrivalTimes = [
    nextVehicle.MonitoredCall.ExpectedArrivalTime,
    followingVehicle.MonitoredCall.ExpectedArrivalTime,
  ];
  estimates.push({
    line: nextVehicle.LineRef,
    direction: nextVehicle.DirectionRef,
    lineName: nextVehicle.PublishedLineName,
    name: nextVehicle.MonitoredCall.StopPointName,
    nextBusses: arrivalTimes.map((arrivalTime) => {
      // convert to relative time in minutes
      return (
        Math.round((Date.parse(arrivalTime) - Date.now()) / (1000 * 60)) +
        " min"
      );
    }),
  });

  return estimates;
};

let nextStopToDisplay: typeof busStops[number] = busStops[0];

// Query one bus stop every 6 seconds and console.log the results
const main = async () => {
  while (true) {
    const estimates = await queryAPI(nextStopToDisplay);
    console.clear();
    console.log(estimates);
    nextStopToDisplay =
      busStops[(busStops.indexOf(nextStopToDisplay) + 1) % busStops.length];
    await new Promise((resolve) => setTimeout(resolve, 6000));
  }
};
main();
