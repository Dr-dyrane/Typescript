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
  const [range, setRange] = useState<string>("30");
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

  useEffect(() => {
    const url = `https://api.coingecko.com/api/v3/coins/${
      selected?.id
    }/market_chart?vs_currency=usd&days=${range}&${
      range === "01" ? "interval=hourly" : "interval=daily"
    }`;
    if (!selected) return;
    axios.get(url).then((response) => {
      setData({
        labels: response.data.prices.map((price: number[]) => {
          return moment
            .unix(price[0] / 1000)
            .format(range === "01" ? "HH:MM" : "MM-DD");
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
      setOptions({
        responsive: true,
        plugins: {
          legend: {
            position: "top" as const,
          },
          title: {
            display: true,
            text:
              "Price Over The Last " +
              (range === "01" ? "" : range) +
              (range === "01" ? " 24 Hours." : " Days."),
          },
        },
      });
    });
  }, [selected, range]);

  return (
    <div className="p-3">
      <div className="App">
        <p className="text-center font-bold pb-4 text-lg text-slate-700">
          Crypto Market
        </p>
        <div className="flex">
          <select
            id="selectCrypto"
            className="inline-flex bg-slate-700 border mr-2 border-slate-700 text-gray-50 text-sm rounded-lg focus:ring-gray-50 focus:border-gray-50  p-2"
            onChange={(e) => {
              const c = cryptos?.find((x) => x.id === e.target.value);
              setSelected(c);
            }}
          >
            <option selected hidden value="currency">
              Currency
            </option>
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
          <select
            id="range"
            className="inline-flex bg-slate-700 border border-slate-700 text-gray-50 text-sm rounded-lg focus:ring-gray-50 focus:border-gray-50  p-2"
            onChange={(e) => {
              setRange(e.target.value);
            }}
          >
            <option hidden selected value="range">
              Range
            </option>
            <option value="30">30 Days</option>
            <option value="07">07 Days</option>
            <option value="01">01 Day</option>
          </select>
        </div>
      </div>
      {selected ? (
        <div className="py-3 text-center text-slate-700">
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
