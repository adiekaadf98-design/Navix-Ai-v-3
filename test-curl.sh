#!/bin/bash
KEY=$(curl -s -X POST http://localhost:3000/api/developer/keys -H "Content-Type: application/json" -d '{"userId":"test"}' | grep -o '"key":"[^"]*"' | cut -d'"' -f4)
echo "Generated Key: $KEY"

curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "navix-pro-v1",
    "messages": [{"role": "user", "content": "Halo apa kabar?"}]
  }'
