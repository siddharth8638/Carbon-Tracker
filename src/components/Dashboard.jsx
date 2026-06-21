import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { subscribeToLogs, lastNDays } from "../firebase/logsService";
import { sumCO2, breakdownByType, breakdownByDay, INDIA_AVG_DAILY_KG } from "../utils/carbonCalc";
import InsightCard from "./InsightCard";

const COLORS = { transport: "#3b82f6", energy: "#f59e0b", food: "#10b981" };

export default function Dashboard({ uid }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToLogs(uid, setLogs);
    return unsubscribe;
  }, [uid]);

  const weekLogs = lastNDays(logs, 7);
  const totalCO2 = sumCO2(weekLogs);
  const breakdown = breakdownByType(weekLogs);
  const trend = breakdownByDay(weekLogs);

  const pieData = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({ name: type, value }));

  const avgDaily = totalCO2 / 7;
  const vsAverage = Math.round(((avgDaily - INDIA_AVG_DAILY_KG) / INDIA_AVG_DAILY_KG) * 100);

  return (
    <div className="dashboard">
      <section className="summary-card">
        <h2>{totalCO2} kg CO2</h2>
        <p>this week</p>
        <p className={vsAverage <= 0 ? "below-avg" : "above-avg"}>
          {vsAverage <= 0
            ? `${Math.abs(vsAverage)}% below`
            : `${vsAverage}% above`}{" "}
          national daily average
        </p>
      </section>

      {pieData.length > 0 && (
        <section className="chart-card">
          <h3>Breakdown by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      )}

      {trend.length > 1 && (
        <section className="chart-card">
          <h3>Daily trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="co2Kg" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      <InsightCard logs={weekLogs} totalCO2={totalCO2} />
    </div>
  );
}
