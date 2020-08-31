#!/bin/bash

echo "creating package.json in every folder, make sure you are in the main directory..."
sleep 2
find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && npm init -y" \;

exit 0

# ls > dirlist
#cat dirlist | xargs -L 1 mkdir
#find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && npm init -y" \;