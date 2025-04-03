FROM node:20

WORKDIR /app

RUN npm install -g pm2

CMD ["bash"]
