#!/bin/bash
# =====================================================
# 🚀 Script de démarrage complet IoT
# - Supprime dist + node_modules
# - Rebuild et démarre Gateway
# - Vérifie readiness via /health
# - Lance ensuite les autres services
# =====================================================

# --- Configuration ---
GATEWAY_DIR="./iot-back/gateway"
LAMP_DIR="./iot-back/lamp"
THERMOSTAT_DIR="./iot-back/thermostat"
MOTION_DIR="./iot-back/motion"
GATEWAY_URL="http://localhost:3000/health"

# --- Fonction : Nettoyage ---
clean_service() {
  local dir=$1
  echo "🧹 Nettoyage de ${dir}..."
  rm -rf "${dir}/dist" "${dir}/node_modules"
}

# --- Fonction : Vérifier /health ---
check_health() {
  local url=$1
  local retries=30
  local count=0
  echo "🩺 Vérification de la disponibilité de ${url}..."

  until curl -fs "${url}" > /dev/null; do
    count=$((count + 1))
    if [ $count -ge $retries ]; then
      echo "❌ Timeout : la Gateway n'est pas prête après $retries tentatives."
      exit 1
    fi
    echo "⏳ Tentative $count/$retries - en attente de la Gateway..."
    sleep 2
  done

  echo "✅ Gateway prête et répond sur ${url}"
}

# --- Fonction : Build et start service ---
start_service() {
  local name=$1
  local dir=$2
  echo "🚀 Démarrage du service ${name}..."
  cd "$dir" || exit 1
  npm install >/dev/null 2>&1
  npm run build >/dev/null 2>&1
  nohup npm run start:prod > "../../logs/${name}.log" 2>&1 &
  cd - >/dev/null || exit 1
  echo "✅ ${name} lancé"
}

# --- Préparation ---
echo "📁 Création du dossier de logs..."
mkdir -p logs

# --- Nettoyage complet ---
echo "🧽 Suppression des dist et node_modules..."
clean_service "$GATEWAY_DIR"
clean_service "$LAMP_DIR"
clean_service "$THERMOSTAT_DIR"
clean_service "$MOTION_DIR"

# --- Gateway ---
echo "🏗️ Installation + build de la Gateway..."
cd "$GATEWAY_DIR" || exit 1
npm run build >/dev/null 2>&1
nohup npm run start:prod > "../../logs/gateway.log" 2>&1 &
cd - >/dev/null || exit 1

# --- Attente de readiness ---
check_health "$GATEWAY_URL"

# --- Démarrage des autres services ---
start_service "lamp" "$LAMP_DIR"
start_service "thermostat" "$THERMOSTAT_DIR"
start_service "motion" "$MOTION_DIR"

echo "🎉 Tous les services sont lancés avec succès !"
echo "📜 Logs disponibles dans le dossier ./logs"
