import { useEffect, useState } from "react";
import { getTickets } from "../services/api";

function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch (err) {
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p>{error}</p>;

  const total = tickets.length;

  const open = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const claimed = tickets.filter(
    (ticket) => ticket.status === "claimed"
  ).length;

  const resolved = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;

  const resolutionRate = total > 0
    ? Math.round((resolved / total) * 100)
    : 0;

  const statusData = [
    { label: "Open", count: open },
    { label: "Claimed", count: claimed },
    { label: "Resolved", count: resolved },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-heading">
        <h1>Analytics</h1>
        <p>Monitor your customer support performance.</p>
      </div>

      <div className="analytics-summary">
        <div className="analytics-card">
          <p>Total Tickets</p>
          <h2>{total}</h2>
        </div>

        <div className="analytics-card">
          <p>Open Tickets</p>
          <h2>{open}</h2>
        </div>

        <div className="analytics-card">
          <p>Claimed Tickets</p>
          <h2>{claimed}</h2>
        </div>

        <div className="analytics-card">
          <p>Resolved Tickets</p>
          <h2>{resolved}</h2>
        </div>
      </div>

      <section className="analytics-section">
        <h2>Ticket Status Distribution</h2>

        {statusData.map((item) => {
          const percentage = total > 0
            ? (item.count / total) * 100
            : 0;

          return (
            <div className="analytics-row" key={item.label}>
              <div className="analytics-row-heading">
                <span>{item.label}</span>
                <strong>{item.count}</strong>
              </div>

              <div className="analytics-bar-background">
                <div
                  className="analytics-bar"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <section className="analytics-section">
        <h2>Ticket Resolution Rate</h2>
        <h1>{resolutionRate}%</h1>
        <p>Percentage of escalated tickets marked as resolved.</p>
      </section>
    </div>
  );
}

export default Analytics;
