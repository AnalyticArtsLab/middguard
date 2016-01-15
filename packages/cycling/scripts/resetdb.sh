#!/bin/sh

db="cycling.db"

echo "Removing database \"$db\"..."
rm $db


echo "Applying all migrations..."
./bin/migrate-latest --middguard
./bin/migrate-latest --package cycling
