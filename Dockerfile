# --- STEP 1: Build React ---
FROM node:18-alpine AS frontend-builder
WORKDIR /build-dir
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- STEP 2: Final Image ---
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY . .

# Copy built frontend
COPY --from=frontend-builder /build-dir/build /app/static

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
