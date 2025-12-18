#!/bin/bash
set -e

ENV_NAME="$2"
PORT="$3"
REDIS_PORT="$4"
REDIS_COMMANDER_PORT="$5"

echo "ENV_NAME: $ENV_NAME"
echo "PORT: $PORT"
echo "REDIS_PORT: $REDIS_PORT"
echo "REDIS_COMMANDER_PORT: $REDIS_COMMANDER_PORT"

if [ "$1" = "--auto" ]; then
  # Default version increment logic here
  # Use sed instead of grep -oP for macOS compatibility
  CURRENT_VERSION=$(sed -n 's/^prod_image_version = "\(.*\)"/\1/p' terraform/terraform.tfvars)
  echo "CURRENT_VERSION: ${CURRENT_VERSION}"
  
  # Extract the version number (assuming format like prod-v1.0)
  # CURRENT_VERSION is already the value inside quotes, so we can use it directly
  OLD_VERSION="$CURRENT_VERSION"

  # Split the version into major and minor parts
  VER_MAJOR=$(echo "$OLD_VERSION" | awk -F'.' '{print $1}')
  VER_MINOR=$(echo "$OLD_VERSION" | awk -F'.' '{print $2}')

  # Increment the minor version
  NEW_MINOR=$((VER_MINOR + 1))

  # Create the new version
  NEW_VERSION="$VER_MAJOR.$NEW_MINOR"
  echo "NEW_VERSION: ${NEW_VERSION}"
else
  read -p "Enter image version (format: env-v#.#): " NEW_VERSION
  # Validate the input format
  if [[ ! $NEW_VERSION =~ ^[a-zA-Z]+-v[0-9]+\.[0-9]+$ ]]; then
    echo "Invalid version format. Please use format 'env-v#.#' (e.g., prod-v1.0)."
    exit 1
  fi
fi

# Replace the old version with the new version in docker-compose.yml
# Use sed -i '' for macOS compatibility and [[:space:]] for cross-platform whitespace matching
sed -i '' "s/^[[:space:]]*image: \"whatsnxt:.*\"/    image: \"whatsnxt:$NEW_VERSION\"/" docker-compose-$ENV_NAME.yml

# Force Docker to build for linux/amd64 platform (required for EC2 t2.micro deployment from Mac M1/M2)
export DOCKER_DEFAULT_PLATFORM=linux/amd64

npm run docker-prod
echo "Build completed"

chmod +x ./push-image.sh

./push-image.sh $NEW_VERSION

cd terraform
# Use sed -i '' for macOS compatibility
sed -i '' "s/^prod_image_version = .*/prod_image_version = \"$NEW_VERSION\"/" terraform.tfvars
sed -i '' "s/^env_name = .*/env_name = \"$ENV_NAME\"/" terraform.tfvars
sed -i '' "s/^port = .*/port = \"$PORT\"/" terraform.tfvars
sed -i '' "s/^redis_port = .*/redis_port = \"$REDIS_PORT\"/" terraform.tfvars
sed -i '' "s/^redis_commander_port = .*/redis_commander_port = \"$REDIS_COMMANDER_PORT\"/" terraform.tfvars
terraform apply -auto-approve
