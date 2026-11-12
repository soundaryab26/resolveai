import {useEffect, useState} from "react"
import {
  Inbox,
  Clock,
  CheckCircle,
  Bot,
} from "lucide-react";

import { getTickets } from "../services/api";

function StatsCards() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch (error) {
        console.error("Failed to fetch ticket metrics:", error);
      }
    }

    fetchTickets();
  }, []);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const claimedTickets = tickets.filter(
    (ticket) => ticket.status === "claimed"
  ).length;

  const resolvedToday = tickets.filter((ticket) => {
    if (!ticket.resolved_at) return false;

    return (
      new Date(ticket.resolved_at).toDateString() ===
      new Date().toDateString()
    );
  }).length;

  const stats = [
    {
      label: "Open Tickets",
      value: openTickets,
      description: "Waiting for support",
      icon: Inbox,
      color: "blue",
    },
    {
      label: "Claimed Tickets",
      value: claimedTickets,
      description: "Being handled",
      icon: Clock,
      color: "purple",
    },
    {
      label: "Resolved Today",
      value: resolvedToday,
      description: "Successfully resolved",
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "AI Resolution Rate",
      value: "—",
      description: "Analytics not tracked yet",
      icon: Bot,
      color: "orange",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.color}`}>
              <Icon size={21} />
            </div>

            <p className="stat-label">{stat.label}</p>
            <h2>{stat.value}</h2>
            <span className="stat-description">
              {stat.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;