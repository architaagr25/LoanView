import type { RequestHandler } from "express";
import { FileAsset } from "../../models";
import { STAFF_ROLES } from "../../types/enums";
import { ApiError } from "../../utils/ApiError";
import { sanitiseFilename } from "../../utils/fileSignature";

/**
 * Serves an uploaded document.
 *
 * Access is granted to the borrower who owns the file, and to internal staff,
 * who must be able to read a salary slip to assess the application it belongs
 * to. Everyone else is refused — a file id is not a permission, so knowing one
 * must not be enough to read the document.
 */
export const downloadFile: RequestHandler = async (req, res) => {
  if (!req.auth) {
    throw ApiError.unauthorized();
  }

  // Bytes are excluded from queries by default and must be asked for.
  const file = await FileAsset.findById(req.params.id).select("+data");
  if (!file) {
    throw ApiError.notFound("File not found");
  }

  const isOwner = file.owner.toString() === req.auth.userId;
  const isStaff = STAFF_ROLES.includes(req.auth.role);

  if (!isOwner && !isStaff) {
    throw ApiError.forbidden("You do not have access to this file");
  }

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Length", String(file.sizeBytes));
  // "inline" so a PDF or image opens in the browser rather than downloading,
  // which is what a reviewer wants when checking an application.
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${sanitiseFilename(file.originalName)}"`,
  );

  res.send(file.data);
};
