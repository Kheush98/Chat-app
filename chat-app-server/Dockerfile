FROM node:20-alpine3.20

LABEL maintener="kheush98 (Github)"
# Je crée le repertoire app dans le conteneur et en meme temps toutes mes prochaines commandes se feront dans ce repertoire
WORKDIR /app
# Je copie tout les fichier de l'application dans /app du conteneur
COPY . ./

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]