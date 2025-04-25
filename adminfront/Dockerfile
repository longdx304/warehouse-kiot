FROM node:20.11.0-alpine3.18

# Use production node environment by default.
# ENV NODE_ENV production

# Set the working directory and assign ownership to the non-root user
WORKDIR /app/adminfront

# Copy the package.json and yarn lock files to the working directory
COPY package.json .
COPY yarn.* .

# Run the apk update command to update package information
RUN apk update

# Install the dependencies
RUN yarn --network-timeout 1000000

COPY . .

# Set the default command to run the application in development mode
ENTRYPOINT [ "yarn", "dev"]
