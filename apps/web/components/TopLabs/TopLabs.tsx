"use client";

import {
	Box,
	Button,
	Container,
	Divider,
	Group,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
	UnstyledButton,
} from "@mantine/core";
import {
	IconArrowRight,
	IconCloud,
	IconCode,
	IconDatabase,
	IconFlask,
	IconListCheck,
	IconNetwork,
	IconSchema,
	IconShield,
	IconTerminal2,
} from "@tabler/icons-react";
import type { Lab } from "@whatsnxt/types";
import { useRouter } from "next/navigation";
import { labDescriptionText } from "@/utils/lab-utils";
import styles from "./TopLabs.module.css";

interface LabWithCounts extends Lab {
	questionCount?: number;
	diagramTestCount?: number;
}

type LabConfig = {
	icon: React.ReactNode;
	color: string;
	topClass: string;
	textColor: string;
};

const LAB_TYPE_CONFIG: Record<string, LabConfig> = {
	cloud: {
		icon: <IconCloud size={16} />,
		color: "cyan",
		topClass: styles.cardTopCyan,
		textColor: "var(--mantine-color-cyan-6)",
	},
	security: {
		icon: <IconShield size={16} />,
		color: "red",
		topClass: styles.cardTopRed,
		textColor: "var(--mantine-color-red-6)",
	},
	networking: {
		icon: <IconNetwork size={16} />,
		color: "grape",
		topClass: styles.cardTopGrape,
		textColor: "var(--mantine-color-grape-6)",
	},
	programming: {
		icon: <IconCode size={16} />,
		color: "indigo",
		topClass: styles.cardTopIndigo,
		textColor: "var(--mantine-color-indigo-6)",
	},
	architecture: {
		icon: <IconTerminal2 size={16} />,
		color: "violet",
		topClass: styles.cardTopViolet,
		textColor: "var(--mantine-color-violet-6)",
	},
	database: {
		icon: <IconDatabase size={16} />,
		color: "orange",
		topClass: styles.cardTopOrange,
		textColor: "var(--mantine-color-orange-6)",
	},
};

const getLabConfig = (labType: string): LabConfig =>
	LAB_TYPE_CONFIG[labType?.toLowerCase()] ?? {
		icon: <IconFlask size={16} />,
		color: "teal",
		topClass: styles.cardTopTeal,
		textColor: "var(--mantine-color-teal-6)",
	};

interface TopLabsProps {
	labs: LabWithCounts[];
}

const TopLabs = ({ labs }: TopLabsProps) => {
	const router = useRouter();

	if (!labs || labs.length === 0) return null;

	return (
		<Box className={styles.section} my="4.5rem">
			<Container size="xl">
				{/* Section header */}
				{/* Mobile: all centred, View all directly under heading */}
				<Stack align="center" gap={4} mb="xl" hiddenFrom="sm">
					<Group gap={6}>
						<IconFlask size={12} color="var(--mantine-color-orange-6)" />
						<Text
							size="xs"
							fw={700}
							tt="uppercase"
							c="orange"
							style={{ letterSpacing: "0.08em" }}
						>
							Hands-on Practice
						</Text>
					</Group>
					<Title order={5} ta="center" fw={700}>
						Interactive Labs
					</Title>
					<Button
						component="a"
						href="/labs"
						variant="subtle"
						color="orange"
						size="xs"
						rightSection={<IconArrowRight size={13} />}
					>
						View all
					</Button>
				</Stack>

				{/* Desktop: centred title with View all pinned right */}
				<Box pos="relative" mb="xl" visibleFrom="sm">
					<Stack align="center" gap={2}>
						<Group gap={6}>
							<IconFlask size={12} color="var(--mantine-color-orange-6)" />
							<Text
								size="xs"
								fw={700}
								tt="uppercase"
								c="orange"
								style={{ letterSpacing: "0.08em" }}
							>
								Hands-on Practice
							</Text>
						</Group>
						<Title order={5} ta="center" fw={700}>
							Interactive Labs
						</Title>
					</Stack>
					<Button
						pos="absolute"
						right={0}
						top="50%"
						style={{ transform: "translateY(-50%)" }}
						component="a"
						href="/labs"
						variant="subtle"
						color="orange"
						size="xs"
						rightSection={<IconArrowRight size={13} />}
					>
						View all
					</Button>
				</Box>

				{/* Card grid */}
				<SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }} spacing="md">
					{labs.map((lab) => {
						const { icon, color, topClass, textColor } = getLabConfig(
							lab.labType,
						);
						const hasQuestions = (lab.questionCount ?? 0) > 0;
						const hasDiagrams = (lab.diagramTestCount ?? 0) > 0;
						const hasStats = hasQuestions || hasDiagrams;

						return (
							<UnstyledButton
								key={lab.id}
								className={styles.card}
								onClick={() => router.push(`/labs/${lab.id}`)}
							>
								{/* Colored top bar */}
								<Group
									className={`${styles.cardTop} ${topClass}`}
									gap="xs"
									wrap="nowrap"
									align="center"
								>
									<ThemeIcon
										className={styles.cardTopIcon}
										size={28}
										radius="sm"
										variant="light"
										color={color}
									>
										{icon}
									</ThemeIcon>
									<Text
										className={styles.cardTopLabel}
										size="xs"
										fw={700}
										tt="uppercase"
										lineClamp={2}
										style={{ color: textColor }}
									>
										{lab.labType || "Lab"}
									</Text>
								</Group>

								{/* Lab name + description */}
								<Box className={styles.cardBody}>
									<Text className={styles.cardName}>{lab.name}</Text>
									{lab.description && (
										<Text size="xs" c="dimmed" lineClamp={2} mt={4}>
											{labDescriptionText(lab.description)}
										</Text>
									)}
									{lab.subCategory && (
										<Text size="xs" c={color} fw={600} mt={6}>
											{lab.subCategory}
										</Text>
									)}
								</Box>

								{/* Footer */}
								<Stack gap="xs" className={styles.cardFooter}>
									<Group gap={6} wrap="nowrap" align="center">
										{hasQuestions && (
											<div className={styles.footerStat}>
												<IconListCheck
													size={13}
													color="var(--mantine-color-blue-5)"
												/>
												<Text size="xs" fw={600} component="span">
													{lab.questionCount}
												</Text>
												<Text size="xs" c="dimmed" component="span">
													MCQs
												</Text>
											</div>
										)}
										{hasQuestions && hasDiagrams && (
											<Divider orientation="vertical" />
										)}
										{hasDiagrams && (
											<div className={styles.footerStat}>
												<IconSchema
													size={13}
													color="var(--mantine-color-violet-5)"
												/>
												<Text size="xs" fw={600} component="span">
													{lab.diagramTestCount}
												</Text>
												<Text size="xs" c="dimmed" component="span">
													Diagrams
												</Text>
											</div>
										)}
										{!hasStats && (
											<Text size="xs" c="dimmed">
												Practice lab
											</Text>
										)}
									</Group>
								</Stack>
							</UnstyledButton>
						);
					})}
				</SimpleGrid>
			</Container>
		</Box>
	);
};

export default TopLabs;
