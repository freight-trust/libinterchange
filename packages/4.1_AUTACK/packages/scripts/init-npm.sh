#!/bin/bash

echo "creating package.json in every folder, make sure you are in the main directory..."
sleep 2
find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && npm init -y" \;

exit 0

