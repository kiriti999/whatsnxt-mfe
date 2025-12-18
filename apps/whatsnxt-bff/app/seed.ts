import { MongoClient } from "mongodb";
import { scryptSync } from "crypto";
import algoliasearch from "algoliasearch";
require("dotenv").config({ path: ".env.local" });

const CATEGORIES = [
  { categoryName: "misc" },
  { categoryName: "javascript" },
  { categoryName: "aws" },
  { categoryName: "reactjs" },
  { categoryName: "html" },
  { categoryName: "css" },
  { categoryName: "nodejs" },
  { categoryName: "mongo" },
  { categoryName: "sql" },
  { categoryName: "git" },
  { categoryName: "jenkins" },
  { categoryName: "cicd" },
  { categoryName: "bitbucket" },
  { categoryName: "python" },
  { categoryName: "webpack" },
  { categoryName: "nextjs" },
  { categoryName: "terraform" },
  { categoryName: "ai" },
  { categoryName: "express" },
  { categoryName: "kubernetes" },
  { categoryName: "ansible" },
  { categoryName: "fullstack" },
  { categoryName: "docker" },
  { categoryName: "redis" },
];

const url = process.env.MONGODB_URL;
const generic_db = process.env.PUBLIC_DB;
const user_db = "test@test-com";
const client = new MongoClient(url);

let mongoClient = null;
let dbConnection = null;
let algoliaClient = null;
let algoliaIndex = null;

const createAlgoliaClient = () => {
  algoliaClient = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_SEARCH_ADMIN_KEY,
  );
  algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);
};

async function init() {
  if (process.env.NODE_ENV !== "prod") {
    const dbList = (await getDbLists()).databases;
    if (isDbExists(dbList, generic_db)) {
      await client.db(generic_db).dropDatabase();
    }
    if (isDbExists(dbList, user_db)) {
      await client.db(user_db).dropDatabase();
    }
    createAlgoliaClient();
    await algoliaIndex.clearObjects({
      indexName: process.env.ALGOLIA_INDEX_NAME,
    });
    const insertResult = await insertCategories();
    await createUser();
    const posts = createPosts(insertResult);
    insertPostsIntoGenericDb(posts);
    insertPostsIntoUserDb(posts);
  }
}

async function getDbConnection() {
  if (dbConnection) {
    console.log("Reusing existing database connection.");
    return dbConnection;
  }

  const connectionUrl = process.env.MONGODB_URL;
  mongoClient = new MongoClient(connectionUrl, {
    maxPoolSize: 499,
  });

  await mongoClient.connect();
  dbConnection = mongoClient.db(user_db);
  console.log("Created new database connection.");
  return dbConnection;
}

const insertCategories = async () => {
  try {
    const db = client.db(generic_db);
    let collection = db.collection("categories");
    const insertResult = await collection.insertMany(CATEGORIES);
    console.log("Seed.js:: Inserted category documents:", insertResult);
    return insertResult;
  } catch (error) {
    console.log("insertCategories:: error: ", error);
  }
};

const insertPostsIntoGenericDb = async (posts) => {
  const db = client.db(generic_db);
  let collection = db.collection("posts");
  const result = await collection.insertMany(posts);
  console.log("Seed.js:: Inserted posts documents into generic db:", result);
};

const insertPostsIntoUserDb = async (posts) => {
  const db = await getDbConnection();
  let collection = db.collection("posts");
  const result = await collection.insertMany(posts);
  console.log("Seed.js:: Inserted posts documents into user db:", result);
};

const createUser = async () => {
  try {
    const db = await getDbConnection();
    const STATIC_SALT = "12qwaszx";
    const hashedPassword = scryptSync("Secure@123", STATIC_SALT, 32).toString(
      "hex",
    );
    const options = {
      name: "test",
      email: "test@test.com",
      password: hashedPassword,
      creator: true,
    };

    let user = null;
    const inserted = await db.collection("users").insertOne(options, {});
    user = await db.collection("users").findOne({ _id: inserted.insertedId });
    if (user) delete user.password;
    return user;
  } catch (error) {
    console.log("🚀 ~ createUser ~ error:", error);
  }
};

async function indexPost(post) {
  try {
    const record = {
      objectID: post.algoliaId,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      description: post.description,
      slug: post.categoryName,
      title: post.title,
      listed: post.listed,
      published: post.published,
      updated_at: post.updated_at,
      _id: post._id,
    };

    const algoliaResponse = await algoliaIndex.saveObject(record);
    console.log("algolia.js:: algoliaResponse: ", algoliaResponse);
    return algoliaResponse;
  } catch (error) {
    console.log("algolia.js:: error: ", error);
  }
}

const createPosts = (insertResult) => {
  const posts = [];
  for (let i = 0; i < insertResult.insertedCount; i++) {
    const insertedId = insertResult.insertedIds[i].toString();
    posts.push({
      algoliaId: Date.now(),
      title: CATEGORIES[i].categoryName,
      slug: CATEGORIES[i].categoryName,
      listed: true,
      published: true,
      description: CATEGORIES[i].categoryName,
      categoryId: insertedId,
      categoryName: CATEGORIES[i].categoryName,
      updated_at: new Date(Date.now()).toISOString(),
    });
    indexPost(posts[i]);
  }
  return posts;
};

async function getDbLists() {
  const db = client.db();
  let adminDB = db.admin();
  console.log("getDbLists: ", await adminDB.listDatabases());
  return await adminDB.listDatabases();
}

const isDbExists = (dbList, dbName) => dbList.some((e) => e.name === dbName);

init();
