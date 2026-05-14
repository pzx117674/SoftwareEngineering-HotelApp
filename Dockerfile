# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Final image ----
FROM node:22-alpine
# Required to compile better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++
WORKDIR /app
# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev
# Copy backend source
COPY backend/src ./backend/src
# Copy built frontend static files
COPY --from=frontend-builder /build/dist ./frontend/dist
EXPOSE 3001
CMD ["node", "backend/src/index.js"]
