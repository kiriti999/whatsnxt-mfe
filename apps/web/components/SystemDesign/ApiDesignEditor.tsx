"use client";

import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Collapse,
	Flex,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from "@mantine/core";
import {
	IconChevronDown,
	IconChevronRight,
	IconCode,
	IconEye,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import classes from "./ApiDesignEditor.module.css";

interface ApiField {
	name: string;
	type: string;
	required: boolean;
	description: string;
}

interface ApiEndpoint {
	method: string;
	path: string;
	summary: string;
	description: string;
	requestBody: ApiField[];
	responseBody: ApiField[];
	responseStatus: number;
	queryParameters?: ApiField[];
	pathParameters?: ApiField[];
}

interface ApiSpec {
	title: string;
	basePath: string;
	endpoints: ApiEndpoint[];
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<string, string> = {
	GET: "blue",
	POST: "green",
	PUT: "orange",
	PATCH: "yellow",
	DELETE: "red",
};

const EMPTY_FIELD: ApiField = {
	name: "",
	type: "string",
	required: false,
	description: "",
};

const EMPTY_ENDPOINT: ApiEndpoint = {
	method: "GET",
	path: "/api/",
	summary: "",
	description: "",
	requestBody: [],
	responseBody: [],
	responseStatus: 200,
};

function createEmptySpec(): ApiSpec {
	return { title: "", basePath: "/api", endpoints: [] };
}

/** Models often wrap JSON in ```json fences despite "raw JSON only" prompts. */
function stripJsonMarkdownFences(raw: string): string {
	let s = raw.replace(/^\uFEFF/, "").trim();
	s = s.replace(/^```(?:json)?\s*\n?/i, "");
	s = s.replace(/\n?```\s*$/i, "");
	return s.trim();
}

/**
 * First complete `{ ... }` from start index, respecting JSON strings so `}` inside
 * descriptions does not truncate the object (unlike naive lastIndexOf("}")).
 */
function sliceFirstBalancedJsonObject(s: string, start: number): string | null {
	let depth = 0;
	let inStr = false;
	let esc = false;
	for (let i = start; i < s.length; i++) {
		const ch = s[i];
		if (esc) {
			esc = false;
			continue;
		}
		if (inStr) {
			if (ch === "\\") {
				esc = true;
				continue;
			}
			if (ch === '"') inStr = false;
			continue;
		}
		if (ch === '"') {
			inStr = true;
			continue;
		}
		if (ch === "{") depth++;
		if (ch === "}") {
			depth--;
			if (depth === 0) return s.slice(start, i + 1);
		}
	}
	return null;
}

function extractJsonObject(raw: string): string {
	const stripped = stripJsonMarkdownFences(raw);
	const start = stripped.indexOf("{");
	if (start === -1) return stripped;
	const balanced = sliceFirstBalancedJsonObject(stripped, start);
	if (balanced) return balanced;
	const lastBrace = stripped.lastIndexOf("}");
	if (lastBrace > start) {
		return stripped.slice(start, lastBrace + 1);
	}
	return stripped.slice(start);
}

function repairJson(raw: string): string {
	let cleaned = raw.replace(/^\uFEFF/, "").trim();
	cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

	let openBraces = 0;
	let openBrackets = 0;
	let inString = false;
	let escNext = false;

	for (const ch of cleaned) {
		if (escNext) {
			escNext = false;
			continue;
		}
		if (ch === "\\") {
			escNext = true;
			continue;
		}
		if (ch === '"') {
			inString = !inString;
			continue;
		}
		if (inString) continue;
		if (ch === "{") openBraces++;
		if (ch === "}") openBraces--;
		if (ch === "[") openBrackets++;
		if (ch === "]") openBrackets--;
	}

	while (openBrackets > 0) {
		cleaned += "]";
		openBrackets--;
	}
	while (openBraces > 0) {
		cleaned += "}";
		openBraces--;
	}

	return cleaned;
}

function tryParseJson(raw: string): Record<string, unknown> | null {
	try {
		return JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function normalizeSpec(parsed: Record<string, unknown>): ApiSpec {
	const endpoints = Array.isArray(parsed.endpoints)
		? (parsed.endpoints as ApiEndpoint[])
		: [];
	return {
		title: typeof parsed.title === "string" ? parsed.title : "",
		basePath: typeof parsed.basePath === "string" ? parsed.basePath : "/api",
		endpoints,
	};
}

// biome-ignore lint/suspicious/noExplicitAny: value may be string or object at runtime
function parseApiSpec(raw: any): ApiSpec {
	if (typeof raw === "object" && raw !== null) {
		if (raw.endpoints) return normalizeSpec(raw);
		return createEmptySpec();
	}

	if (typeof raw !== "string" || !raw.trim()) return createEmptySpec();

	const trimmed = raw.trim();
	const stripped = stripJsonMarkdownFences(trimmed);
	const directParse = tryParseJson(stripped);
	if (directParse && Array.isArray(directParse.endpoints)) {
		return normalizeSpec(directParse);
	}

	const extracted = extractJsonObject(trimmed);
	const extractedParse = tryParseJson(extracted);
	if (extractedParse && Array.isArray(extractedParse.endpoints)) {
		return normalizeSpec(extractedParse);
	}

	const repaired = repairJson(extracted);
	const repairedParse = tryParseJson(repaired);
	if (repairedParse && Array.isArray(repairedParse.endpoints)) {
		return normalizeSpec(repairedParse);
	}

	return createEmptySpec();
}

function FieldRow({
	field,
	onUpdate,
	onRemove,
	readOnly = false,
}: {
	field: ApiField;
	onUpdate: (f: ApiField) => void;
	onRemove: () => void;
	readOnly?: boolean;
}) {
	return (
		<Flex gap="xs" align="center" className={classes.fieldRow}>
			<TextInput
				size="xs"
				placeholder="name"
				value={field.name}
				onChange={(e) => onUpdate({ ...field, name: e.currentTarget.value })}
				className={classes.fieldName}
				readOnly={readOnly}
			/>
			<Select
				size="xs"
				data={[
					"string",
					"number",
					"integer",
					"boolean",
					"object",
					"array",
					"timestamp",
				]}
				value={field.type}
				onChange={(v) => onUpdate({ ...field, type: v || "string" })}
				className={classes.fieldType}
				allowDeselect={false}
				readOnly={readOnly}
			/>
			<Badge
				size="sm"
				variant={field.required ? "filled" : "outline"}
				color={field.required ? "red" : "gray"}
				onClick={
					readOnly
						? undefined
						: () => onUpdate({ ...field, required: !field.required })
				}
				className={classes.requiredBadge}
			>
				{field.required ? "required" : "optional"}
			</Badge>
			<TextInput
				size="xs"
				placeholder="description"
				value={field.description}
				onChange={(e) =>
					onUpdate({ ...field, description: e.currentTarget.value })
				}
				className={classes.fieldDesc}
				readOnly={readOnly}
			/>
			{!readOnly && (
				<ActionIcon size="sm" variant="subtle" color="red" onClick={onRemove}>
					<IconTrash size={14} />
				</ActionIcon>
			)}
		</Flex>
	);
}

function EndpointCard({
	endpoint,
	onUpdate,
	onRemove,
	readOnly = false,
}: {
	endpoint: ApiEndpoint;
	onUpdate: (ep: ApiEndpoint) => void;
	onRemove: () => void;
	readOnly?: boolean;
}) {
	const [expanded, setExpanded] = useState(false);
	const methodColor = METHOD_COLORS[endpoint.method] || "gray";

	const updateField = useCallback(
		(section: "requestBody" | "responseBody", idx: number, field: ApiField) => {
			const updated = [...endpoint[section]];
			updated[idx] = field;
			onUpdate({ ...endpoint, [section]: updated });
		},
		[endpoint, onUpdate],
	);

	const removeField = useCallback(
		(section: "requestBody" | "responseBody", idx: number) => {
			onUpdate({
				...endpoint,
				[section]: endpoint[section].filter((_, i) => i !== idx),
			});
		},
		[endpoint, onUpdate],
	);

	const addField = useCallback(
		(section: "requestBody" | "responseBody") => {
			onUpdate({
				...endpoint,
				[section]: [...endpoint[section], { ...EMPTY_FIELD }],
			});
		},
		[endpoint, onUpdate],
	);

	return (
		<Box
			className={classes.endpointCard}
			data-method={endpoint.method.toLowerCase()}
		>
			<Flex
				className={classes.endpointHeader}
				onClick={() => setExpanded((p) => !p)}
				data-method={endpoint.method.toLowerCase()}
			>
				<Group gap="sm">
					{expanded ? (
						<IconChevronDown size={16} />
					) : (
						<IconChevronRight size={16} />
					)}
					<Badge
						size="lg"
						color={methodColor}
						variant="filled"
						className={classes.methodBadge}
					>
						{endpoint.method}
					</Badge>
					<Text size="sm" fw={600} className={classes.pathText}>
						{endpoint.path}
					</Text>
				</Group>
				<Group gap="sm">
					<Text size="xs" c="dimmed" className={classes.summaryText}>
						{endpoint.summary}
					</Text>
					{!readOnly && (
						<ActionIcon
							size="sm"
							variant="subtle"
							color="red"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
						>
							<IconTrash size={14} />
						</ActionIcon>
					)}
				</Group>
			</Flex>

			<Collapse in={expanded}>
				<Stack gap="sm" className={classes.endpointBody}>
					<Flex gap="xs" align="flex-end">
						<Select
							label="Method"
							size="xs"
							data={HTTP_METHODS}
							value={endpoint.method}
							onChange={(v) => onUpdate({ ...endpoint, method: v || "GET" })}
							allowDeselect={false}
							w={100}
							readOnly={readOnly}
						/>
						<TextInput
							label="Path"
							size="xs"
							value={endpoint.path}
							onChange={(e) =>
								onUpdate({ ...endpoint, path: e.currentTarget.value })
							}
							style={{ flex: 1 }}
							readOnly={readOnly}
						/>
						<TextInput
							label="Status"
							size="xs"
							value={String(endpoint.responseStatus)}
							onChange={(e) =>
								onUpdate({
									...endpoint,
									responseStatus:
										Number.parseInt(e.currentTarget.value, 10) || 200,
								})
							}
							w={70}
							readOnly={readOnly}
						/>
					</Flex>
					<TextInput
						label="Summary"
						size="xs"
						value={endpoint.summary}
						onChange={(e) =>
							onUpdate({ ...endpoint, summary: e.currentTarget.value })
						}
						readOnly={readOnly}
					/>
					<Textarea
						label="Description"
						size="xs"
						autosize
						minRows={2}
						value={endpoint.description}
						onChange={(e) =>
							onUpdate({ ...endpoint, description: e.currentTarget.value })
						}
						readOnly={readOnly}
					/>

					{/* Request Body */}
					{["POST", "PUT", "PATCH"].includes(endpoint.method) && (
						<Box className={classes.fieldSection}>
							<Group gap="xs" mb={4}>
								<Text size="xs" fw={600}>
									Request Body
								</Text>
								{!readOnly && (
									<ActionIcon
										size="xs"
										variant="subtle"
										color="blue"
										onClick={() => addField("requestBody")}
									>
										<IconPlus size={12} />
									</ActionIcon>
								)}
							</Group>
							{endpoint.requestBody.length === 0 && (
								<Text size="xs" c="dimmed" fs="italic">
									No request body fields
								</Text>
							)}
							{endpoint.requestBody.map((field, fi) => (
								<FieldRow
									key={`req-${endpoint.path}-${field.name}-${fi}`}
									field={field}
									onUpdate={(f) => updateField("requestBody", fi, f)}
									onRemove={() => removeField("requestBody", fi)}
									readOnly={readOnly}
								/>
							))}
						</Box>
					)}

					{/* Response Body */}
					<Box className={classes.fieldSection}>
						<Group gap="xs" mb={4}>
							<Text size="xs" fw={600}>
								Response ({endpoint.responseStatus})
							</Text>
							{!readOnly && (
								<ActionIcon
									size="xs"
									variant="subtle"
									color="blue"
									onClick={() => addField("responseBody")}
								>
									<IconPlus size={12} />
								</ActionIcon>
							)}
						</Group>
						{endpoint.responseBody.length === 0 && (
							<Text size="xs" c="dimmed" fs="italic">
								No response body fields
							</Text>
						)}
						{endpoint.responseBody.map((field, fi) => (
							<FieldRow
								key={`res-${endpoint.path}-${field.name}-${fi}`}
								field={field}
								onUpdate={(f) => updateField("responseBody", fi, f)}
								onRemove={() => removeField("responseBody", fi)}
								readOnly={readOnly}
							/>
						))}
					</Box>
				</Stack>
			</Collapse>
		</Box>
	);
}

interface ApiDesignEditorProps {
	value: string;
	onChange: (val: string) => void;
	readOnly?: boolean;
}

export function ApiDesignEditor({
	value,
	onChange,
	readOnly = false,
}: ApiDesignEditorProps) {
	const [viewMode, setViewMode] = useState<"visual" | "json">("visual");
	const spec = useMemo(() => parseApiSpec(value), [value]);

	const updateSpec = useCallback(
		(updated: ApiSpec) => {
			onChange(JSON.stringify(updated, null, 2));
		},
		[onChange],
	);

	const updateEndpoint = useCallback(
		(index: number, ep: ApiEndpoint) => {
			const endpoints = [...spec.endpoints];
			endpoints[index] = ep;
			updateSpec({ ...spec, endpoints });
		},
		[spec, updateSpec],
	);

	const removeEndpoint = useCallback(
		(index: number) => {
			updateSpec({
				...spec,
				endpoints: spec.endpoints.filter((_, i) => i !== index),
			});
		},
		[spec, updateSpec],
	);

	const addEndpoint = useCallback(() => {
		updateSpec({
			...spec,
			endpoints: [...spec.endpoints, { ...EMPTY_ENDPOINT }],
		});
	}, [spec, updateSpec]);

	return (
		<Box className={classes.apiEditor}>
			<Flex justify="space-between" align="center" mb="sm">
				<Group gap="xs">
					<Text size="sm" fw={600} className={classes.swaggerTitle}>
						API Specification
					</Text>
					{spec.endpoints.length > 0 && (
						<Badge size="sm" variant="light" color="blue">
							{spec.endpoints.length} endpoint
							{spec.endpoints.length !== 1 ? "s" : ""}
						</Badge>
					)}
				</Group>
				{!readOnly && (
					<Group gap={4}>
						<ActionIcon
							size="sm"
							variant={viewMode === "visual" ? "filled" : "subtle"}
							color="blue"
							onClick={() => setViewMode("visual")}
							title="Visual editor"
						>
							<IconEye size={14} />
						</ActionIcon>
						<ActionIcon
							size="sm"
							variant={viewMode === "json" ? "filled" : "subtle"}
							color="blue"
							onClick={() => setViewMode("json")}
							title="JSON editor"
						>
							<IconCode size={14} />
						</ActionIcon>
					</Group>
				)}
			</Flex>

			{viewMode === "json" && !readOnly ? (
				<Textarea
					value={value}
					onChange={(e) => onChange(e.currentTarget.value)}
					autosize
					minRows={10}
					maxRows={30}
					className={classes.jsonEditor}
					styles={{ input: { fontFamily: "monospace", fontSize: 13 } }}
				/>
			) : (
				<Stack gap="xs">
					<Flex gap="xs" align="flex-end" mb="xs">
						<TextInput
							label="API Title"
							size="xs"
							value={spec.title}
							onChange={(e) =>
								updateSpec({ ...spec, title: e.currentTarget.value })
							}
							placeholder="e.g., URL Shortener API"
							readOnly={readOnly}
							style={{ flex: 1 }}
						/>
						<TextInput
							label="Base Path"
							size="xs"
							value={spec.basePath}
							onChange={(e) =>
								updateSpec({ ...spec, basePath: e.currentTarget.value })
							}
							placeholder="/api"
							readOnly={readOnly}
							w={120}
						/>
					</Flex>

					{spec.endpoints.map((ep, idx) => (
						<EndpointCard
							key={`${ep.method}-${ep.path}-${idx}`}
							endpoint={ep}
							onUpdate={(updated) => updateEndpoint(idx, updated)}
							onRemove={() => removeEndpoint(idx)}
							readOnly={readOnly}
						/>
					))}

					{!readOnly && (
						<Button
							variant="light"
							color="blue"
							size="xs"
							leftSection={<IconPlus size={14} />}
							onClick={addEndpoint}
							className={classes.addEndpointBtn}
						>
							Add Endpoint
						</Button>
					)}
				</Stack>
			)}
		</Box>
	);
}
