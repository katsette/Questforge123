#!/bin/bash
cd "$(dirname "$0")"

# Clear problematic host variables
unset HOSTNAME
unset HOST
unset XAUTHLOCALHOSTNAME

# Set proper environment variables
export HOST=localhost
export PORT=3000
export REACT_APP_API_URL=http://localhost:5000

echo "Starting QuestForge Frontend..."
echo "HOST: $HOST"
echo "PORT: $PORT" 
echo "API URL: $REACT_APP_API_URL"

npm start
