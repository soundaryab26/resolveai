
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getTickets, claimTicket, resolveTicket, } from "../services/api";

function RecentTickets({ onTicketsUpdated,
          statusFilter = "",
          agentFilter = "",
          title = "Recent Tickets",
          description = "Monitor and manage your latest customer requests.",
 }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  
    async function fetchTickets() {
      try {
        const data = await getTickets(statusFilter, agentFilter);
        setTickets(data);
        setError("")
      } catch (err) {
        setError("Unable to load tickets. Please check the backend.");
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, agentFilter]);
    
    async function handleClaim(ticketId){
        try{
            setActionLoading(ticketId);
            await claimTicket(ticketId, "AGENT001");
            await fetchTickets();
            onTicketsUpdated();
        } catch(err) {
            setError(err.message);
        } finally{
            setActionLoading("")
        }
    }

    async function handleResolve(ticketId){
        try{
            setActionLoading(ticketId);
            await resolveTicket(ticketId, "AGENT001");
            await fetchTickets();
            onTicketsUpdated();
        } catch(err){
            setError(err.message);
        } finally {
            setActionLoading("");
        }
    }
    return (
      <section className="tickets-section">
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

        <button className="view-all-button">
          View all <ArrowUpRight size={16} />
        </button>
      </div>

      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p>{error}</p>
      ) : tickets.length === 0 ? (
        <p>No tickets available yet.</p>
      ) : (
        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Order ID</th>
                <th>Customer Issue</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

           <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td className="ticket-id">{ticket.ticket_id}</td>
                  <td>{ticket.order_id || "N/A"}</td>
                  <td>{ticket.message}</td>
                  <td>
                    <span className={`status ${ticket.status.toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    {ticket.status === "open" && (
                      <button
                        className="ticket-action claim"
                        disabled={actionLoading === ticket.ticket_id}
                        onClick={() => handleClaim(ticket.ticket_id)}
                      >
                        {actionLoading === ticket.ticket_id
                          ? "Processing..."
                          : "Claim"}
                      </button>
                    )}

                    {ticket.status === "claimed" && (
                      <button
                        className="ticket-action resolve"
                        disabled={actionLoading === ticket.ticket_id}
                        onClick={() => handleResolve(ticket.ticket_id)}
                      >
                        {actionLoading === ticket.ticket_id
                          ? "Processing..."
                          : "Resolve"}
                      </button>
                    )}

                    {ticket.status === "resolved" && (
                      <span className="resolved-label">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentTickets;