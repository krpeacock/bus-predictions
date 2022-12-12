import React from "react";
import { Arrival } from "../types";
import "./Arrival.scss";

interface Props {
  arrival: Arrival;
  logo?: React.ReactNode;
  label?: string;
}

function formatRelativeArrivals(arrivals: string[]) {
  const now = new Date();
  const relativeArrivals = arrivals

    .map((arrival) => {
      // if arrival is in the past, return empty string
      if (new Date(arrival).getTime() < now.getTime()) return "";

      const arrivalTime = new Date(arrival);
      const diff = arrivalTime.getTime() - now.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      return `${minutes}`;
    })
    .filter((arrival) => arrival !== "")
    .join(", ");
  return relativeArrivals;
}
function Arrival(props: Props) {
  const [relativeArrivals, setRelativeArrivals] = React.useState<string>();
  const { arrival, label, logo } = props;

  const direction = arrival.direction === "OB" ? "Outbound" : "Inbound";

  React.useEffect(() => {
    const relativeArrivals = formatRelativeArrivals(arrival.nextBusses);
    setRelativeArrivals(relativeArrivals);

    // every 10 seconds, update the relativeArrivals
    const interval = setInterval(() => {
      const relativeArrivals = formatRelativeArrivals(arrival.nextBusses);
      setRelativeArrivals(relativeArrivals);
    }, 10000);

    return () => clearInterval(interval);
  }, [arrival]);

  return (
    <div className="arrival">
      <div className="row">
        {logo ? (
          <div className="logo">{logo}</div>
        ) : (
          <div className="logo custom">
            <span>{arrival.line}</span>
          </div>
        )}
        <div className="column">
          <h3>
            {arrival.line} {arrival.lineName.toLowerCase()}
          </h3>
          <p className="label">{label ?? direction}</p>
        </div>
      </div>
      <p className="time">{relativeArrivals} min</p>
    </div>
  );
}

export default Arrival;
