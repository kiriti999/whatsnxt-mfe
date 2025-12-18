import { Response } from "express";
import { Db } from "mongodb";
import { getLogger } from "../../../config/logger";

const logger = getLogger("common-utils");

/**
 * Set access token cookie
 */
export const setAccessCookie = (
  res: Response,
  key: string,
  value: string,
  isProd: boolean,
  cookiesDomain: string | undefined,
  maxAge: number,
): void => {
  const cookieOptions: any = {
    httpOnly: true,
    path: "/",
    maxAge: maxAge,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };

  if (cookiesDomain) {
    cookieOptions.domain = cookiesDomain;
  }

  res.cookie(key, value, cookieOptions);
};

/**
 * Set user data cookie
 */
export const setUserCookie = (
  res: Response,
  key: string,
  value: any,
  isProd: boolean,
  cookiesDomain: string | undefined,
  maxAge: number,
): void => {
  const cookieOptions: any = {
    path: "/",
    httpOnly: true,
    maxAge: maxAge,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };

  if (cookiesDomain) {
    cookieOptions.domain = cookiesDomain;
  }

  res.cookie(key, JSON.stringify(value), cookieOptions);
};

/**
 * Clear authentication cookies
 */
export const clearCookies = (
  res: Response,
  accessKey: string,
  userKey: string,
  isProd: boolean,
  cookiesDomain: string | undefined,
): void => {
  const cookieOptions: any = {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };

  if (cookiesDomain) {
    cookieOptions.domain = cookiesDomain;
  }

  res.clearCookie(accessKey, cookieOptions);
  res.clearCookie(userKey, cookieOptions);
};

/**
 * Convert string to URL-friendly slug
 */
export const applySlug = (str: string): string => {
  const decodedStr = decodeURIComponent(str.toLowerCase());

  const slug = decodedStr
    .replace(/[\s+]+/g, "-") // Replace spaces and '+' with a single hyphen
    .replace(/[^\w-]+/g, "") // Remove any non-word characters (except hyphens)
    .replace(/\./g, "") // Remove any dots from the string
    .replace(/--+/g, "-") // Replace multiple hyphens with a single one
    .replace(/^-+|-+$/g, "") // Trim hyphens from the start and end
    .replace(/\?+$/, ""); // Remove trailing question marks (?)

  return slug;
};

/**
 * Check if slug already exists in database
 */
export const checkDuplicateSlug = async (
  slug: string,
  db: Db,
): Promise<boolean> => {
  try {
    // Check in drafts collection
    const draftPost = await db.collection("drafts").findOne({ slug });
    if (draftPost) return true;

    // Check in published posts collection
    const publishedPost = await db.collection("posts").findOne({ slug });
    if (publishedPost) return true;

    return false;
  } catch (error) {
    logger.error("checkDuplicateSlug :: error:", error);
    throw error;
  }
};
