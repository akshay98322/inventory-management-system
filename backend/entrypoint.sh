#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 1
    done

    echo "PostgreSQL started"
fi

# Apply database migrations
python manage.py migrate --no-input

# Collect static files
# python manage.py collectstatic --no-input


exec "$@"