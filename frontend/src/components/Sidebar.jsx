import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Inbox,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function Sidebar({ activePage, setActivePage, onLogout, menuOpen }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "parcels", label: "Colis", icon: Package },
    { key: "new-parcel", label: "Nouveau colis", icon: PlusCircle },
    { key: "available", label: "Disponibles", icon: Inbox },
    { key: "requests", label: "Demandes", icon: MessageSquare },
    
  ];

  return (
    <aside className={menuOpen ? "sidebar open" : "sidebar"}>
      <div>
        <div className="brand">
          <img src="/logo.png" alt="Fretlome" className="brand-logo" />
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