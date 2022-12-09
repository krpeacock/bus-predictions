import * as dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY; //?

// every 10 seconds, query an API for each bus stop and store the results in a map
const busStops = [{ name: "Carl St & Stanyan St", id: "13915" }];

const queryAPI = async () => {
    const estimates = [];
 for(let busStop of busStops) {
    const url = `https://api.511.org/transit/StopMonitoring?api_key=${API_KEY}&agency=SF&stopCode=${busStop.id}`;

    const response = await fetch(url);
    response;
    const arrivals = await response.json();

    const vehicle = arrivals.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit[0].MonitoredVehicleJourney;


    const arrivalTime =
      vehicle.MonitoredCall.ExpectedArrivalTime;
    estimates.push({ 
        line: vehicle.LineRef,
        direction: vehicle.DirectionRef,
        lineName: vehicle.PublishedLineName,
      name: vehicle.MonitoredCall.StopPointName,
      arrivalTime: new Date(Date.parse(arrivalTime)).toLocaleTimeString(),
    });
  };
  return estimates;
};

queryAPI().then((result) => {
  console.log(result);
});
