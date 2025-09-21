### build the app
```
docker compose build
```
### run the app
```
docker compose up
```
### bring down the container
```
docker-compose down -v
```
### make migration
```
docker compose exec web uv run manage.py makemigrations
```
### migrate
```
docker compose exec web uv run manage.py migrate
```
### create superuser
```
docker compose exec web uv run manage.py createsuperuser
```