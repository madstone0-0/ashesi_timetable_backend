FROM node:21-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /backend
COPY package.json .
COPY pnpm-lock.yaml .
COPY . .
RUN pnpm install && pnpm build

FROM builder AS production
ENV NODE_ENV=prod
COPY --from=builder /backend/dist ./dist
COPY --from=builder /backend/package.json .
COPY --from=builder /backend/pnpm-lock.yaml .
RUN pnpm install --production && rm -rf $(pnpm store path)

EXPOSE 3000
CMD ["node", "./dist/index.js"]
