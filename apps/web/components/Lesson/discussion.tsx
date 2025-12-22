import { useState } from "react";
import { Box, Card, Flex, Stack, Text, ThemeIcon, Title, useMantineColorScheme } from "@mantine/core";
import { IconMessages, IconMessageCircle, IconSparkles } from "@tabler/icons-react";
import Comment from '@whatsnxt/comments/src';
import { CommentReplyContextProvider } from '@whatsnxt/comments/src/contexts/comment-reply-context';
import { CommentContextProvider } from '@whatsnxt/comments/src/contexts/comment-context';
import type { Comments } from "@whatsnxt/comments/src/types";
import useCommentHandlers from '@whatsnxt/comments/src/hooks/useCommentHandlers';
import useAuth from "../../hooks/Authentication/useAuth";

interface DiscussionProps {
	lessonId: string;
}

const Discussion = ({ lessonId }: DiscussionProps) => {
	const { user } = useAuth();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const [comments, setComments] = useState<Comments>({
		id: 1,
		items: [],
	});

	const {
		handleInsertNode,
		handleEditNode,
		handleDeleteNode,
		handleComments,
		handleSubComment
	} = useCommentHandlers({
		lessonId,
		comments,
		setComments
	});

	return (
		<Stack gap="lg">
			{/* Header Section */}
			<Card
				radius="lg"
				p="lg"
				withBorder
				style={{
					background: isDark
						? 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-7) 100%)'
						: 'linear-gradient(135deg, var(--mantine-color-violet-0) 0%, var(--mantine-color-white) 100%)',
					borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-violet-1)',
				}}
			>
				<Flex gap="md" align="center">
					<ThemeIcon
						size={50}
						radius="xl"
						variant="light"
						color="violet"
						style={{
							boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)',
						}}
					>
						<IconMessages size={26} stroke={1.5} />
					</ThemeIcon>
					<Box>
						<Title order={4} c={isDark ? 'white' : 'dark.7'}>
							Lesson Discussion
						</Title>
						<Text size="sm" c="dimmed" mt={4}>
							Ask questions, share insights, and learn from others
						</Text>
					</Box>
				</Flex>
			</Card>

			{/* Comments Section */}
			<Box
				p="md"
				style={{
					background: isDark ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-gray-0)',
					borderRadius: '12px',
					border: `1px solid ${isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
				}}
			>
				<CommentReplyContextProvider handleComments={handleComments} comments={comments}>
					<CommentContextProvider>
						<Comment
							email={user?.email}
							userId={user?._id}
							userName={user?.name}
							comment={comments}
							root
							rootDepth={1}
							lessonId={lessonId}
							handleInsertNode={handleInsertNode}
							handleEditNode={handleEditNode}
							handleDeleteNode={handleDeleteNode}
							handleComments={handleComments}
							handleSubComment={handleSubComment}
						/>
					</CommentContextProvider>
				</CommentReplyContextProvider>

				{/* Empty State Hint */}
				{comments.items?.length === 0 && (
					<Flex
						direction="column"
						align="center"
						justify="center"
						py="xl"
						gap="md"
						style={{ opacity: 0.7 }}
					>
						<ThemeIcon
							size={60}
							radius="xl"
							variant="light"
							color="gray"
						>
							<IconMessageCircle size={28} stroke={1.5} />
						</ThemeIcon>
						<Box ta="center">
							<Text size="sm" c="dimmed" fw={500}>
								Be the first to start a discussion!
							</Text>
							<Flex gap="xs" align="center" justify="center" mt="xs">
								<IconSparkles size={14} style={{ color: 'var(--mantine-color-yellow-5)' }} />
								<Text size="xs" c="dimmed">
									Your questions help everyone learn better
								</Text>
							</Flex>
						</Box>
					</Flex>
				)}
			</Box>
		</Stack>
	)
}

export default Discussion;
