#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# DEKAT Booking Platform - Firebase/FCM Setup Script
# Usage: ./setup-fcm.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[FCM Setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[FCM Setup] WARNING:${NC} $1"; }
err()  { echo -e "${RED}[FCM Setup] ERROR:${NC} $1" >&2; }
info() { echo -e "${BLUE}[FCM Setup] INFO:${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

log "═══════════════════════════════════════════════════════════"
log "DEKAT Firebase/FCM Setup Guide"
log "═══════════════════════════════════════════════════════════"
log ""
log "Follow these steps to configure Firebase Cloud Messaging:"
log ""

# --- Step 1: Check prerequisites ---
info "Step 1: Checking prerequisites..."

if ! command -v firebase &> /dev/null; then
  warn "Firebase CLI not found. Install it:"
  echo "  npm install -g firebase-tools"
  echo "  firebase login"
fi

if ! command -v flutterfire &> /dev/null; then
  warn "FlutterFire CLI not found. Install it:"
  echo "  dart pub global activate flutterfire_cli"
fi

# --- Step 2: Create Firebase project ---
info "Step 2: Create Firebase Project"
echo ""
echo "  1. Go to https://console.firebase.google.com"
echo "  2. Click 'Add project'"
echo "  3. Name: dekat-platform (or your preferred name)"
echo "  4. Enable Google Analytics (recommended)"
echo "  5. Click 'Create project'"
echo ""

# --- Step 3: Register Android apps ---
info "Step 3: Register Android Apps in Firebase"
echo ""
echo "  Register TWO Android apps:"
echo ""
echo "  App 1: Customer App"
echo "    - Package name: id.dekat.customer.mobile_customer"
echo "    - App nickname: DEKAT Customer"
echo "    - Download google-services.json → apps/mobile_customer/android/app/"
echo ""
echo "  App 2: Partner App"
echo "    - Package name: id.dekat.partner.mobile_partner"
echo "    - App nickname: DEKAT Partner"
echo "    - Download google-services.json → apps/mobile_partner/android/app/"
echo ""

# --- Step 4: Generate firebase_options.dart ---
info "Step 4: Generate firebase_options.dart"
echo ""
echo "  Run from project root:"
echo ""
echo "  cd apps/mobile_customer"
echo "  flutterfire configure"
echo "  # Select your Firebase project"
echo "  # Select both Android apps"
echo ""
echo "  This generates lib/firebase_options.dart in each app."
echo ""

# --- Step 5: Update main.dart ---
info "Step 5: Update main.dart for Firebase Options"
echo ""
echo "  Replace Firebase.initializeApp() with:"
echo ""
echo "  import 'firebase_options.dart';"
echo ""
echo "  await Firebase.initializeApp("
echo "    options: DefaultFirebaseOptions.currentPlatform,"
echo "  );"
echo ""

# --- Step 6: Service Account for Backend ---
info "Step 6: Generate Service Account Key for Backend"
echo ""
echo "  1. Go to Firebase Console → Project Settings → Service accounts"
echo "  2. Click 'Generate new private key'"
echo "  3. Save as: infra/fcm/service-account.json"
echo "  4. This file is used by the backend to send FCM push notifications"
echo ""
echo "  NEVER commit service-account.json to git!"
echo ""

# --- Step 7: Update .env ---
info "Step 7: Update Environment Variables"
echo ""
echo "  Add to infra/compose/.env:"
echo ""
echo "  FCM_PROJECT_ID=your-firebase-project-id"
echo "  FCM_SERVICE_ACCOUNT_PATH=./fcm/service-account.json"
echo ""

# --- Step 8: Test ---
info "Step 8: Test FCM Push"
echo ""
echo "  1. Build and run the app on a real device"
echo "  2. Check logcat for FCM token:"
echo "     adb logcat | grep -i fcm"
echo "  3. Send test push from Firebase Console:"
echo "     Firebase → Messaging → New campaign → Notifications"
echo ""

log "═══════════════════════════════════════════════════════════"
log "Setup guide complete. Follow steps above to enable FCM."
log "═══════════════════════════════════════════════════════════"
