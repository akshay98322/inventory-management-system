# pull official base image
FROM python:3.12-slim-bookworm

# Set work directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy entrypoint.sh
COPY ./entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# Copy project
COPY . .

# Expose port
# EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
