import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Inbox,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "parcels", label: "Colis", icon: Package },
    { key: "new-parcel", label: "Nouveau colis", icon: PlusCircle },
    { key: "available", label: "Disponibles", icon: Inbox },
    { key: "requests", label: "Demandes", icon: MessageSquare },
    
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-icon">LK</div>
          <div>
            <h1>Relais Colis</h1>
            <p>Suivi terrain</p>
          </div>
        </div>

        <nav>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={activePage === item.key ? "nav-item active" : "nav-item"}
                onClick={() => setActivePage(item.key)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}