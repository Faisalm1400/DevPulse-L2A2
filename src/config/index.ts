import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  database: process.env.DATABASE_URL as string,
  port: Number(process.env.PORT),
  baseUrl: process.env.BASE_URL,
  secret: process.env.SECRET,
  accessTime: process.env.ACCESS_TIME,
};

export default config;
