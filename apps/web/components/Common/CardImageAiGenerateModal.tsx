"use client";

import {
	Box,
	Button,
	Flex,
	Group,
	Paper,
	SegmentedControl,
	SimpleGrid,
	Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconLayoutGrid, IconSparkles, IconWand } from "@tabler/icons-react";
import {
	CARD_IMAGE_GENERATION_MODE,
	CARD_IMAGE_VISUAL_TYPES,
} from "@whatsnxt/constants";
import React from "react";
import styles from "./CardImageAiGenerateModal.module.css";

export type CardImageAiGenerateOptions = {
	imageMode: "auto" | "manual";
	visualType?: string;
};

export type OpenCardImageAiModalParams = {
	getTitle: () => string | null | undefined;
	missingTitleMessage: string;
	onGenerate: (opts: CardImageAiGenerateOptions) => void | Promise<void>;
};

function ModalBody({ getTitle, missingTitleMessage, onGenerate }: OpenCardImageAiModalParams) {
	const [mode, setMode] = React.useState<"auto" | "manual">(CARD_IMAGE_GENERATION_MODE.AUTO);
	const [visualType, setVisualType] = React.useState<string>(
		CARD_IMAGE_VISUAL_TYPES[0]?.id ?? "flat-gradients",
	);

	const handleGenerate = async () => {
		const title = getTitle()?.trim();
		if (!title) {
			notifications.show({
				color: "orange",
				title: "Missing title",
				message: missingTitleMessage,
			});
			return;
		}

		modals.closeAll();
		await onGenerate({
			imageMode: mode,
			visualType: mode === CARD_IMAGE_GENERATION_MODE.MANUAL ? visualType : undefined,
		});
	};

	return (
		<Box>
			<Text size="sm" c="dimmed" mb="md">
				AI Auto picks the best look for your title. Choose Type locks a specific visual style.
			</Text>

			<SegmentedControl
				value={mode}
				onChange={(v) => setMode(v as "auto" | "manual")}
				fullWidth
				data={[
					{
						value: CARD_IMAGE_GENERATION_MODE.AUTO,
						label: (
							<Flex align="center" justify="center" gap={6}>
								<IconWand size={16} />
								<span>AI Auto</span>
							</Flex>
						),
					},
					{
						value: CARD_IMAGE_GENERATION_MODE.MANUAL,
						label: (
							<Flex align="center" justify="center" gap={6}>
								<IconLayoutGrid size={16} />
								<span>Choose Type</span>
							</Flex>
						),
					},
				]}
				mb="md"
			/>

			{mode === CARD_IMAGE_GENERATION_MODE.AUTO && (
				<Paper p="md" withBorder radius="md" mb="md">
					<Flex align="center" gap="sm">
						<IconSparkles size={20} color="var(--mantine-color-violet-6)" />
						<Box>
							<Text size="sm" fw={600}>
								Best style for your topic
							</Text>
							<Text size="xs" c="dimmed">
								The model selects composition and palette from your title alone.
							</Text>
						</Box>
					</Flex>
				</Paper>
			)}

			{mode === CARD_IMAGE_GENERATION_MODE.MANUAL && (
				<Box mb="md">
					<Text size="sm" fw={500} mb="xs">
						Visual style
					</Text>
					<SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
						{CARD_IMAGE_VISUAL_TYPES.map((t) => {
							const selected = visualType === t.id;
							return (
								<Paper
									key={t.id}
									withBorder
									p="xs"
									className={`${styles.typeCard} ${selected ? styles.typeCardSelected : ""}`}
									onClick={() => setVisualType(t.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											setVisualType(t.id);
										}
									}}
									tabIndex={0}
									role="button"
									aria-pressed={selected}
									aria-label={t.label}
								>
									<Text className={styles.typeLabel}>{t.label}</Text>
								</Paper>
							);
						})}
					</SimpleGrid>
				</Box>
			)}

			<Group justify="flex-end" mt="md">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button onClick={() => void handleGenerate()}>Generate</Button>
			</Group>
		</Box>
	);
}

export function openCardImageAiGenerateModal(params: OpenCardImageAiModalParams): void {
	modals.open({
		title: "Generate image with AI",
		centered: true,
		children: <ModalBody {...params} />,
	});
}
