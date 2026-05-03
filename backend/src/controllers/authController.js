const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const generateToken = require("../utils/generateToken");

async function register(req, res) {
  try {
    const { name, phone, email, password, role, hub } = req.body;

    if (!name || !email || !password || !role || !hub) {
      return res.status(400).json({
        message: "Nom, email, mot de passe, rôle et hub sont obligatoires."
      });
    }

    const allowedRoles = ["admin", "agent_depart", "agent_arrivee"];
    const allowedHubs = ["lome", "kpalime"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    if (!allowedHubs.includes(hub)) {
      return res.status(400).json({ message: "Hub invalide." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({ name, phone, email, password_hash, role, hub })
      .select("id, name, phone, email, role, hub, created_at")
      .single();

    if (error) {
      return res.status(400).json({
        message: "Impossible de créer l’utilisateur.",
        details: error.message
      });
    }

    const token = generateToken(data);

    return res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: data,
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant l’inscription.",
      details: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires."
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      hub: user.hub,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.json({
      message: "Connexion réussie.",
      user: safeUser,
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur pendant la connexion.",
      details: error.message
    });
  }
}

async function me(req, res) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, phone, email, role, hub, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur.",
      details: error.message
    });
  }
}

module.exports = { register, login, me };