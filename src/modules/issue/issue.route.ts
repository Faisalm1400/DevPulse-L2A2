import { Router } from "express";
import isVerified from "../../middleware/tokenVerification";
import { USER_ROLE } from "../../types";
import { issueController } from "./issue.controller";

const route = Router();

// create issue
route.post(
  "/",
  isVerified(USER_ROLE.maintainer, USER_ROLE.contributor),
  issueController.create,
);
// get issue
route.get("/", issueController.getAllIssues);

// // get single issue
route.get("/:id", issueController.getSingleIssue);

// // get update issue
route.patch(
  "/:id",
  isVerified(USER_ROLE.maintainer, USER_ROLE.contributor),
  issueController.updateIssue,
);

// // get delete issue
route.delete(
  "/:id",
  isVerified(USER_ROLE.maintainer),
  issueController.deleteIssue,
);

export const issueRoute = route;
