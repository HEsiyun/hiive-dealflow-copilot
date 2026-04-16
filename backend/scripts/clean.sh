#!/usr/bin/env bash

echo "Cleaning cache files..."

find . -type d -name "__pycache__" -exec rm -rf {} +
find . -name "*.pyc" -delete

echo "Done."


# To run this script, use:
# ./scripts/clean.sh