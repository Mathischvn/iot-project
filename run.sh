#!/bin/bash
# =====================================================
# 🧱 Script de build complet IoT
# - Supprime dist + node_modules
# - Réinstalle et build Gateway + Services
# - ⚠️ Ne lance aucun service
# =====================================================

# --- Configuration ---
GATEWAY_DIR="./iot-back/gateway"
LAMP_DIR="./iot-back/lamp-back"
THERMOSTAT_DIR="./iot-back/thermostat-back"
MOTION_DIR="./iot-back/motion-back"

# --- Fonction : Nettoyage complet ---
clean_service() {
  local dir=$1
  echo "🧹 Nettoyage de ${dir}..."
  rm -rf "${dir}/dist" "${dir}/node_modules"
}

# --- Fonction : Build d’un service ---
build_service() {
  local name=$1
  local dir=$2
  echo "🏗️ Build du service ${name}..."
  cd "$dir" || exit 1
  npm install >/dev/null 2>&1
  npm run build >/dev/null 2>&1
  cd - >/dev/null || exit 1
  echo "✅ ${name} compilé avec succès."
}

# --- Étape 1 : Nettoyage ---
echo "🧽 Suppression des dist et node_modules..."
clean_service "$GATEWAY_DIR"
clean_service "$LAMP_DIR"
clean_service "$THERMOSTAT_DIR"
clean_service "$MOTION_DIR"

# --- Étape 2 : Build ---
echo "🚀 Lancement du build pour tous les services..."
build_service "gateway" "$GATEWAY_DIR"
build_service "lamp" "$LAMP_DIR"
build_service "thermostat" "$THERMOSTAT_DIR"
build_service "motion" "$MOTION_DIR"

echo "🎉 Build terminé pour tous les services (aucun service lancé)."
