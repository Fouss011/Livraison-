const labels = {
  registered: "Enregistré",
  in_transit: "En transit",
  arrived: "Arrivé",
  available: "Disponible",
  delivered: "Livré",
  cancelled: "Annulé",
  new: "Nouvelle",
  contacted: "Contacté",
  accepted: "Accepté",
  rejected: "Rejeté"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      {labels[status] || status}
    </span>
  );
}