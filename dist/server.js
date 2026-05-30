
        import {createRequire} from 'module';
        const require = createRequire(import.meta.url);
        

// src/app.ts
import express from "express";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  database: process.env.DATABASE_URL,
  port: Number(process.env.PORT),
  baseUrl: process.env.BASE_URL,
  secret: process.env.SECRET,
  accessTime: process.env.ACCESS_TIME
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.database
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK(LENGTH(description)>=20),
        type VARCHAR(20) NOT NULL CHECK(type IN ('bug', 'feature_request')),
        status VARCHAR(20) CHECK(status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
        reporter_id INTEGER NOT NULL,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )
    `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createUser = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1, $2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1 
    `,
    [email]
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
    role: user.role
  };
  const token = jwt.sign(jwtpayload, config_default.secret, {
    expiresIn: `${Number(config_default.accessTime)}m`
  });
  const resData = {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
  return resData;
};
var authService = {
  createUser,
  loginUser
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res, next) => {
  try {
    const result = await authService.createUser(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
var login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var route = Router();
route.post("/signup", authController.signup);
route.post("/login", authController.login);
var authRouter = route;

// src/app.ts
import CookieParser from "cookie-parser";

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/middleware/tokenVerification.ts
import jwt2 from "jsonwebtoken";
var isVerified = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!"
        });
      }
      let decoded;
      try {
        decoded = jwt2.verify(token, config_default.secret);
      } catch (err) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: err.name === "TokenExpiredError" ? "Unauthorized: Token expired" : "Unauthorized: Invalid token"
        });
      }
      const userData = await pool.query(
        `
      SELECT * FROM users WHERE email=$1
      `,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (!user) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized: User not found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!"
        });
      }
      req.user = decoded;
      return next();
    } catch (error) {
      next(error);
    }
  };
};
var tokenVerification_default = isVerified;

// src/types/index.ts
var USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/modules/issue/issue.service.ts
var createIssue = async (payload) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,status,reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5)
    RETURNING *
    `,
    [title, description, type, status, reporter_id]
  );
  return result;
};
var getAllIssue = async () => {
  const result = await pool.query(`
    SELECT * FROM issues
    `);
  return result;
};
var getSingleIssue = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id]
  );
  return result.rows[0];
};
var updateIssue = async (issueId, data) => {
  const { title, description, type, status } = data;
  const result = await pool.query(
    `
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status),

    updated_at= NOW()
    WHERE id=$5
    RETURNING *
    `,
    [title, description, type, status, issueId]
  );
  return result.rows[0];
};
var deleteIssue = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1
        `,
    [id]
  );
  return result;
};
var issueService = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.controller.ts
var create = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user?.id;
    const result = await issueService.createIssue({
      ...req.body,
      reporter_id: userId
    });
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
var getAllIssues = async (req, res, next) => {
  try {
    const result = await issueService.getAllIssue();
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};
var getSingleIssue2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssue(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found!",
        data: {}
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateIssue2 = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user?.id;
    const { id } = req.params;
    const updateData = req.body;
    const issue = await issueService.getSingleIssue(id);
    if (!issue) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    const isMaintainer = user?.role === "maintainer";
    const isContributor = user?.role === "contributor";
    if (!isMaintainer) {
      if (!isContributor || issue.reporter_id !== userId || issue.status !== "open") {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You are not allowed to update this issue"
        });
      }
    }
    const result = await issueService.updateIssue(id, updateData);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteIssue2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssue(id);
    if (result.rowCount === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found"
      });
    }
    sendResponse_default(res, {
      statusCode: 204,
      success: true,
      message: "Issue deleted successfully",
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
var issueController = {
  create,
  getAllIssues,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/modules/issue/issue.route.ts
var route2 = Router2();
route2.post(
  "/",
  tokenVerification_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issueController.create
);
route2.get("/", issueController.getAllIssues);
route2.get("/:id", issueController.getSingleIssue);
route2.patch(
  "/:id",
  tokenVerification_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issueController.updateIssue
);
route2.delete(
  "/:id",
  tokenVerification_default(USER_ROLE.maintainer),
  issueController.deleteIssue
);
var issueRoute = route2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  sendResponse_default(res, {
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error",
    error: err
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(CookieParser());
app.use(express.json());
initDB();
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Hello World!"
  });
});
app.use(`${config_default.baseUrl}/auth`, authRouter);
app.use(`${config_default.baseUrl}/issues`, issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map