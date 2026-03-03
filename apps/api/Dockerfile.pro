## Build stage
FROM node:20.13.1-alpine AS build

# install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# copy project contents
COPY ./turbo.json ./
COPY ./pnpm-workspace.yaml ./
COPY ./package.json ./
COPY ./.npmrc ./
COPY ./packages/ ./packages/
COPY ./apps/api/ ./apps/api/

# install project packages and build project internal packages
RUN pnpm install
RUN pnpm run build:packages

# change dir to app dir
WORKDIR /app/apps/api

# install api app packages and run the build for the api app
RUN pnpm install
RUN pnpm run build


## Run stage 
FROM node:20.13.1-alpine AS run

RUN npm install -g pnpm

WORKDIR /app

# copy project contents
COPY --from=build /app/turbo.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/package.json ./
COPY --from=build /app/.npmrc ./
COPY --from=build /app/packages ./packages

# copy api app contents
COPY --from=build /app/apps/api/tsconfig.json ./apps/api/
COPY --from=build /app/apps/api/tsconfig.build.json ./apps/api/
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/nest-cli.json ./apps/api/
COPY --from=build /app/apps/api/src ./apps/api/src
COPY --from=build /app/apps/api/scripts ./apps/api/scripts
COPY --from=build /app/apps/api/log ./apps/api/log
COPY --from=build /app/apps/api/libs ./apps/api/libs
COPY --from=build /app/apps/api/dist ./apps/api/dist

# install only production packages for the project
RUN pnpm install --production

# move to the app folder
WORKDIR /app/apps/api

# install only production packages for the api app
RUN pnpm install --production

EXPOSE 3001