# To use this with Docker:
# 1. `docker build -t iftttdelay .`
# 2. `docker run -p 3002:3002 -d iftttdelay`
# The service will now be listening on http://localhost:3002

FROM node:10.11-alpine

EXPOSE 3002

WORKDIR /usr/src/app

# Install packages
COPY package*.json ./
RUN npm install

# Copy application source into container
COPY . .

# Run as a non-root user for better security
USER node

CMD [ "/usr/src/app/bin/www" ]
