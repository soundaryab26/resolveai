import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import RecentTickets from "./components/RecentTickets";
import CustomerChat from "./components/CustomerChat";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {

  const[activePage, setActivePage] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleTicketsUpdated() {
    setRefreshKey((previous) => previous + 1);
  }

  const pageTitles = {
    dashboard: "Dashboard",
    tickets: "All Tickets",
    open: "Open Tickets",
    "my-tickets": "My Tickets",
    analytics: "Analytics",
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage = {activePage}
        setActivePage = {setActivePage}
      />

      <main className="main-content">
        {activePage === "dashboard" && (
        <>  
        <Header />
        <StatsCards key={refreshKey} />
        <RecentTickets onTicketsUpdated={handleTicketsUpdated} />
        </>
        )}

        {activePage === "chat" && (
          <>
          <h1>Customer Support Chat</h1>
          <p>Test your AI assistant from the customer perspective</p>
          <CustomerChat/>
          </>  
        )}

        {["tickets", "open", "my-tickets", "analytics"].includes(activePage) && (
          <RecentTickets
           onTicketsUpdated={handleTicketsUpdated}
           statusFilter={activePage === "open" ? "open" : ""}
           agentFilter={activePage === "my-tickets" ? "AGENT001" : ""}
           title={pageTitles[activePage]}
           description={`Manage your ${pageTitles[activePage].toLowerCase()}.`}
  />
)}

{activePage === "analytics" && <Analytics />}
      </main>
    </div>
  );
}

export default App;
