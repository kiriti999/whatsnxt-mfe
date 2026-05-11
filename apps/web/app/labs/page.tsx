/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Container,
	Group,
	Pagination,
	Paper,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconEdit,
	IconListCheck,
	IconLock,
	IconPlayerPlay,
	IconSchema,
	IconTrophy,
} from "@tabler/icons-react";
import { PAGINATION } from "@whatsnxt/constants";
import type { Lab } from "@whatsnxt/types";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import labApi from "@/apis/lab.api";
import useAuth from "@/hooks/Authentication/useAuth";
import { labDescriptionText } from "@/utils/lab-utils";

interface LabWithProgress extends Lab {
	progress?: {
		totalPages: number;
		passedPages: number;
		percentage: number;
	};
	questionCount?: number;
	diagramTestCount?: number;
	previewCount?: number;
}

const LabsPage = () => {
	const [publishedLabs, setPublishedLabs] = useState<LabWithProgress[]>([]);
	const [draftLabs, setDraftLabs] = useState<Lab[]>([]);
	const [publishedPage, setPublishedPage] = useState(1);
	const [draftPage, setDraftPage] = useState(1);
	const [publishedTotal, setPublishedTotal] = useState(0);
	const [draftTotal, setDraftTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const { user, isAuthenticated } = useAuth();

	const isTrainer = isAuthenticated && user?.role === "trainer";
	const isStudent = isAuthenticated && user?.role !== "trainer";
	const studentId = user?._id || "";
	const instructorId = user?._id || "";
	const pageSize = PAGINATION.LAB_DIRECTORY_PAGE_SIZE;

	const fetchPublishedLabs = async (page: number) => {
		try {
			const response: any = await labApi.getPublishedLabs(page, pageSize);
			const labs = response.data;

			// Fetch progress for each lab if user is a student
			if (isStudent && studentId) {
				const labsWithProgress = await Promise.all(
					labs.map(async (lab: Lab) => {
						try {
							const progressResponse = await labApi.getStudentProgress(
								lab.id,
								studentId,
							);
							return {
								...lab,
								progress: progressResponse.data,
							};
						} catch (error) {
							// If no progress found, continue without progress data
							return lab;
						}
					}),
				);
				setPublishedLabs(labsWithProgress);
			} else {
				setPublishedLabs(labs);
			}

			setPublishedTotal(response.pagination?.totalItems ?? 0);
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to load published labs.";
			notifications.show({
				title: "Error",
				message: errorMessage,
				color: "red",
			});
			console.error("Failed to load published labs:", error);
		}
	};

	const fetchDraftLabs = async (page: number) => {
		if (!instructorId || !isTrainer) {
			setDraftLabs([]);
			setDraftTotal(0);
			return;
		}

		try {
			const response = await labApi.getDraftLabs(instructorId, page, pageSize);
			setDraftLabs(response.data);
			setDraftTotal(response.pagination?.totalItems ?? 0);
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to load draft labs.";
			notifications.show({
				title: "Error",
				message: errorMessage,
				color: "red",
			});
			console.error("Failed to load draft labs:", error);
		}
	};

	useEffect(() => {
		const loadLabs = async () => {
			setLoading(true);
			await fetchPublishedLabs(publishedPage);

			// Only fetch draft labs if user is authenticated as trainer with valid ID
			if (isTrainer && instructorId) {
				await fetchDraftLabs(draftPage);
			} else {
				setDraftLabs([]);
				setDraftTotal(0);
			}

			setLoading(false);
		};

		loadLabs();
	}, [
		isAuthenticated,
		instructorId,
		isTrainer,
		isStudent,
		studentId,
		publishedPage,
		draftPage,
	]);

	if (loading) {
		return (
			<Container size="lg" py="xl">
				<Text>Loading labs...</Text>
			</Container>
		);
	}

	return (
		<Container size="lg" py="xl">
			{/* Hero Overview Section */}
			<style jsx global>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes draw-line {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-float {
          animation: float-y 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-y 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-rotate {
          transform-origin: center;
          animation: rotate-slow 20s linear infinite;
        }
        .animate-pulse {
          animation: pulse-soft 4s ease-in-out infinite;
        }
        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 20s linear infinite;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          transition: transform 0.2s ease;
          box-shadow: var(--mantine-shadow-md);
        }
        .labs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .labs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
			<Paper
				p="xl"
				mb={50}
				radius="lg"
				className="bg-default-hover"
				style={{
					border: "1px solid var(--mantine-color-default-border)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Animated Background Elements */}
				<Box
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 0,
						pointerEvents: "none",
					}}
				>
					<svg
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
						style={{ opacity: 0.6 }}
					>
						<defs>
							<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop
									offset="0%"
									style={{
										stopColor: "var(--mantine-color-blue-2)",
										stopOpacity: 0.4,
									}}
								/>
								<stop
									offset="100%"
									style={{
										stopColor: "var(--mantine-color-cyan-2)",
										stopOpacity: 0.1,
									}}
								/>
							</linearGradient>
							<radialGradient
								id="grad2"
								cx="50%"
								cy="50%"
								r="50%"
								fx="50%"
								fy="50%"
							>
								<stop
									offset="0%"
									style={{
										stopColor: "var(--mantine-color-blue-4)",
										stopOpacity: 0.1,
									}}
								/>
								<stop
									offset="100%"
									style={{
										stopColor: "var(--mantine-color-blue-4)",
										stopOpacity: 0,
									}}
								/>
							</radialGradient>
						</defs>

						{/* Abstract Grid/Circuit Lines */}
						<path
							d="M50,50 Q200,100 300,50 T600,100"
							fill="none"
							stroke="var(--mantine-color-blue-2)"
							strokeWidth="1"
							className="animate-draw"
							style={{ opacity: 0.3 }}
						/>
						<path
							d="M-50,150 Q200,200 400,100 T900,200"
							fill="none"
							stroke="var(--mantine-color-cyan-2)"
							strokeWidth="1"
							className="animate-draw"
							style={{ animationDelay: "2s", opacity: 0.3 }}
						/>

						{/* Floating Shapes */}
						<circle
							cx="10%"
							cy="20%"
							r="60"
							fill="url(#grad1)"
							className="animate-float"
						/>
						<circle
							cx="90%"
							cy="80%"
							r="80"
							fill="var(--mantine-color-grape-1)"
							className="animate-float-delayed"
							style={{ opacity: 0.3 }}
						/>

						{/* Rotating Elements */}
						<g className="animate-rotate" style={{ transformBox: "fill-box" }}>
							<rect
								x="80%"
								y="15%"
								width="50"
								height="50"
								rx="10"
								stroke="var(--mantine-color-indigo-2)"
								strokeWidth="2"
								fill="none"
								style={{ opacity: 0.4 }}
							/>
						</g>

						{/* Pulsing Dots */}
						<circle
							cx="15%"
							cy="85%"
							r="8"
							fill="var(--mantine-color-orange-3)"
							className="animate-pulse"
						/>
						<circle
							cx="85%"
							cy="15%"
							r="12"
							fill="var(--mantine-color-teal-3)"
							className="animate-pulse"
							style={{ animationDelay: "1s" }}
						/>

						{/* Background glow (fixed gradient) */}
						<circle cx="50%" cy="50%" r="150" fill="url(#grad2)" />
					</svg>
				</Box>

				<Stack
					align="center"
					ta="center"
					mb="xl"
					style={{ position: "relative", zIndex: 1 }}
				>
					<Badge
						size="lg"
						variant="gradient"
						gradient={{ from: "blue", to: "cyan" }}
					>
						PRACTICAL LEARNING
					</Badge>
					<Title order={1} style={{ fontSize: "1.8rem" }}>
						Master Tech & Architectural Diagrams
					</Title>
					<Text size={"1.2em"} c="dimmed" maw={700}>
						Explore our comprehensive labs designed for both technical
						professionals and students. From certification prep to creative
						learning.
					</Text>
				</Stack>

				{/* <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}> */}
				{/* Card 1: Cloud Architecture */}
				{/* <FeatureCard
            icon={<IconCloud size={28} />}
            color="blue"
            title="Cloud Architecture"
            description="Prepare for technical exams and master architecture on major cloud platforms."
            badges={
              <>
                <Badge variant="outline" color="orange">AWS</Badge>
                <Badge variant="outline" color="blue">Azure</Badge>
                <Badge variant="outline" color="red">GCP</Badge>
              </>
            }
          /> */}

				{/* Card 2: DevOps & Containers */}
				{/* <FeatureCard
            icon={<IconBrandDocker size={28} />}
            color="cyan"
            title="DevOps & Containers"
            description="Hands-on labs for container orchestration and modern DevOps practices."
            badges={
              <>
                <Badge variant="outline" color="cyan">Docker</Badge>
                <Badge variant="outline" color="indigo">Kubernetes</Badge>
              </>
            }
          /> */}

				{/* Card 3: Education & Creativity */}
				{/* <FeatureCard
            icon={<IconSchool size={28} />}
            color="green"
            title="Interactive Education"
            description="Engaging diagram tests and quizzes suitable for schooling kids and learners."
            badges={
              <>
                <Badge variant="outline" color="green">Diagram Quiz</Badge>
                <Badge variant="outline" color="teal">Visual Learning</Badge>
              </>
            }
          /> */}
				{/* </div> */}
			</Paper>

			<Group justify="space-between" mb="xl">
				<Title order={3}>All Available Labs</Title>
				{isTrainer && (
					<Button
						onClick={() => router.push("/lab/create")}
						leftSection={<IconEdit size={16} />}
					>
						Create New Lab
					</Button>
				)}
			</Group>

			{/* Published Labs Section - Two Column Grid */}
			<Box mb="xl">
				{publishedLabs.length === 0 ? (
					<Text c="dimmed">No published labs available.</Text>
				) : (
					<>
						<div className="labs-grid">
							{publishedLabs.map((lab) => {
								const isPaid = lab.pricing?.purchaseType === "paid";
								const hasPreview = (lab.previewCount ?? 0) > 0;

								return (
									<Paper
										key={lab.id}
										shadow="xs"
										p="md"
										withBorder
										className="card-hover"
									>
										<Stack gap="xs">
											{/* Title row */}
											<Group
												justify="space-between"
												align="flex-start"
												wrap="nowrap"
											>
												<Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
													<Text fw={700} lineClamp={1}>
														{lab.name}
													</Text>
													{isPaid ? (
														<Badge color="orange" size="lg" variant="filled">
															{lab.pricing?.price
																? `₹${lab.pricing.price}`
																: "Paid"}
														</Badge>
													) : (
														<Badge color="teal" size="lg" variant="filled">
															Free
														</Badge>
													)}
													{lab.progress && lab.progress.percentage === 100 && (
														<Badge
															color="teal"
															size="sm"
															leftSection={<IconTrophy size={12} />}
														>
															Done
														</Badge>
													)}
												</Group>
												{hasPreview ? (
													<Button
														variant="filled"
														color="teal"
														size="xs"
														style={{ flexShrink: 0 }}
														leftSection={<IconPlayerPlay size={14} />}
														onClick={() =>
															router.push(`/labs/${lab.id}?tab=tests`)
														}
													>
														Try Now
													</Button>
												) : (
													<Button
														variant="filled"
														color="orange"
														size="xs"
														style={{ flexShrink: 0 }}
														leftSection={
															isPaid ? <IconLock size={14} /> : undefined
														}
														onClick={() =>
															router.push(`/labs/${lab.id}?tab=tests`)
														}
													>
														Access
													</Button>
												)}
											</Group>

											{/* Description */}
											{lab.description && (
												<Text size="sm" c="dimmed" lineClamp={2}>
													{labDescriptionText(lab.description)}
												</Text>
											)}

											{/* Category breadcrumb */}
											{(lab.labType ||
												lab.subCategory ||
												lab.nestedSubCategory) && (
												<Group gap="xs">
													{lab.labType && (
														<Badge variant="light" color="teal" size="md">
															{lab.labType}
														</Badge>
													)}
													{lab.subCategory && (
														<Badge variant="light" color="grape" size="md">
															{lab.subCategory}
														</Badge>
													)}
													{lab.nestedSubCategory && (
														<Badge variant="light" color="indigo" size="md">
															{lab.nestedSubCategory}
														</Badge>
													)}
												</Group>
											)}

											{/* Stats row */}
											<Group gap="xs">
												<Badge
													variant="light"
													color="blue"
													size="md"
													leftSection={<IconListCheck size={14} />}
												>
													{lab.questionCount || 0} Questions
												</Badge>
												<Badge
													variant="light"
													color="violet"
													size="md"
													leftSection={<IconSchema size={14} />}
												>
													{lab.diagramTestCount || 0} Diagrams
												</Badge>
												{isStudent &&
													lab.progress &&
													lab.progress.totalPages > 0 && (
														<Badge
															color={
																lab.progress.percentage === 100
																	? "teal"
																	: "blue"
															}
															size="md"
														>
															{lab.progress.percentage}%
														</Badge>
													)}
											</Group>
										</Stack>
									</Paper>
								);
							})}
						</div>
						{Math.ceil(publishedTotal / pageSize) > 1 && (
							<Group justify="center" mt="xl">
								<Pagination
									total={Math.ceil(publishedTotal / pageSize)}
									value={publishedPage}
									onChange={setPublishedPage}
								/>
							</Group>
						)}
					</>
				)}
			</Box>

			{/* Draft Labs Section - Only for trainers */}
			{isTrainer && (
				<Box>
					<Title order={4} mb="md">
						My Draft Labs
					</Title>
					{draftLabs.length === 0 ? (
						<Text c="dimmed">No draft labs. Create one to get started!</Text>
					) : (
						<>
							<div className="labs-grid">
								{draftLabs.map((lab) => (
									<Paper
										key={lab.id}
										shadow="xs"
										p="md"
										withBorder
										className="card-hover"
									>
										<Group justify="space-between" align="center" wrap="nowrap">
											<Box style={{ flex: 1, minWidth: 0 }}>
												<Group gap="xs" mb="xs">
													<Text fw={600} lineClamp={1}>
														{lab.name}
													</Text>
													<Badge color="orange" size="sm">
														{lab.status.toUpperCase()}
													</Badge>
												</Group>
												<Group gap="xs">
													<Badge
														variant="light"
														color="blue"
														size="sm"
														leftSection={<IconListCheck size={12} />}
													>
														{(lab as any).questionCount || 0} Questions
													</Badge>
													<Badge
														variant="light"
														color="violet"
														size="sm"
														leftSection={<IconSchema size={12} />}
													>
														{(lab as any).diagramTestCount || 0} Diagrams
													</Badge>
												</Group>
											</Box>
											<ActionIcon
												variant="subtle"
												color="blue"
												size="lg"
												onClick={() => router.push(`/labs/${lab.id}`)}
												title="Edit Lab"
											>
												<IconEdit size={20} />
											</ActionIcon>
										</Group>
									</Paper>
								))}
							</div>
							{Math.ceil(draftTotal / pageSize) > 1 && (
								<Group justify="center" mt="xl">
									<Pagination
										total={Math.ceil(draftTotal / pageSize)}
										value={draftPage}
										onChange={setDraftPage}
									/>
								</Group>
							)}
						</>
					)}
				</Box>
			)}
		</Container>
	);
};

export default LabsPage;
