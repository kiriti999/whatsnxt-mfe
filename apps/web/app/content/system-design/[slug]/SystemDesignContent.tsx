"use client";

import {
	Avatar,
	Badge,
	Box,
	Button,
	Collapse,
	Container,
	Divider,
	Group,
	Paper,
	Progress,
	Stack,
	Tabs,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronRight,
	IconCrown,
	IconLock,
	IconMessages,
	IconPencilCheck,
	IconServer2,
} from "@tabler/icons-react";
import BlogComment from "@whatsnxt/blogcomments/src";
import { CommentContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-context";
import { CommentReplyContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-reply-context";
import useCommentHandlers from "@whatsnxt/blogcomments/src/hooks/useCommentHandlers";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LexicalEditor } from "../../../../components/StructuredTutorial/Editor/LexicalEditor";
import { ApiDesignEditor } from "../../../../components/SystemDesign/ApiDesignEditor";
import { MermaidDiagram } from "../../../../components/SystemDesign/MermaidDiagram";
import useAuth from "../../../../hooks/Authentication/useAuth";
import classes from "./SystemDesignContent.module.css";

interface CommentNode {
	id: string;
	text: string;
	email: string;
	parents: string[];
	items: CommentNode[];
	[key: string]: unknown;
}

interface Section {
	key: string;
	title: string;
	content: string;
	sortOrder: number;
}

interface Diagram {
	key: string;
	title: string;
	content: string;
	sortOrder: number;
}

interface CompanyRef {
	name: string;
	logoUrl?: string;
}

interface SystemDesignCourse {
	_id: string;
	title: string;
	slug: string;
	category: string;
	isPremium?: boolean;
	sections: Section[];
	diagrams: Diagram[];
	status: string;
	createdAt: string;
	updatedAt: string;
	topics?: string[];
	companies?: CompanyRef[];
	difficulty?: string;
	interviewFrequency?: string;
	estimatedMinutes?: number;
	relatedSlugs?: string[];
	outcomeHighlight?: string;
}

interface SystemDesignContentProps {
	course: SystemDesignCourse;
}

const frequencyToProgress = (f?: string) => {
	if (f === "high") return 100;
	if (f === "medium") return 66;
	if (f === "low") return 33;
	return 0;
};

const SystemDesignContent = ({ course }: SystemDesignContentProps) => {
	const { user } = useAuth();
	const sectionsWithContent = course.sections.filter((s) => s.content?.trim());
	const diagramsWithContent = course.diagrams.filter((d) => d.content?.trim());
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
	const [comments, setComments] = useState<{
		id: number;
		items: CommentNode[];
	}>({
		id: 1,
		items: [],
	});

	const {
		handleInsertNode,
		handleEditNode,
		handleDeleteNode,
		handleComments,
		handleSubComment,
	} = useCommentHandlers({
		contentId: course._id,
		comments,
		setComments,
	});

	const toggleSection = useCallback((key: string) => {
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
	}, []);

	return (
		<Container size="xl" py="xl">
			<Paper radius="md" p="xl" className={classes.paper}>
				<Stack gap="xs" mb="xl" align="center">
					<Group gap={6}>
						<IconServer2 size={16} color="var(--mantine-color-blue-6)" />
						<Text
							size="xs"
							fw={700}
							tt="uppercase"
							c="blue"
							className={classes.label}
						>
							System Design
						</Text>
					</Group>
					<Title order={2} ta="center" className={classes.title}>
						{course.title}
					</Title>
					<Group gap="sm">
						{course.status && course.status.toLowerCase() !== "published" && (
							<Badge variant="filled" color="orange">
								{course.status.toLowerCase() === "archived"
									? "Archived (owner preview)"
									: "Draft — only visible when signed in as owner"}
							</Badge>
						)}
						<Badge variant="light" color="blue">
							{course.category}
						</Badge>
						{course.isPremium && (
							<Badge
								variant="gradient"
								gradient={{ from: "yellow", to: "orange" }}
								leftSection={<IconCrown size={14} />}
							>
								Premium
							</Badge>
						)}
						{course.difficulty ? (
							<Badge variant="light" color="grape">
								{course.difficulty}
							</Badge>
						) : null}
						{course.estimatedMinutes ? (
							<Badge variant="light" color="teal">
								~{course.estimatedMinutes} min read
							</Badge>
						) : null}
						<Badge variant="light" color="gray">
							{sectionsWithContent.length} sections
						</Badge>
						<Badge variant="light" color="gray">
							{diagramsWithContent.length} diagrams
						</Badge>
					</Group>
					{course.outcomeHighlight ? (
						<Text size="sm" ta="center" maw={720} c="dimmed">
							{course.outcomeHighlight}
						</Text>
					) : null}
					{course.companies &&
						course.companies.filter((c) => c.name).length > 0 && (
							<Group justify="center" gap="xs">
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Asked at
								</Text>
								<Avatar.Group spacing="sm">
									{course.companies
										.filter((c) => c.name)
										.slice(0, 8)
										.map((c) => (
											<Avatar
												key={c.name}
												src={c.logoUrl || undefined}
												radius="xl"
												size="md"
											>
												{c.name.slice(0, 1)}
											</Avatar>
										))}
								</Avatar.Group>
							</Group>
						)}
					{course.interviewFrequency ? (
						<Box w="100%" maw={480}>
							<Text size="xs" c="dimmed" mb={4}>
								Editorial interview frequency
							</Text>
							<Progress
								value={frequencyToProgress(course.interviewFrequency)}
								color="cyan"
								size="sm"
							/>
						</Box>
					) : null}
					{course.topics && course.topics.length > 0 && (
						<Group justify="center" gap={6} wrap="wrap">
							{course.topics.map((t) => (
								<Badge
									key={t}
									component={Link}
									href={`/system-design/browse?topic=${encodeURIComponent(t)}`}
									variant="dot"
									color="cyan"
									style={{ cursor: "pointer" }}
								>
									{t}
								</Badge>
							))}
						</Group>
					)}
					<Stack gap="xs" align="center" mt="md" maw={640} mx="auto">
						<Text size="xs" c="dimmed" ta="center">
							Explore more prep resources
						</Text>
						<Group justify="center" gap="sm" wrap="wrap">
							<Button
								component={Link}
								prefetch
								href="/system-design/topics"
								variant="light"
								size="sm"
								radius="md"
							>
								Topic map
							</Button>
							<Button
								component={Link}
								prefetch
								href="/courses"
								variant="light"
								size="sm"
								radius="md"
							>
								All courses
							</Button>
							<Button
								component={Link}
								prefetch
								href="/system-design/browse"
								variant="light"
								size="sm"
								radius="md"
							>
								System design library
							</Button>
							<Button
								component={Link}
								prefetch
								href="/interview-experiences"
								variant="light"
								size="sm"
								radius="md"
							>
								Interview experiences
							</Button>
						</Group>
					</Stack>
					{course.relatedSlugs && course.relatedSlugs.length > 0 && (
						<Group justify="center" gap="xs" wrap="wrap">
							<Text size="xs" c="dimmed">
								Related:
							</Text>
							{course.relatedSlugs.map((s) => (
								<Button
									key={s}
									component={Link}
									href={`/content/system-design/${s}`}
									variant="light"
									size="xs"
									color="gray"
								>
									{s}
								</Button>
							))}
						</Group>
					)}
					<Button
						component={Link}
						href={`/practice/system-design/${course.slug}`}
						leftSection={
							course.isPremium ? (
								<IconLock size={18} />
							) : (
								<IconPencilCheck size={18} />
							)
						}
						variant="gradient"
						gradient={
							course.isPremium
								? { from: "yellow", to: "orange" }
								: { from: "blue", to: "cyan" }
						}
						size="md"
						radius="md"
						mt="sm"
					>
						{course.isPremium ? "Unlock & Practice" : "Practice This Course"}
					</Button>
				</Stack>

				{sectionsWithContent.length > 0 && (
					<>
						<Divider label="Content Sections" labelPosition="center" mb="md" />
						<Stack gap="sm">
							{sectionsWithContent.map((section) => (
								<Paper
									key={section.key}
									className={classes.section}
									radius="md"
								>
									<UnstyledButton
										onClick={() => toggleSection(section.key)}
										className={classes.sectionHeader}
										w="100%"
									>
										<Group justify="space-between">
											<Text size="sm" fw={600} className={classes.sectionTitle}>
												{section.title}
											</Text>
											{openSections[section.key] ? (
												<IconChevronDown size={18} />
											) : (
												<IconChevronRight size={18} />
											)}
										</Group>
									</UnstyledButton>
									<Collapse in={!!openSections[section.key]}>
										<Box pt="sm">
											{section.key === "api-design" ? (
												<ApiDesignEditor
													value={section.content}
													onChange={() => {}}
													readOnly
												/>
											) : (
												<LexicalEditor
													value={section.content}
													onChange={() => {}}
													readOnly
												/>
											)}
										</Box>
									</Collapse>
								</Paper>
							))}
						</Stack>
					</>
				)}

				{diagramsWithContent.length > 0 && (
					<>
						<Divider label="Diagrams" labelPosition="center" my="md" />
						<Tabs defaultValue={diagramsWithContent[0]?.key}>
							<Tabs.List>
								{diagramsWithContent.map((d) => (
									<Tabs.Tab key={d.key} value={d.key}>
										{d.title}
									</Tabs.Tab>
								))}
							</Tabs.List>
							{diagramsWithContent.map((d) => (
								<Tabs.Panel key={d.key} value={d.key} pt="md">
									<Box className={classes.diagramPanel}>
										<MermaidDiagram code={d.content} />
									</Box>
								</Tabs.Panel>
							))}
						</Tabs>
					</>
				)}
			</Paper>

			<Paper radius="md" p="xl" mt="lg" className={classes.paper}>
				<Group gap="sm" mb="md">
					<IconMessages size={20} color="var(--mantine-color-blue-6)" />
					<Title order={4}>Discussion</Title>
				</Group>
				<CommentReplyContextProvider
					email={user?.email}
					contentId={course._id}
					handleComments={handleComments}
					comments={comments}
				>
					<CommentContextProvider>
						<BlogComment
							userId={user?._id}
							email={user?.email}
							comment={comments}
							item={course}
							root
							rootDepth={1}
							contentId={course._id}
							handleInsertNode={handleInsertNode}
							handleEditNode={handleEditNode}
							handleDeleteNode={handleDeleteNode}
							handleComments={handleComments}
							handleSubComment={handleSubComment}
						/>
					</CommentContextProvider>
				</CommentReplyContextProvider>
			</Paper>
		</Container>
	);
};

export default SystemDesignContent;
