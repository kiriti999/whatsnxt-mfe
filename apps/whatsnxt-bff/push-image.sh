#!/bin/bash
set -e

VERSION="$1"
if [ -z "$VERSION" ]; then
  read -p "Enter image version: " VERSION
fi

REPO_NAME=whatsnxt
IMAGE_NAME=whatsnxt
REGION=ap-south-1

export AWS_PROFILE="whatsnxt"

ACCOUNT_ID=$(aws sts get-caller-identity | jq -r ".Account")
echo "Account ID:" $ACCOUNT_ID
echo "REGION:" $REGION
aws ecr get-login-password --region ${REGION} --profile ${AWS_PROFILE} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

aws ecr delete-repository --region ${REGION}  --repository-name ${REPO_NAME} --force --output text 2>/dev/null

REPO_URI=$(aws ecr describe-repositories --region ${REGION}  --repository-names "${REPO_NAME}" --query "repositories[0].repositoryUri" --output text 2>/dev/null || \
           aws ecr create-repository --region ${REGION} --repository-name "${REPO_NAME}"  --query "repository.repositoryUri" --output text)

echo "Repo URI:" ${REPO_URI}

docker tag ${IMAGE_NAME}:${VERSION} ${REPO_URI}:${VERSION}

docker push ${REPO_URI}:${VERSION}