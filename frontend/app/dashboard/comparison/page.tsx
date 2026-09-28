"use client";

import { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ComparisonData {
  id: number;
  flight_date: string;
  airline: string;
  origin: string;
  dest: string;
  actual_delay: number;
  predicted_delay: number;
}

export default function ComparisonDashboard() {
  const [data, setData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = () => {
    setLoading(true);
    let url = "http://127.0.0.1:8000/api/comparison";
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === "ok") {
          setData(resData.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch comparison data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-xl animate-pulse">Loading comparison data...</div>
      </div>
    );
  }

  // Calculate simple statistics
  const mae = data.length ? data.reduce((acc, curr) => acc + Math.abs(curr.actual_delay - curr.predicted_delay), 0) / data.length : 0;
  const avgActual = data.length ? data.reduce((acc, curr) => acc + curr.actual_delay, 0) / data.length : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Model Evaluation Dashboard
          </h1>
          <p className="text-gray-400">
            Comparing Actual vs Predicted Delays on the latest processed dataset sample.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Mean Absolute Error (MAE)</h3>
            <p className="text-4xl font-bold text-emerald-400">{mae.toFixed(2)} min</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800/50 shadow-xl flex flex-col">
            <h3 className="text-lg font-medium text-gray-400 mb-2">Filter by Date Window</h3>
            <div className="flex gap-4 mt-auto">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-gray-800 text-white rounded p-2 border border-gray-700" 
              />
              <span className="text-gray-400 self-center">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-gray-800 text-white rounded p-2 border border-gray-700" 
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800/50 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">Actual vs Predicted Scatter Plot</h2>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="actual_delay" 
                  name="Actual Delay" 
                  unit=" min" 
                  stroke="#9CA3AF"
                  label={{ value: "Actual Delay (minutes)", position: "insideBottom", offset: -10, fill: "#9CA3AF" }}
                />
                <YAxis 
                  type="number" 
                  dataKey="predicted_delay" 
                  name="Predicted Delay" 
                  unit=" min" 
                  stroke="#9CA3AF"
                  label={{ value: "Predicted Delay (minutes)", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Scatter name="Flights" data={data} fill="#60A5FA" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800/50 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6">Flights Data Table</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-gray-400 font-medium">Date</th>
                  <th className="p-4 text-gray-400 font-medium">Airline</th>
                  <th className="p-4 text-gray-400 font-medium">Route</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Actual Delay (m)</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Predicted Delay (m)</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Error (m)</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">No data found in this window.</td>
                  </tr>
                ) : (
                  data.map((flight) => (
                    <tr key={flight.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">{flight.flight_date}</td>
                      <td className="p-4 font-semibold text-blue-300">{flight.airline}</td>
                      <td className="p-4">{flight.origin} → {flight.dest}</td>
                      <td className="p-4 text-right">{flight.actual_delay.toFixed(1)}</td>
                      <td className="p-4 text-right text-purple-300">{flight.predicted_delay.toFixed(1)}</td>
                      <td className="p-4 text-right text-gray-400">{Math.abs(flight.actual_delay - flight.predicted_delay).toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
