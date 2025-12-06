#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required. Install with: brew install jq  OR  sudo apt-get install jq" >&2
  exit 1
fi

# Patient IDs from your seeds
P1="6778c1e4f1f0a9a8f0000001"  # Arjun
P2="6778c1e4f1f0a9a8f0000002"  # Isha
P3="6778c1e4f1f0a9a8f0000003"  # Rohit

# Doctor IDs from your seeds
DOCTOR1_ID="6778c1e4f1f0a9a8f0000011"
DOCTOR2_ID="6778c1e4f1f0a9a8f0000012"

fail() {
  echo "❌ $1" >&2
  exit 1
}

assert_all_status_verified_doctor() {
  local json="$1"
  local path="$2"

  local bad
  bad=$(echo "$json" | jq "$path | map(select(.status != \"VERIFIED_DOCTOR\")) | length")

  if [ "$bad" -ne 0 ]; then
    echo "---- offending entries at $path ----"
    echo "$json" | jq "$path | map(select(.status != \"VERIFIED_DOCTOR\"))"
    fail "Found non-VERIFIED_DOCTOR entries at $path"
  fi
}

assert_has_unverified_somewhere() {
  local json="$1"
  local path="$2"

  local count
  count=$(echo "$json" | jq "$path | map(select(.status == \"UNVERIFIED\")) | length")

  if [ "$count" -eq 0 ]; then
    echo "$json" | jq "$path"
    fail "Expected at least one UNVERIFIED entry at $path, found none"
  fi
}

echo "== LHP integration tests =="

# 0) Sanity: ensure tokens are present
: "${DOCTOR1_TOKEN:?DOCTOR1_TOKEN is not set. source .tokens.env}"
: "${DOCTOR2_TOKEN:?DOCTOR2_TOKEN is not set. source .tokens.env}"
: "${PATIENT1_TOKEN:?PATIENT1_TOKEN is not set. source .tokens.env}"
: "${ADMIN_TOKEN:?ADMIN_TOKEN is not set. source .tokens.env}"

# STAFF is optional – if you don't have staff, comment this block out or ignore HAS_STAFF
if [ "${STAFF1_TOKEN:-}" != "" ]; then
  HAS_STAFF=1
else
  HAS_STAFF=0
fi

# 1) Doctor1: P1 LHP -> only VERIFIED_DOCTOR
echo "-- Doctor1: LHP P1 (must be verified-only)"
D1_P1=$(curl -s "$BASE_URL/lhp/$P1" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")

echo "$D1_P1" | jq '.data | {chronic, allergies, currentMedications, pastProcedures}'

assert_all_status_verified_doctor "$D1_P1" '.data.chronic'
assert_all_status_verified_doctor "$D1_P1" '.data.allergies'
assert_all_status_verified_doctor "$D1_P1" '.data.currentMedications'
assert_all_status_verified_doctor "$D1_P1" '.data.pastProcedures'

echo "✅ Doctor1 sees only VERIFIED_DOCTOR LHP entries for P1"

# 2) Doctor2: same behavior, now also print payload
echo "-- Doctor2: LHP P1 (must be verified-only)"
D2_P1=$(curl -s "$BASE_URL/lhp/$P1" \
  -H "Authorization: Bearer $DOCTOR2_TOKEN")

echo "$D2_P1" | jq '.data | {chronic, allergies, currentMedications, pastProcedures}'

assert_all_status_verified_doctor "$D2_P1" '.data.chronic'
assert_all_status_verified_doctor "$D2_P1" '.data.allergies'
assert_all_status_verified_doctor "$D2_P1" '.data.currentMedications'
assert_all_status_verified_doctor "$D2_P1" '.data.pastProcedures'

echo "✅ Doctor2 also sees only VERIFIED_DOCTOR entries for P1"

# 3) Staff: behaves like doctor (if staff exists)
if [ "$HAS_STAFF" -eq 1 ]; then
  echo "-- Staff1: LHP P1 (must also be verified-only)"
  ST1_P1=$(curl -s "$BASE_URL/lhp/$P1" \
    -H "Authorization: Bearer $STAFF1_TOKEN")

  echo "$ST1_P1" | jq '.data | {chronic, allergies, currentMedications, pastProcedures}'

  assert_all_status_verified_doctor "$ST1_P1" '.data.chronic'
  assert_all_status_verified_doctor "$ST1_P1" '.data.allergies'
  assert_all_status_verified_doctor "$ST1_P1" '.data.currentMedications'
  assert_all_status_verified_doctor "$ST1_P1" '.data.pastProcedures'

  echo "✅ Staff1 sees only VERIFIED_DOCTOR LHP entries for P1"
else
  echo "-- Staff1: skipped (no STAFF1_TOKEN)"
fi

# 4) Patient1: LHP P1 -> full view (must include at least one UNVERIFIED)
echo "-- Patient1: LHP P1 (full view; includes UNVERIFIED)"
P1_SELF=$(curl -s "$BASE_URL/lhp/$P1" \
  -H "Authorization: Bearer $PATIENT1_TOKEN")

echo "$P1_SELF" | jq '.data | {chronic, allergies, currentMedications, pastProcedures}'

# expect at least one UNVERIFIED entry in chronic or currentMedications
assert_has_unverified_somewhere "$P1_SELF" '.data.chronic + .data.currentMedications'

echo "✅ Patient1 sees unverified LHP entries for their own record"

# 5) Patient1: cannot access P2
echo "-- Patient1: LHP P2 (must be forbidden)"
P1_P2_STATUS=$(curl -s -o /tmp/p1_p2_lhp.json -w "%{http_code}" \
  "$BASE_URL/lhp/$P2" \
  -H "Authorization: Bearer $PATIENT1_TOKEN")

if [ "$P1_P2_STATUS" -ne 403 ]; then
  echo "Response body:"
  cat /tmp/p1_p2_lhp.json
  fail "Expected HTTP 403 for patient1 accessing P2 LHP, got $P1_P2_STATUS"
fi

echo "✅ Patient1 is forbidden from accessing P2's LHP (403)"

# 6) Admin: full LHP for P1 (must contain VERIFIED + UNVERIFIED)
echo "-- Admin: LHP P1 (full view; should include UNVERIFIED)"
ADM_P1=$(curl -s "$BASE_URL/lhp/$P1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$ADM_P1" | jq '.data | {chronic, allergies, currentMedications, pastProcedures}'

# admin should see at least one UNVERIFIED entry
assert_has_unverified_somewhere "$ADM_P1" '.data.chronic + .data.currentMedications'

echo "✅ Admin sees unverified entries in LHP P1"

# 7) Suggestions list: each doctor only sees their own PENDING suggestions
echo "-- Suggestions list per doctor"

D1_SUGG=$(curl -s "$BASE_URL/lhp/suggestions/list" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")
D2_SUGG=$(curl -s "$BASE_URL/lhp/suggestions/list" \
  -H "Authorization: Bearer $DOCTOR2_TOKEN")

echo "Doctor1 suggestions:"
echo "$D1_SUGG" | jq '.data'

echo "Doctor2 suggestions:"
echo "$D2_SUGG" | jq '.data'

echo "Doctor1 suggestions count: $(echo "$D1_SUGG" | jq '.data | length')"
echo "Doctor2 suggestions count: $(echo "$D2_SUGG" | jq '.data | length')"

# ensure doctorId matches and status is PENDING
D1_BAD=$(echo "$D1_SUGG" | jq --arg id "$DOCTOR1_ID" '.data | map(select(.doctorId != $id or .status != "PENDING")) | length')
D2_BAD=$(echo "$D2_SUGG" | jq --arg id "$DOCTOR2_ID" '.data | map(select(.doctorId != $id or .status != "PENDING")) | length')

if [ "$D1_BAD" -ne 0 ]; then
  echo "❌ Doctor1 suggestions contain wrong doctorId or non-PENDING:"
  echo "$D1_SUGG" | jq '.data | map(select(.doctorId != "6778c1e4f1f0a9a8f0000011" or .status != "PENDING"))'
  fail "Doctor1 suggestions error"
fi

if [ "$D2_BAD" -ne 0 ]; then
  echo "❌ Doctor2 suggestions contain wrong doctorId or non-PENDING:"
  echo "$D2_SUGG" | jq '.data | map(select(.doctorId != "6778c1e4f1f0a9a8f0000012" or .status != "PENDING"))'
  fail "Doctor2 suggestions error"
fi

echo "✅ Each doctor only sees their own PENDING suggestions"

echo "🎉 All LHP tests passed."
