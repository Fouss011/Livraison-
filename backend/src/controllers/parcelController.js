const supabase = require("../config/supabase");

const VALID_STATUSES = [
  "registered",
  "in_transit",
  "arrived",
  "available",
  "delivered",
  "cancelled"
];

async function createParcel(req, res) {
  try {
    const {
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      departure_city,
      arrival_city,
      description,
      delivery_price
    } = req.body;

    if (!sender_name || !sender_phone || !receiver_name || !receiver_phone || !description) {
      return res.status(400).json({
        message: "Expéditeur, destinataire, téléphones et description sont obligatoires."
      });
    }

    const parcelPayload = {
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      departure_city: departure_city || "Lomé",
      arrival_city: arrival_city || "Kpalimé",
      description,
      delivery_price: Number(delivery_price || 0),
      status: "registered",
      current_location: departure_city || "Lomé",
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from("parcels")
      .insert(parcelPayload)
      .select("*")
      .single();

    if (error) {
      return res.status(400).json({
        message: "Impossible d’enregistrer le colis.",
        details: error.message
      });
    }

    await supabase.from("parcel_events").insert({
  parcel_id: data.id,
  status: "registered",
  location: data.current_location,
  note: "Colis enregistré au point de départ.",
  created_by: req.user.id
});

    return res.status(201).json({
      message: "Colis enregistré avec succès.",
      parcel: data
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant l’enregistrement du colis.",
      details: error.message
    });
  }
}

async function getParcels(req, res) {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from("parcels")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    if (search) {
      query = query.or(
        `code.ilike.%${search}%,sender_phone.ilike.%${search}%,receiver_phone.ilike.%${search}%,receiver_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        message: "Impossible de récupérer les colis.",
        details: error.message
      });
    }

    return res.json({ parcels: data });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function getParcelById(req, res) {
  try {
    const { id } = req.params;

    const { data: parcel, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !parcel) {
      return res.status(404).json({ message: "Colis introuvable." });
    }

    const { data: events } = await supabase
      .from("parcel_events")
      .select("*")
      .eq("parcel_id", id)
      .order("created_at", { ascending: true });

    return res.json({ parcel, events: events || [] });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function updateParcelStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, current_location, note } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const { data: updatedParcel, error } = await supabase
      .from("parcels")
      .update({
        status,
        current_location: current_location || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !updatedParcel) {
      return res.status(400).json({
        message: "Impossible de mettre à jour le colis.",
        details: error?.message
      });
    }

    await supabase.from("parcel_events").insert({
      parcel_id: id,
      status,
      location: current_location || updatedParcel.current_location,
      note: note || null,
      created_by: req.user.id
    });

    return res.json({
      message: "Statut du colis mis à jour.",
      parcel: updatedParcel
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant la mise à jour.",
      details: error.message
    });
  }
}

async function getAvailableParcels(req, res) {
  try {
    const { arrival_city } = req.query;

    let query = supabase
      .from("parcels")
      .select("*")
      .eq("status", "available")
      .order("updated_at", { ascending: false });

    if (arrival_city) query = query.eq("arrival_city", arrival_city);

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        message: "Impossible de récupérer les colis disponibles.",
        details: error.message
      });
    }

    return res.json({ parcels: data });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    const { data: parcels, error } = await supabase
      .from("parcels")
      .select("status, delivery_price, created_at");

    if (error) {
      return res.status(400).json({
        message: "Impossible de récupérer les statistiques.",
        details: error.message
      });
    }

    const stats = {
      total: parcels.length,
      registered: 0,
      in_transit: 0,
      arrived: 0,
      available: 0,
      delivered: 0,
      cancelled: 0,
      revenue_estimated: 0
    };

    parcels.forEach((parcel) => {
      if (stats[parcel.status] !== undefined) stats[parcel.status] += 1;
      if (parcel.status !== "cancelled") {
        stats.revenue_estimated += Number(parcel.delivery_price || 0);
      }
    });

    return res.json({ stats });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
}

async function trackParcelPublic(req, res) {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "Code colis ou téléphone obligatoire."
      });
    }

    const { data: parcel, error } = await supabase
      .from("parcels")
      .select("*")
      .or(
        `code.ilike.%${search}%,receiver_phone.ilike.%${search}%`
      )
      .limit(1)
      .single();

    if (error || !parcel) {
      return res.status(404).json({
        message: "Aucun colis trouvé avec ces informations."
      });
    }

    const { data: events } = await supabase
      .from("parcel_events")
      .select("status, location, note, created_at")
      .eq("parcel_id", parcel.id)
      .order("created_at", { ascending: true });

    return res.json({
      parcel: {
        code: parcel.code,
        sender_name: parcel.sender_name,
        receiver_name: parcel.receiver_name,
        receiver_phone: parcel.receiver_phone,
        departure_city: parcel.departure_city,
        arrival_city: parcel.arrival_city,
        description: parcel.description,
        status: parcel.status,
        current_location: parcel.current_location,
        created_at: parcel.created_at,
        updated_at: parcel.updated_at
      },
      events: events || []
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant le suivi du colis.",
      details: error.message
    });
  }
}

async function deleteParcel(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("parcels")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({
        message: "Impossible de supprimer le colis.",
        details: error.message
      });
    }

    return res.json({ message: "Colis supprimé avec succès." });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant la suppression.",
      details: error.message
    });
  }
}

module.exports = {
  createParcel,
  getParcels,
  getParcelById,
  updateParcelStatus,
  getAvailableParcels,
  getDashboardStats,
  trackParcelPublic,
  deleteParcel
};