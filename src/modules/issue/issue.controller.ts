import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utils/sendResponse";

const create = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    const userId = user?.id;

    const result = await issueService.createIssue({
      ...req.body,
      reporter_id: userId,
    });

    // console.log(result.rows[0]);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssue();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssue(id as string);

    if (result.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found!",
        data: {},
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const userId = user?.id;
    const { id } = req.params;
    const updateData = req.body;

    const issue = await issueService.getSingleIssue(id as string);

    // console.log("Issue:",issue);

    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    const isMaintainer = user?.role === "maintainer";
    const isContributor = user?.role === "contributor";

    if (!isMaintainer) {
      if (
        !isContributor ||
        issue.reporter_id !== userId ||
        issue.status !== "open"
      ) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You are not allowed to update this issue",
        });
      }
    }

    // console.log(updateData);

    const result = await issueService.updateIssue(
      id as string,
      updateData,
    );

    // console.log("Result:", result);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.deleteIssue(id as string);

    if (result.rowCount === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not Found",
      });
    }

    sendResponse(res, {
      statusCode: 204,
      success: true,
      message: "Issue deleted successfully",
      data: {},
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issueController = {
  create,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
