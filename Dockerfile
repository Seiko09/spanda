# Stage 1: Build Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Runtime
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy built frontend from Stage 1 into the static folder
COPY --from=frontend-builder /frontend/build /app/static

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
