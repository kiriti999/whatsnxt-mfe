/**
 * useAutoPageCreation Hook
 * 
 * Custom hook for automatically creating and navigating to a new lab page
 * after an instructor saves the 3rd question on the current page.
 * 
 * Features:
 * - Tracks question count locally (resets on page change)
 * - Triggers auto-creation only for NEW questions (not edits)
 * - Handles all question types equally (MCQ, True/False, Fill in the blank)
 * - Gracefully handles failures (preserves saved questions)
 * - Shows success/error notifications
 * - Navigates to newly created page on success
 * 
 * @feature 003-auto-page-creation
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import labApi from '@/apis/lab.api';
import type { Question } from '@whatsnxt/types';
import {
  QUESTIONS_PER_PAGE_THRESHOLD,
  AUTO_PAGE_CREATION_MESSAGES,
  NOTIFICATION_DURATIONS,
} from '@whatsnxt/constants';

/**
 * Hook options
 */
export interface UseAutoPageCreationOptions {
  /** Lab UUID */
  labId: string;
  /** Current page UUID */
  currentPageId: string;
  /** Current page number (for display in notifications) */
  currentPageNumber: number;
  /** Enable/disable auto-creation (useful for feature flags) */
  enabled?: boolean;
}

/**
 * Hook return value
 */
export interface UseAutoPageCreationResult {
  /** Whether a page is currently being created */
  isCreatingPage: boolean;
  /** Callback to invoke after a question is saved */
  onQuestionSaved: (question: Question, isEdit: boolean) => Promise<void>;
}

/**
 * Auto-page-creation hook
 * 
 * @example
 * ```typescript
 * const { isCreatingPage, onQuestionSaved } = useAutoPageCreation({
 *   labId: 'abc-123',
 *   currentPageId: 'page-456',
 *   currentPageNumber: 1,
 *   enabled: true,
 * });
 * 
 * // After saving a question:
 * const question = await labApi.saveQuestion(labId, pageId, data);
 * await onQuestionSaved(question.data, false); // isEdit = false for new questions
 * ```
 */
export function useAutoPageCreation({
  labId,
  currentPageId,
  currentPageNumber: _currentPageNumber,
  enabled = true,
}: UseAutoPageCreationOptions): UseAutoPageCreationResult {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(0);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  /**
   * Fetch initial question count when page loads or changes
   * 
   * This ensures the count is accurate even if the user navigates
   * to a page that already has questions.
   * 
   * Note: The backend supports multiple questions per page (up to 30).
   * We count ALL questions on the page to determine if auto-creation
   * should trigger.
   */
  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await labApi.getLabPageById(labId, currentPageId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const page = response.data as any;

        // Count existing questions on the page
        let count = 0;
        if (page.questions && Array.isArray(page.questions)) {
          count = page.questions.length;
        } else if (page.question) {
          // Fallback: if API returns singular 'question', count as 1
          count = 1;
        }
        // Note: Diagram tests don't count toward the threshold

        setQuestionCount(count);
      } catch (error) {
        console.error('Failed to fetch initial question count:', error);
        setQuestionCount(0);
      }
    };

    fetchInitialCount();
  }, [labId, currentPageId]);

  /**
   * Callback invoked after a question is saved
   * 
   * This function:
   * 1. Checks if the saved question is an edit (skip counting)
   * 2. Increments the local question count for new questions
   * 3. Triggers auto-creation if count reaches threshold (3)
   * 4. Handles success (navigate + notify) or failure (notify only)
   * 
   * @param question - The saved question (returned from API)
   * @param isEdit - Whether this was editing an existing question
   */
  const onQuestionSaved = useCallback(
    async (question: Question, isEdit: boolean) => {
      // If feature is disabled, do nothing
      if (!enabled) return;

      // If editing existing question, don't count toward threshold
      if (isEdit) return;

      // Increment count for new question
      const newCount = questionCount + 1;
      setQuestionCount(newCount);

      // Check if we've reached the threshold
      if (newCount === QUESTIONS_PER_PAGE_THRESHOLD) {
        setIsCreatingPage(true);

        try {
          // Create the next page (backend auto-generates page number)
          const response = await labApi.createLabPage(labId, {});
          const newPage = response.data;

          // Navigate to the new page
          router.push(`/labs/${labId}/pages/${newPage.id}`);

          // Show success notification with next page number
          notifications.show({
            title: AUTO_PAGE_CREATION_MESSAGES.SUCCESS_TITLE,
            message: AUTO_PAGE_CREATION_MESSAGES.SUCCESS(newPage.pageNumber),
            color: 'green',
            autoClose: NOTIFICATION_DURATIONS.SUCCESS,
          });
        } catch (error) {
          console.error('Failed to create next page:', error);

          // Show error notification with fallback guidance
          notifications.show({
            title: AUTO_PAGE_CREATION_MESSAGES.ERROR_TITLE,
            message: AUTO_PAGE_CREATION_MESSAGES.ERROR,
            color: 'red',
            autoClose: NOTIFICATION_DURATIONS.ERROR,
          });

          // Note: Question was already saved successfully before this point,
          // so no data is lost. User can manually create page via lab detail.
        } finally {
          setIsCreatingPage(false);
        }
      }
    },
    [labId, currentPageId, questionCount, enabled, router]
  );

  return {
    isCreatingPage,
    onQuestionSaved,
  };
}
