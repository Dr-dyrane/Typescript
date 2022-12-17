import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Crypto } from "./Types";
import CryptoSummary from "./components/CryptoSummary";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { ChartData, ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [cryptos, setCryptos] = useState<Crypto[] | null>(null);
  const [selected, setSelected] = useState<Crypto | null>();
  const [data, setData] = useState<ChartData<"line">>();
  const [options, setOptions] = useState<ChartOptions<"line">>({
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  });

  useEffect(() => {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
    axios.get(url).then((response) => {
      setCryptos(response.data);
    });
  }, []);
  return (
    <div className="p-3">
      <div className="App">
        <p className="text-center pb-4 text-lg text-gray-50">Crypto Market</p>
        <select
          id="selectCrypto"
          className="bg-slate-700 border border-slate-700 text-gray-50 text-sm rounded-lg focus:ring-gray-50 focus:border-gray-50 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => {
            const c = cryptos?.find((x) => x.id === e.target.value);
            setSelected(c);
            const url = `https://api.coingecko.com/api/v3/coins/${c?.id}/market_chart?vs_currency=usd&days=30&interval=daily`;
            axios.get(url).then((response) => {
              setData({
                labels: response.data.prices.map((price: number[]) => {
                  return moment.unix(price[0] / 1000).format("MM-DD");
                }),
                datasets: [
                  {
                    label: "USD",
                    data: response.data.prices.map((price: number[]) => {
                      return price[1];
                    }),
                    borderColor: "rgb(255, 99, 132)",
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                  },
                ],
              });
            });
          }}
          defaultValue="default"
        >
          <option value="default">Choose a currency</option>
          {cryptos
            ? cryptos.map((crypto) => {
                return (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </option>
                );
              })
            : null}
        </select>
      </div>
      {selected ? (
        <div className="py-3 text-center text-gray-50">
          <CryptoSummary crypto={selected} />
        </div>
      ) : null}
      {data ? (
        <div className="w-full text-gray-50 h-full">
          <Line options={options} data={data} />
        </div>
      ) : null}
    </div>
  );
}

export default App;
