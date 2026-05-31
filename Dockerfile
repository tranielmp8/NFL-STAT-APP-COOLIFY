FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres \
	ORIGIN=http://localhost:3000 \
	BETTER_AUTH_SECRET=build-time-placeholder-secret \
	npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db
COPY --from=builder /app/src/lib/server/nfl/team-data.ts ./src/lib/server/nfl/team-data.ts

EXPOSE 3000

CMD ["node", "build"]
