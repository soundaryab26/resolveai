const API_BASE_URL = "http://localhost:8000";

export async function getTickets(status = "", agentId=""){

    const params = new URLSearchParams();

    if(status) {
        params.append("status", status);
    }

    if(agentId){
        params.append("agent_id", agentId);
    }

    const queryString = params.toString();

    const url = queryString ? `${API_BASE_URL}/agent-queue?${queryString}` : `${API_BASE_URL}/agent-queue`;

    const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}


export async function claimTicket(ticketId, agentId) {
  const response = await fetch(
    `${API_BASE_URL}/agent-queue/${ticketId}/claim?agent_id=${agentId}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to claim ticket");
  }

  return response.json();
}

export async function resolveTicket(ticketId, agentId) {
  const response = await fetch(
    `${API_BASE_URL}/agent-queue/${ticketId}/resolve?agent_id=${agentId}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to resolve ticket");
  }

  return response.json();
}

export async function sendMessage(message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
