#!/bin/bash


REGION=ap-south-1
ACCOUNT_ID=$(aws sts get-caller-identity | jq -r ".Account")
IMAGE_VERSION="$1"
PORT="$2"
REDIS_PORT="$3"
REDIS_COMMANDER_PORT="$4"
ENV_NAME=$(echo "$IMAGE_VERSION" | awk -F'-' '{print $1}')

echo "Account ID:" $ACCOUNT_ID
echo "run image: IMAGE_VERSION: $IMAGE_VERSION"
echo "run image: ENV_NAME: $ENV_NAME"
echo "run image: PORT $PORT"
echo "run image: REDIS_PORT $REDIS_PORT"
echo "run image: REDIS_COMMANDER_PORT $REDIS_COMMANDER_PORT"

aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

if ! docker network inspect app-network &>/dev/null; then
    docker network create app-network
fi
if docker ps -a | grep -q "whatsnxt-$ENV_NAME"; then
    docker rm --force whatsnxt-$ENV_NAME
fi
if docker ps -a | grep -q "redis-$ENV_NAME"; then
    docker rm --force rediscommander-$ENV_NAME
fi
if docker ps -a | grep -q "redis-$ENV_NAME"; then
    docker rm --force redis-$ENV_NAME
fi
if ! docker images -a | grep -q "$IMAGE_VERSION" && docker images -a | grep "whatsnxt"; then
    docker images -a | grep "whatsnxt" | awk '{print $3}' | xargs docker rmi -f
fi

docker run --env-file .env.$ENV_NAME -p $REDIS_PORT:6379 --name redis-$ENV_NAME --network=app-network -d --restart always redis

docker run --env-file .env.$ENV_NAME -p $PORT:$PORT --name whatsnxt-$ENV_NAME --network=app-network \
    --log-driver=awslogs --log-opt awslogs-region=${REGION} --log-opt awslogs-group=whatsnxt-$ENV_NAME-logs-group \
    -d --restart on-failure:5 ${ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/whatsnxt:$IMAGE_VERSION

docker run --env-file .env.$ENV_NAME -e PORT=8081 -p $REDIS_COMMANDER_PORT:8081 --name rediscommander-$ENV_NAME --network=app-network -d --restart always rediscommander/redis-commander

# To check max retry count:
# docker inspect whatsnxt | grep RestartPolicy -A 3

# For analytics purposes, the user can inspect how many times the container has restarted:
# docker inspect -f "{{ .RestartCount }}" whatsnxt
# Or the last time the container restarted:
# docker inspect -f "{{ .State.StartedAt }}" whatsnxt

# To delete images:
# docker stop $(docker ps -aq)
# docker rm $(docker ps -aq)
# docker rmi --force $(docker images -aq)
# docker rmi $(docker images -q '238369675568.dkr.ecr.ap-south-1.amazonaws.com/whatsnxt' | uniq)
