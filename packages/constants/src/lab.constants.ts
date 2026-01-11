/**
 * Lab-specific constants for WhatsnXT Platform
 * 
 * This file contains constants related to lab workflows, including
 * auto-page-creation feature introduced in feature 003.
 */

/**
 * Number of questions that trigger automatic page creation
 * 
 * When an instructor saves the 3rd NEW question on a page,
 * the system automatically creates the next page and redirects.
 * 
 * @feature 003-auto-page-creation
 */
export const QUESTIONS_PER_PAGE_THRESHOLD = 3;

/**
 * Auto-page-creation notification messages
 * 
 * Used by the useAutoPageCreation hook to display consistent
 * notifications across the application.
 * 
 * @feature 003-auto-page-creation
 */
export const AUTO_PAGE_CREATION_MESSAGES = {
  SUCCESS: (pageNumber: number) => 
    `Page ${pageNumber} created. Continue adding questions...`,
  ERROR: "Couldn't create next page automatically. Click 'Add New Page' to continue.",
  ERROR_TITLE: 'Page Creation Failed',
  SUCCESS_TITLE: 'Page Created',
} as const;

/**
 * Notification display durations (milliseconds)
 * 
 * Standardizes how long notifications are visible to users.
 * Success messages are brief, error messages stay longer.
 * 
 * @feature 003-auto-page-creation
 */
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 6000,
} as const;
