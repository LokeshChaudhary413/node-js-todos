FROM node:20

WORKDIR /app

RUN npm install -g pm2

# Create uploads directory and set permissions
RUN mkdir -p /app/backend/public/uploads && chmod 777 /app/backend/public/uploads

CMD ["bash"]
