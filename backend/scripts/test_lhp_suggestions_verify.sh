#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"

if ! command -v jq >/dev/null 2>&1; then
  echo "❌ jq is required. Install with: brew install jq  OR  sudo apt-get install jq" >&2
  exit 1
fi

fail() {
  echo "❌ $1" >&2
  exit 1
}

# require tokens
: "${DOCTOR1_TOKEN:?DOCTOR1_TOKEN is not set. source .tokens.env}"
: "${DOCTOR2_TOKEN:?DOCTOR2_TOKEN is not set. source .tokens.env}"

echo "== LHP suggestion verify tests =="

echo "-- Fetching doctor1 suggestions (PENDING)"
D1_SUGG=$(curl -s "$BASE_URL/lhp/suggestions/list" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")

D1_COUNT=$(echo "$D1_SUGG" | jq '.data | length')

if [ "$D1_COUNT" -eq 0 ]; then
  echo "$D1_SUGG" | jq
  fail "Doctor1 has no PENDING suggestions to test with."
fi

echo "Doctor1 PENDING suggestions count: $D1_COUNT"

# Pick the first suggestion
SUGG_ID=$(echo "$D1_SUGG" | jq -r '.data[0]._id')
SUGG_PATIENT=$(echo "$D1_SUGG" | jq -r '.data[0].patientId')
SUGG_SECTION=$(echo "$D1_SUGG" | jq -r '.data[0].section')

echo "Using suggestion:"
echo "  id:       $SUGG_ID"
echo "  patient:  $SUGG_PATIENT"
echo "  section:  $SUGG_SECTION"

# helper: map section -> jq path for that section in LHP
section_to_path() {
  case "$1" in
    CHRONIC_CONDITION)
      echo ".data.chronic"
      ;;
    ALLERGY)
      echo ".data.allergies"
      ;;
    CURRENT_MED)
      echo ".data.currentMedications"
      ;;
    PAST_PROCEDURE)
      echo ".data.pastProcedures"
      ;;
    *)
      echo ""
      ;;
  esac
}

SECTION_PATH=$(section_to_path "$SUGG_SECTION")
if [ -z "$SECTION_PATH" ]; then
  fail "Unknown suggestion section: $SUGG_SECTION"
fi

echo "-- Negative test: doctor2 tries to accept doctor1's suggestion (must be forbidden)"

D2_STATUS=$(curl -s -o /tmp/d2_accept.json -w "%{http_code}" \
  -X POST "$BASE_URL/lhp/suggestions/$SUGG_ID/action" \
  -H "Authorization: Bearer $DOCTOR2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"accept"}')

if [ "$D2_STATUS" -ne 403 ]; then
  echo "Response body from doctor2 attempt:"
  cat /tmp/d2_accept.json | jq || cat /tmp/d2_accept.json
  fail "Expected HTTP 403 when doctor2 tries to accept doctor1's suggestion, got $D2_STATUS"
fi

echo "✅ Doctor2 is forbidden from accepting a suggestion not assigned to them (403)"

echo "-- Positive test: doctor1 accepts their own suggestion"

echo "Fetching LHP BEFORE for patient $SUGG_PATIENT (as doctor1)"
LHP_BEFORE=$(curl -s "$BASE_URL/lhp/$SUGG_PATIENT" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")

BEFORE_LEN=$(echo "$LHP_BEFORE" | jq "$SECTION_PATH | length")
echo "Entries in section $SUGG_SECTION before accept: $BEFORE_LEN"

# Doctor1 accepts the suggestion
ACC_STATUS=$(curl -s -o /tmp/d1_accept.json -w "%{http_code}" \
  -X POST "$BASE_URL/lhp/suggestions/$SUGG_ID/action" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"accept"}')

if [ "$ACC_STATUS" -ne 200 ]; then
  echo "Response body from doctor1 accept:"
  cat /tmp/d1_accept.json | jq || cat /tmp/d1_accept.json
  fail "Expected HTTP 200 when doctor1 accepts their own suggestion, got $ACC_STATUS"
fi

echo "Doctor1 accept response:"
cat /tmp/d1_accept.json | jq || cat /tmp/d1_accept.json

echo "Fetching LHP AFTER for patient $SUGG_PATIENT (as doctor1)"
LHP_AFTER=$(curl -s "$BASE_URL/lhp/$SUGG_PATIENT" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")

AFTER_LEN=$(echo "$LHP_AFTER" | jq "$SECTION_PATH | length")
echo "Entries in section $SUGG_SECTION after accept: $AFTER_LEN"

if [ "$AFTER_LEN" -ne $((BEFORE_LEN + 1)) ]; then
  fail "Expected section $SUGG_SECTION length to increase by 1 after accept (before=$BEFORE_LEN, after=$AFTER_LEN)"
fi

echo "✅ LHP section $SUGG_SECTION increased by 1 after doctor1 accepted the suggestion"

echo "Checking that suggestion is no longer in doctor1's PENDING list"
D1_SUGG_AFTER=$(curl -s "$BASE_URL/lhp/suggestions/list" \
  -H "Authorization: Bearer $DOCTOR1_TOKEN")

STILL_THERE=$(echo "$D1_SUGG_AFTER" | jq --arg id "$SUGG_ID" '.data | map(select(._id == $id)) | length')

if [ "$STILL_THERE" -ne 0 ]; then
  echo "$D1_SUGG_AFTER" | jq '.data'
  fail "Suggestion $SUGG_ID still present in doctor1 PENDING suggestions after accept"
fi

echo "✅ Suggestion $SUGG_ID no longer appears in doctor1's PENDING suggestions"

echo "🎉 Suggestion verify tests passed."
