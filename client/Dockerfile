##################
#BUILD FOR LOCAL DEVELOPMENT
##################

FROM node:19.9.0-alpine3.17 As development

ENV NODE_ENV development

WORKDIR /usr/src/app

COPY  ./package*.json .

RUN npm install

COPY  . .

###################
# BUILD FOR PRODUCTION
###################

FROM node:19.9.0-alpine3.17 AS build

WORKDIR /usr/src/app

COPY  package*.json ./

COPY  --from=development /usr/src/app/node_modules ./node_modules

COPY  . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

###################
# PRODUCTION
###################

FROM node:19.9.0-alpine3.17 AS production

# WORKDIR /usr/src/app

# RUN rm -rf ./*

COPY --from=build /usr/src/app/package.json .

COPY --from=build /usr/src/app/build-node .

RUN npm run --prod

CMD [ "node", "index.js"]
