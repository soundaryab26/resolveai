
import {
  LayoutDashboard,
  Ticket,
  Inbox,
  UserRound,
  ChartNoAxesCombined,
  Settings,
  Headset,
  Bot,
  MessageCircle,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "All Tickets", icon: Ticket, page: "tickets" },
  { label: "Open Tickets", icon: Inbox, page: "open" },
  { label: "My Tickets", icon: UserRound, page: "my-tickets" },
  { label: "Analytics", icon: ChartNoAxesCombined, page: "analytics" },
  { label: "Customer Chat", icon: MessageCircle, page: "chat" },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Headset size={22} />
        </div>
        <div>
          <h2>ResolveAI</h2>
          <span>Support Intelligence</span>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="section-label">WORKSPACE</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                className={`sidebar-link ${
                  activePage === item.page ? "active" : ""
                }`}
                onClick={() => setActivePage(item.page)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-link">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="agent-profile">
          <div className="agent-avatar">SA</div>
          <div>
            <strong>Support Agent</strong>
            <span>Agent001</span>
          </div>
          <Bot size={18} />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
