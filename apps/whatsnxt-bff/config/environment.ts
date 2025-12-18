import dotenv from "dotenv";
import path from "path";

export function loadEnvironment(): void {
  // Load main environment file
  dotenv.config({
    path: path.resolve(__dirname, `../app/.env.${process.env.NODE_ENV}`),
  });

  // Load sub-app environment files
  const envFiles = [`../app/.env.${process.env.NODE_ENV}`];

  envFiles.forEach((file) => {
    const envPath = path.resolve(__dirname, file);
    dotenv.config({ path: envPath });
  });
}
