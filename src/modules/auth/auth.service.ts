import config from "../../config";
import { pool } from "../../db";
import type { UserLogin, UserSignup } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createUser = async (payload: UserSignup) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1, $2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const loginUser = async (payload: UserLogin) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1 
    `,
    [email],
  );

  if (userData.rowCount === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: `${Number(config.accessTime)}m`,
  });

  const resData = {
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };

  return resData;
};

export const authService = {
  createUser,
  loginUser,
};
