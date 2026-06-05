#!/bin/bash
# VizBiz Rerun Trigger — Background Execution via Vercel API
#
# This script triggers the background processor running on Vercel.
# It handles the long-running request gracefully by:
# 1. Starting the request in background
# 2. Logging output to a file
# 3. Checking completion via API status
#
# Usage: ./scripts/rerun-trigger.sh [--check]
#   --check   Only check status of queued leads, don't trigger

LOG_FILE="/tmp/rerun-trigger.log"
STATUS_FILE="/tmp/rerun-status.json"
API_BASE="https://vizbiz.ai"

echo "$(date '+%Y-%m-%d %H:%M:%S') — VizBiz Rerun Trigger" | tee -a "$LOG_FILE"

# Function to check current queue status
check_status() {
  echo "Checking lead queue status..."
  curl -sL "$API_BASE/api/pipeline-status" > "$STATUS_FILE" 2>/dev/null
  
  # Count by status
  QUEUED=$(grep -c '"rerun_queued"' "$STATUS_FILE" 2>/dev/null || echo "0")
  PROCESSING=$(grep -c '"rerun_processing"' "$STATUS_FILE" 2>/dev/null || echo "0")
  COMPLETED=$(grep -c '"rerun_completed"' "$STATUS_FILE" 2>/dev/null || echo "0")
  FAILED=$(grep -c '"rerun_failed"' "$STATUS_FILE" 2>/dev/null || echo "0")
  
  echo "  Queued:     $QUEUED"
  echo "  Processing: $PROCESSING"
  echo "  Completed:  $COMPLETED"
  echo "  Failed:     $FAILED"
  
  return $QUEUED
}

# Main trigger function
trigger_processor() {
  echo "Triggering background processor..."
  
  # Start the request in background with long timeout
  # The server will process even if client disconnects
  curl -sL --max-time 300 "$API_BASE/api/cron/process-reruns" \
    > /tmp/rerun-result.json 2>&1 &
  
  CURL_PID=$!
  echo "  Request started (PID: $CURL_PID)"
  
  # Wait up to 10 seconds for quick response (if no leads to process)
  # or let it continue in background for actual processing
  TIMEOUT=10
  ELAPSED=0
  while kill -0 $CURL_PID 2>/dev/null; do
    sleep 1
    ELAPSED=$((ELAPSED + 1))
    if [ $ELAPSED -ge $TIMEOUT ]; then
      echo "  Request running in background (>$TIMEOUT\s). Server will complete processing."
      echo "  Check logs or re-run with --check to see status."
      break
    fi
  done
  
  # If completed quickly, show result
  if [ -f /tmp/rerun-result.json ]; then
    RESULT=$(cat /tmp/rerun-result.json)
    if [ -n "$RESULT" ]; then
      echo "  Result: $RESULT" | head -c 200
      echo ""
    fi
  fi
}

# Main
if [ "$1" = "--check" ]; then
  check_status
  exit 0
fi

# Check current status first
check_status

# Trigger processing if there are queued leads
if [ "$QUEUED" -gt 0 ]; then
  trigger_processor
  
  # Wait a bit and check again
  echo ""
  echo "Waiting 30s for processing to start..."
  sleep 30
  check_status
else
  echo ""
  echo "No leads queued for rerun. Nothing to do."
fi

echo ""
echo "Done. Next check: $(date -v+5M '+%H:%M') or run with --check"
echo "---" | tee -a "$LOG_FILE"
