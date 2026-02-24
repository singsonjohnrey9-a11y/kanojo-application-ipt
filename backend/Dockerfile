FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --no-input

# Expose port
EXPOSE 8000

# Start with Daphne (ASGI — supports HTTP + WebSockets)
# Use shell form so $PORT gets expanded
CMD ["/bin/sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p $PORT config.asgi:application"]
