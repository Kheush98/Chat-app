FROM node:20-alpine3.20

LABEL maintener="kheush98 (Github)"

WORKDIR /app

COPY . ./

RUN npm install

EXPOSE 5173

CMD [ "npm", "run", "dev" ]