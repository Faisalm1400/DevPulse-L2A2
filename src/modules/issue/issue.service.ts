import { pool } from "../../db";
import type { Issue } from "./issue.interface";

const createIssue = async (payload: Issue) => {
  const { title, description, type, status, reporter_id } = payload;

  const result = await pool.query(
    `
    INSERT INTO issues(title,description,type,status,reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5)
    RETURNING *
    `,
    [title, description, type,status, reporter_id],
  );

  return result;
};

const getAllIssue = async () => {
  const result = await pool.query(`
    SELECT * FROM issues
    `);

  return result;
};

const getSingleIssue = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id],
  );

  return result.rows[0];
};

const updateIssue = async (issueId: string, data: Issue) => {
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
    [title, description, type, status, issueId],
  );

  return result.rows[0];
};

const deleteIssue = async (id: string) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1
        `,
    [id],
  );

  return result;
};

export const issueService = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
