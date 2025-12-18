## Running the app

````bash
# Running the app
$ npm run local # run app in local window/linux os
$ npm run mac # run app in local mac os
$ npm run prod # run app in prod

## Deploying the app to aws

```bash
# run command in root folder
$ docker compose up

# push image to ecr and run terraform to deploy
$ sh deploy.sh

#ts-migration {file_name} e.g (user)
$ npx migrate up {file_name}
$ npx migrate down {file_name}
# when you want to create new migration
$ npx migrate create {file_name}

# env parameter
### Pass required params in .env or .env.local
### example:
````

MIGRATE_MONGO_URI=mongodb://localhost/<db-name-here>
MIGRATE_MONGO_COLLECTION=migrations
MIGRATE_MIGRATIONS_PATH=.//app/database/migrations
MIGRATE_AUTOSYNC=true

$ npx migrate down base-insert-column-template
$ npx migrate up base-insert-column-template

$ npx migrate up base-update-column-template
$ npx migrate down base-update-column-template

$ npx migrate up base-remove-column-template
$ npx migrate down base-remove-column-template

npx migrate up base-insert-record-template
npx migrate down base-insert-record-template

npx migrate up base-update-record-template
npx migrate down base-update-record-template

npx migrate up base-remove-record-template
npx migrate down base-remove-record-template

```

# Swgger docs at the following path:
Assuming you running your app on port 4444
Open http://localhost:4444/api-docs to see Swagger UI for your REST API.
OpenApi2 (default): http://localhost:4444/api-docs/v2
OpenApi3: http://localhost:4444/api-docs/v3
Specification file is available http://localhost:4444/api-spec. Link is prepended to description field.
OpenApi2 (default): http://localhost:4444/api-spec/v2
OpenApi3: http://localhost:4444/api-spec/v3


## Deployment setup
1. Install terraform cli and run `terraform init` inside terraform folder
2. Install aws cli
3. Create aws profile with credentials using `aws configure`
4. Install JQ to run inside deployment bash scripts using `sudo apt update && sudo apt install jq -y`
5. Run `npm run deploy`

## Node version changes
1. Update the package.json with engine
2. Dockerfile base must be updated with relevant node-alpine image
3. Push the dockerfile.base file into dockerhub

# To inspect redis data, install redis-commander as global npm package
# set port 8081 or custom port on npm script command in package.json, for example: REDIS_COMMANDER_PORT=8081 and run the following command to start redis commander on localhost, run the command:
$ redis-commander

# To check the redis on prod, open the prod ec2 public IP with redis commander port
example: http://<ec2-ip>:8081/

## Course builder steps and its function names:
| Stage                   | Function Name            | Allowed Course Status                     |
|-------------------------|--------------------------|-------------------------------------------|
| **Course Creation**     |                          |                                           |
| Create Course Name      | `createCourseName`       | draft                                     |
| **Course Type**         |                          |                                           |
| Update Course Type      | `updateCourseType`       | draft/pending_review/approved/published   |
| **Pricing**             |                          |                                           |
| Update Pricing          | `updatePricing`          | draft/pending_review/approved/published   |
| **Curriculum**          |                          |                                           |
| Update Course Name      | `updateCourseName`       | draft/pending_review/approved/published   |
| Update Section Title    | `updateSectionOrVideoTitle` | -                                     |
| Update Lecture Title    | `updateSectionOrVideoTitle` | -                                     |
| Upload Lecture Video    | `addVideoToLecture`      | -                                         |
| Upload Lecture Document | `addDocToLecture`        | -                                         |
| Update Course Details   | `updateCourseLandingPageDetails`    | draft/pending_review/approved/published   |
| - Course Overview       | "                        | "                                         |
| - Description           | "                        | "                                         |
| - Image                 | "                        | "                                         |
| - Language              | "                        | "                                         |
| - Category              | "                        | "                                         |
| Add Interview Question  | `createQuestionAnswer`   | -                                         |
| **Final Step**          |                          |                                           |
| Submit for Review       | -                        | → pending_review                          |

Intermediary data api's:
getCourseById
```
