import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import Arrival from "./components/Arrival";
import N from "./components/N";
import { Arrival as ArrivalType } from "./types";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
};

function Example() {
  const [arrivals, setArrivals] = React.useState<Record<string, ArrivalType>>();

  React.useEffect(() => {
    fetch("http://localhost:3000/api/arrivals")
      .then((res) => res.json())
      .then((data) => setArrivals(data));

    // fetch arrivals every 10 seconds

    const interval = setInterval(() => {
      fetch("http://localhost:3000/api/arrivals")
        .then((res) => res.json())
        .then((data) => setArrivals(data));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!arrivals) return <p>"Loading..."</p>;

  console.log(arrivals);
  return (
    <main>
      <Arrival arrival={arrivals["Carl St & Stanyan St - N"]} logo={<N />} />
      <Arrival arrival={arrivals["Haight & Stanyan (IN) - 7"]} />
      <Arrival
        arrival={arrivals["Haight & Stanyan (OUT) - 33"]}
        label="Mission"
      />
      <Arrival arrival={arrivals["Hayes St & Shrader St - 21"]} />
      <Arrival
        arrival={arrivals["Haight & Stanyan (OUT) - 7"]}
        label="Sunset"
      />
      <Arrival
        arrival={arrivals["Haight & Stanyan (IN) - 33"]}
        label="Richmond"
      />
    </main>
  );
}
