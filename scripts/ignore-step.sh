#!/bin/bash

echo "VERCEL_ENV: $VERCEL_ENV"

if [[ "$VERCEL_ENV" == "production" ]] ; then
  echo "✅ - Build can proceed"
  exit 1;

else
  echo "🛑 - Build cancelled"
  exit 0;
fi