const supabase = require("../config/supabase");

async function createPickupRequest(req, res) {
  try {
    const { name, phone, departure_city, arrival_city, description, preferred_time } = req.body;

    if (!name || !phone || !departure_city || !arrival_city || !description) {
      return res.status(400).json({
        message: "Nom, téléphone, villes et description sont obligatoires."
      });
    }

    const { data, error } = await supabase
      .from("pickup_requests")
      .insert({
        name,
        phone,
        departure_city,
        arrival_city,
        description,
        preferred_time,
        status: "new"
      })
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({
        message: "Impossible d’envoyer la demande.",
        details: error.message
      });
    }

    return res.status(201).json({
      message: "Demande envoyée. Un agent pourra recontacter le client.",
      request: data
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function getPickupRequests(req, res) {
  try {
    const { status } = req.query;

    let query = supabase
      .from("pickup_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        message: "Impossible de récupérer les demandes.",
        details: error.message
      });
    }

    return res.json({ requests: data });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function updatePickupRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["new", "contacted", "accepted", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const { data, error } = await supabase
      .from("pickup_requests")
      .update({ status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({
        message: "Impossible de mettre à jour la demande.",
        details: error.message
      });
    }

    return res.json({ message: "Demande mise à jour.", request: data });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

module.exports = {
  createPickupRequest,
  getPickupRequests,
  updatePickupRequestStatus
};