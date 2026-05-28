# --- STEP 1: Build React (Discarded after build) ---
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend-src
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- STEP 2: Final Runtime Image (Clean & Lean) ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy ONLY the static build artifacts from Step 1
COPY --from=frontend-builder /frontend-src/build /app/static

# Start the unified server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
