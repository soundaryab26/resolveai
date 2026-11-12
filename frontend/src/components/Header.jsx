import { Search, Bell } from "lucide-react";

function Header() {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your support team.</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search tickets..." />
        </div>

        <button className="notification-button">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;