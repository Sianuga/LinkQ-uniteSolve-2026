FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Use slim requirements (no chromadb/sentence-transformers — ~2GB of deps).
# The matching engine gracefully falls back to demo scores without them.
COPY requirements-docker.txt .
RUN pip install --no-cache-dir -r requirements-docker.txt

COPY app/ app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
