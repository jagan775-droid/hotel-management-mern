import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/dashboard/stats");
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      }
    };
    load();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-slate font-mono">Overview</p>
        <h1 className="font-display text-3xl mt-1">Front Desk Dashboard</h1>
      </header>

      {error && <p className="text-danger bg-danger/10 px-3 py-2 rounded-md mb-4">{error}</p>}

      {!stats ? (
        <p className="text-slate">Loading stats…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Occupancy" value={stats.occupancyRate} suffix="%" accent="teal" />
            <StatCard label="Available Rooms" value={stats.availableRooms} accent="success" />
            <StatCard label="Occupied Rooms" value={stats.occupiedRooms} accent="danger" />
            <StatCard label="In Cleaning" value={stats.cleaningRooms} accent="brass" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Active Bookings" value={stats.activeBookings} accent="teal" />
            <StatCard label="Today's Check-ins" value={stats.todaysCheckIns} accent="success" />
            <StatCard label="Today's Check-outs" value={stats.todaysCheckOuts} accent="warning" />
            <StatCard
              label="Revenue Collected"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              accent="brass"
            />
          </div>

          <div className="mt-8 card p-6">
            <h2 className="font-display text-xl mb-2">Total Guests on Record</h2>
            <p className="font-mono text-3xl text-ink">{stats.totalGuests}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
