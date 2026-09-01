FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec-array) so $PORT expands — hosting platforms like Render assign
# their own port via this env var; falls back to 8000 for local docker-compose use.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --reload
