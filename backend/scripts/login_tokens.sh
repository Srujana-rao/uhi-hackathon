#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required. Install: brew install jq  OR sudo apt-get install jq"
  exit 1
fi

login() {
  local email="$1"
  local password="$2"
  local varname="$3"

  echo "🔑 Logging in as $email ..." >&2

  local token
  token=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    | jq -r '.token')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    echo "❌ Failed to get token for $email" >&2
    return 1
  fi

  echo "export $varname=\"$token\""
}

# Write tokens to .tokens.env
{
  # ADMIN
  login "admin@test.com" "admin123" "ADMIN_TOKEN" || true

  # DOCTORS
  login "doctor1@test.com" "password123" "DOCTOR1_TOKEN" || true
  login "doctor2@test.com" "password123" "DOCTOR2_TOKEN" || true
  login "doctor3@test.com" "password123" "DOCTOR3_TOKEN" || true

  # PATIENTS
  login "patient1@test.com" "password123" "PATIENT1_TOKEN" || true
  login "patient2@test.com" "password123" "PATIENT2_TOKEN" || true
  login "patient3@test.com" "password123" "PATIENT3_TOKEN" || true

  # STAFF
  login "staff1@test.com" "password123" "STAFF1_TOKEN" || true
  login "staff2@test.com" "password123" "STAFF2_TOKEN" || true

} > .tokens.env

echo "✅ Tokens written to .tokens.env"
echo "➡ Run:  source .tokens.env"
