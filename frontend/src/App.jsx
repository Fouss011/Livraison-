import { useEffect, useState } from "react";
import { api, clearSession, getStoredUser, setSession } from "./api/client";
import Sidebar from "./components/Sidebar";
import StatusBadge from "./components/StatusBadge";
import "./App.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login({ email, password });
      setSession(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">LK</div>
        <h1>Colis Relais</h1>
        <p>Gestion simple des colis Lomé–Kpalimé</p>

        {error && <div className="alert error">{error}</div>}

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);

  useEffect(() => {
    api.getStats().then((data) => setStats(data.stats)).catch(console.error);
    api.getParcels().then((data) => setParcels(data.parcels.slice(0, 5))).catch(console.error);
  }, []);

  if (!stats) return <p>Chargement...</p>;

  const cards = [
  ["Total colis", stats.total, "Tous statuts confondus"],
  ["En transit", stats.in_transit, "Colis en cours"],
  ["Disponibles", stats.available, "Prêts à être retirés"],
  ["Livrés", stats.delivered, "Livrés avec succès"]
];

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h2>Bienvenue, Admin</h2>
          <p>Voici un aperçu de votre activité colis aujourd’hui.</p>
        </div>
      </div>

      <div className="dashboard-cards">
        {cards.map(([label, value, desc]) => (
          <div className="dashboard-card" key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-card">
        <div className="recent-header">
          <h3>📦 Derniers colis</h3>
          <button onClick={() => window.dispatchEvent(new Event("goNewParcel"))}>
            + Nouveau colis
          </button>
        </div>

        <div className="recent-table">
          <div className="recent-table-head">
            <span>Code</span>
            <span>Expéditeur</span>
            <span>Destinataire</span>
            <span>Trajet</span>
            <span>Statut</span>
          </div>

          {parcels.map((parcel) => (
            <div className="recent-table-row" key={parcel.id}>
              <span>{parcel.code}</span>
              <span>{parcel.sender_name}<br /><small>{parcel.sender_phone}</small></span>
              <span>{parcel.receiver_name}<br /><small>{parcel.receiver_phone}</small></span>
              <span>{parcel.departure_city} → {parcel.arrival_city}</span>
              <StatusBadge status={parcel.status} />
            </div>
          ))}

          {parcels.length === 0 && <p>Aucun colis récent.</p>}
        </div>
      </div>
    </section>
  );
}

function Parcels() {
  const [parcels, setParcels] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function load(value = search) {
    const data = await api.getParcels(value);
    setParcels(data.parcels);
  }

  useEffect(() => {
    load("").catch(console.error);
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setMessage("");
    load(search);
  }

  async function changeStatus(parcel, status) {
    setMessage("");

    try {
      await api.updateParcelStatus(parcel.id, {
        status,
        current_location:
          status === "in_transit"
            ? "Route Lomé-Kpalimé"
            : status === "available"
            ? parcel.arrival_city
            : parcel.current_location
      });

      setMessage("Statut mis à jour.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Tous les colis</h2>
      <p className="page-subtitle">
        Recherche par code colis, nom destinataire ou numéro de téléphone.
      </p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Ex : LK-2026-0001, 90000000, Ama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">Rechercher</button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            setSearch("");
            load("");
          }}
        >
          Réinitialiser
        </button>
      </form>

      {message && <div className="alert">{message}</div>}

      <div className="table-card">
        {parcels.map((parcel) => (
          <div className="parcel-row" key={parcel.id}>
            <div>
              <strong>{parcel.code}</strong>
              <p>{parcel.description}</p>
              <small>
                {parcel.sender_name} → {parcel.receiver_name} |{" "}
                {parcel.receiver_phone}
              </small>
            </div>

            <StatusBadge status={parcel.status} />

            <div className="row-actions">
              <a
                className="call-btn"
                href={`tel:${parcel.receiver_phone}`}
              >
                Appeler
              </a>

              <a
                className="whatsapp"
                href={`https://wa.me/228${parcel.receiver_phone}`}
                target="_blank"
              >
                WhatsApp
              </a>
              <a
  className="secondary-btn"
  href="http://localhost:5173/suivi"
  target="_blank"
>
  Lien client
</a>

              <button onClick={() => changeStatus(parcel, "in_transit")}>
                Transit
              </button>

              <button onClick={() => changeStatus(parcel, "available")}>
                Disponible
              </button>

              <button onClick={() => changeStatus(parcel, "delivered")}>
                Livré
              </button>
            </div>
          </div>
        ))}

        {parcels.length === 0 && <p>Aucun colis trouvé.</p>}
      </div>
    </section>
  );
}

function NewParcel() {
  const [form, setForm] = useState({
    sender_name: "",
    sender_phone: "",
    receiver_name: "",
    receiver_phone: "",
    departure_city: "Lomé",
    arrival_city: "Kpalimé",
    description: "",
    delivery_price: 1000
  });

  const [message, setMessage] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const data = await api.createParcel(form);
      setMessage(`Colis créé avec succès : ${data.parcel.code}`);
      setForm({
        sender_name: "",
        sender_phone: "",
        receiver_name: "",
        receiver_phone: "",
        departure_city: "Lomé",
        arrival_city: "Kpalimé",
        description: "",
        delivery_price: 1000
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Enregistrer un colis</h2>
      <p className="page-subtitle">Ajoute un nouveau colis au départ.</p>

      {message && <div className="alert">{message}</div>}

      <form className="form-card" onSubmit={submit}>
        <input placeholder="Nom expéditeur" value={form.sender_name} onChange={(e) => update("sender_name", e.target.value)} />
        <input placeholder="Téléphone expéditeur" value={form.sender_phone} onChange={(e) => update("sender_phone", e.target.value)} />
        <input placeholder="Nom destinataire" value={form.receiver_name} onChange={(e) => update("receiver_name", e.target.value)} />
        <input placeholder="Téléphone destinataire" value={form.receiver_phone} onChange={(e) => update("receiver_phone", e.target.value)} />
        <input placeholder="Ville départ" value={form.departure_city} onChange={(e) => update("departure_city", e.target.value)} />
        <input placeholder="Ville arrivée" value={form.arrival_city} onChange={(e) => update("arrival_city", e.target.value)} />
        <input placeholder="Prix livraison" type="number" value={form.delivery_price} onChange={(e) => update("delivery_price", e.target.value)} />
        <textarea placeholder="Description du colis" value={form.description} onChange={(e) => update("description", e.target.value)} />

        <button>Enregistrer le colis</button>
      </form>
    </section>
  );
}

function AvailableParcels() {
  const [parcels, setParcels] = useState([]);

  useEffect(() => {
    api.getAvailableParcels().then((data) => setParcels(data.parcels)).catch(console.error);
  }, []);

  return (
    <section>
      <h2>Colis disponibles</h2>
      <p className="page-subtitle">Colis arrivés au point final.</p>

      <div className="table-card">
        {parcels.map((parcel) => (
          <div className="parcel-row" key={parcel.id}>
            <div>
              <strong>{parcel.code}</strong>
              <p>{parcel.description}</p>
              <small>{parcel.receiver_name} — {parcel.receiver_phone}</small>
            </div>
            <StatusBadge status={parcel.status} />
            <a className="whatsapp" href={`https://wa.me/228${parcel.receiver_phone}`} target="_blank">
              WhatsApp
            </a>
          </div>
        ))}

        {parcels.length === 0 && <p>Aucun colis disponible.</p>}
      </div>
    </section>
  );
}

function Requests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await api.getRequests();
    setRequests(data.requests);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function updateStatus(id, status) {
    setMessage("");

    try {
      await api.updateRequestStatus(id, { status });
      setMessage("Demande mise à jour.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Demandes clients</h2>
      <p className="page-subtitle">
        Personnes à recontacter pour un colis à envoyer.
      </p>

      {message && <div className="alert">{message}</div>}

      <div className="table-card">
        {requests.map((request) => (
          <div className="parcel-row" key={request.id}>
            <div>
              <strong>{request.name}</strong>
              <p>{request.description}</p>
              <small>
                {request.phone} | {request.departure_city} →{" "}
                {request.arrival_city}
                {request.preferred_time
                  ? ` | Rappel : ${request.preferred_time}`
                  : ""}
              </small>
            </div>

            <StatusBadge status={request.status} />

            <div className="row-actions">
              <a className="call-btn" href={`tel:${request.phone}`}>
                Appeler
              </a>

              <a
                className="whatsapp"
                href={`https://wa.me/228${request.phone}`}
                target="_blank"
              >
                WhatsApp
              </a>

              <button onClick={() => updateStatus(request.id, "contacted")}>
                Contacté
              </button>

              <button onClick={() => updateStatus(request.id, "accepted")}>
                Accepté
              </button>

              <button onClick={() => updateStatus(request.id, "rejected")}>
                Rejeté
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && <p>Aucune demande client pour le moment.</p>}
      </div>
    </section>
  );
}

function PublicRequest() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    departure_city: "Lomé",
    arrival_city: "Kpalimé",
    description: "",
    preferred_time: ""
  });

  const [message, setMessage] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.createPublicRequest(form);
      setMessage("Demande envoyée avec succès. Un agent pourra recontacter le client.");

      setForm({
        name: "",
        phone: "",
        departure_city: "Lomé",
        arrival_city: "Kpalimé",
        description: "",
        preferred_time: ""
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Demande client</h2>
      <p className="page-subtitle">
        Formulaire simple pour les personnes qui ont un colis à envoyer.
      </p>

      {message && <div className="alert">{message}</div>}

      <form className="form-card" onSubmit={submit}>
        <input
          placeholder="Nom du client"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <input
          placeholder="Téléphone"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <input
          placeholder="Ville de départ"
          value={form.departure_city}
          onChange={(e) => update("departure_city", e.target.value)}
        />

        <input
          placeholder="Ville d’arrivée"
          value={form.arrival_city}
          onChange={(e) => update("arrival_city", e.target.value)}
        />

        <input
          placeholder="Moment souhaité pour être rappelé"
          value={form.preferred_time}
          onChange={(e) => update("preferred_time", e.target.value)}
        />

        <textarea
          placeholder="Description du colis"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />

        <button>Envoyer la demande</button>
      </form>
    </section>
  );
}

function ClientTracking() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!search.trim()) {
      setMessage("Entre un code colis ou un numéro de téléphone.");
      return;
    }

    try {
      const data = await api.trackParcelPublic(search.trim());
      setResult(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <h2>Suivi de votre colis</h2>
      <p className="page-subtitle">
        Recherche publique par code colis ou téléphone destinataire.
      </p>

      <form className="search-bar" onSubmit={submit}>
        <input
          placeholder="Ex : LK-2026-0001 ou 91000000"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>Suivre</button>
      </form>

      {message && <div className="alert error">{message}</div>}

      {result && (
        <div className="tracking-card">
          <div className="tracking-header">
            <div>
              <span>Code colis</span>
              <strong>{result.parcel.code}</strong>
            </div>
            <StatusBadge status={result.parcel.status} />
          </div>

          <div className="tracking-grid">
            <div>
              <span>Trajet</span>
              <strong>
                {result.parcel.departure_city} → {result.parcel.arrival_city}
              </strong>
            </div>

            <div>
              <span>Position actuelle</span>
              <strong>{result.parcel.current_location || "Non précisée"}</strong>
            </div>

            <div>
              <span>Destinataire</span>
              <strong>{result.parcel.receiver_name}</strong>
            </div>

            <div>
              <span>Description</span>
              <strong>{result.parcel.description}</strong>
            </div>
          </div>

          <h3>Historique du colis</h3>

          <div className="timeline">
            {result.events.map((event, index) => (
              <div className="timeline-item" key={`${event.status}-${index}`}>
                <div className="timeline-dot"></div>
                <div>
                  <StatusBadge status={event.status} />
                  <p>{event.location || "Lieu non précisé"}</p>
                  <small>
                    {new Date(event.created_at).toLocaleString("fr-FR")}
                  </small>
                </div>
              </div>
            ))}

            {result.events.length === 0 && (
              <p>Aucun historique disponible pour ce colis.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function PublicHome() {
  return (
    <main className="public-page">
      <div className="public-header client-hero">
        <img src="/logo.png" alt="Fretlome" className="public-logo" />
        <div>
          <h1>Fretlome</h1>
          <p>Votre solution simple pour suivre ou demander l’envoi d’un colis.</p>
        </div>
      </div>

      <section className="client-intro">
        <h2>Livraison et suivi de colis</h2>
        <p>
          Suivez l’avancement de votre colis entre le point de départ et le point
          d’arrivée, ou envoyez une demande pour être recontacté par un agent.
        </p>
      </section>

      <section className="public-choice">
        <button onClick={() => (window.location.href = "/suivi")}>
          <span className="choice-icon">📦</span>
          <span>Suivre mon colis</span>
          <small>J’ai déjà un code colis ou un numéro destinataire.</small>
        </button>

        <button onClick={() => (window.location.href = "/demande")}>
          <span className="choice-icon">📝</span>
          <span>Envoyer un colis</span>
          <small>Je veux être contacté pour organiser un envoi.</small>
        </button>
      </section>

      <section className="client-steps">
        <div>
          <strong>1</strong>
          <h3>Enregistrement</h3>
          <p>Le colis est enregistré au point de départ avec un code unique.</p>
        </div>

        <div>
          <strong>2</strong>
          <h3>Transit</h3>
          <p>Le statut est mis à jour pendant le déplacement du colis.</p>
        </div>

        <div>
          <strong>3</strong>
          <h3>Disponibilité</h3>
          <p>Le destinataire peut être contacté dès l’arrivée du colis.</p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [activePage, setActivePage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isPublicTracking = window.location.pathname === "/suivi";
  const isPublicRequest = window.location.pathname === "/demande";
  const isPublicHome = window.location.pathname === "/client";
  

  function logout() {
    clearSession();
    setUser(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  if (isPublicTracking) {
  return (
    <main className="public-page">
      <button className="back-home-btn" onClick={() => (window.location.href = "/client")}>
  ← Retour
</button>
      <div className="public-header">
        <img src="/logo.png" alt="Fretlome" className="public-logo" />
        <div>
          <h1>Suivi de colis</h1>
          <p>Entrez votre code colis ou téléphone destinataire.</p>
        </div>
      </div>

      <ClientTracking />
    </main>
  );
}
if (isPublicRequest) {
  return (
    <main className="public-page">
      <button className="back-home-btn" onClick={() => (window.location.href = "/client")}>
  ← Retour
</button>
      <div className="public-header">
        <img src="/logo.png" alt="Fretlome" className="public-logo" />
        <div>
          <h1>Envoyer un colis</h1>
          <p>Remplissez le formulaire, un agent vous contactera.</p>
        </div>
      </div>

      <PublicRequest />
    </main>
  );
}

if (isPublicHome) {
  return <PublicHome />;
}

  return (
    <div className="app-layout">
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)}>
  ☰ Menu
</button>

{menuOpen && (
  <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
)}

<Sidebar
  activePage={activePage}
  setActivePage={(page) => {
    setActivePage(page);
    setMenuOpen(false);
  }}
  onLogout={logout}
  menuOpen={menuOpen}
/>

      <main className="main-content">
        <div className="topbar">
          <div>
            <h1>Bonjour, {user.name}</h1>
            <p>{user.role} — hub {user.hub}</p>
          </div>
        </div>

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "parcels" && <Parcels />}
        {activePage === "new-parcel" && <NewParcel />}
        {activePage === "available" && <AvailableParcels />}
        {activePage === "requests" && <Requests />}
        {activePage === "public-request" && <PublicRequest />}
        {activePage === "tracking" && <ClientTracking />}
      </main>
    </div>
  );
}