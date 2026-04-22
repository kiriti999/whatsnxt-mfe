"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    ActionIcon,
    Badge,
    Box,
    Collapse,
    Flex,
    Group,
    Stack,
    Text,
    TextInput,
    Textarea,
    Select,
    Button,
} from "@mantine/core";
import {
    IconChevronDown,
    IconChevronRight,
    IconPlus,
    IconTrash,
    IconCode,
    IconEye,
} from "@tabler/icons-react";
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

const EMPTY_FIELD: ApiField = { name: "", type: "string", required: false, description: "" };

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

function extractJsonObject(raw: string): string {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return raw.substring(firstBrace, lastBrace + 1);
    }
    return raw.trim();
}

function repairJson(raw: string): string {
    let cleaned = raw.replace(/^\uFEFF/, "").trim();
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escape = false;

    for (const ch of cleaned) {
        if (escape) { escape = false; continue; }
        if (ch === "\\") { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === "{") openBraces++;
        if (ch === "}") openBraces--;
        if (ch === "[") openBrackets++;
        if (ch === "]") openBrackets--;
    }

    while (openBrackets > 0) { cleaned += "]"; openBrackets--; }
    while (openBraces > 0) { cleaned += "}"; openBraces--; }

    return cleaned;
}

function tryParseJson(raw: string): Record<string, unknown> | null {
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.log("tryParseJson :: error:", (e as Error).message, ":: last 50:", raw.slice(-50));
        return null;
    }
}

function normalizeSpec(parsed: Record<string, unknown>): ApiSpec {
    return {
        title: typeof parsed.title === "string" ? parsed.title : "",
        basePath: typeof parsed.basePath === "string" ? parsed.basePath : "/api",
        endpoints: Array.isArray(parsed.endpoints) ? (parsed.endpoints as ApiEndpoint[]) : [],
    };
}

// biome-ignore lint/suspicious/noExplicitAny: value may be string or object at runtime
function parseApiSpec(raw: any): ApiSpec {
    if (typeof raw === "object" && raw !== null) {
        if (raw.endpoints) return normalizeSpec(raw);
        return createEmptySpec();
    }

    if (typeof raw !== "string" || !raw.trim()) return createEmptySpec();

    const directParse = tryParseJson(raw.trim());
    if (directParse?.endpoints) return normalizeSpec(directParse);

    const extracted = extractJsonObject(raw);
    const extractedParse = tryParseJson(extracted);
    if (extractedParse?.endpoints) return normalizeSpec(extractedParse);

    const repaired = repairJson(extracted);
    const repairedParse = tryParseJson(repaired);
    if (repairedParse?.endpoints) return normalizeSpec(repairedParse);

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
                data={["string", "number", "integer", "boolean", "object", "array", "timestamp"]}
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
                onClick={readOnly ? undefined : () => onUpdate({ ...field, required: !field.required })}
                className={classes.requiredBadge}
            >
                {field.required ? "required" : "optional"}
            </Badge>
            <TextInput
                size="xs"
                placeholder="description"
                value={field.description}
                onChange={(e) => onUpdate({ ...field, description: e.currentTarget.value })}
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
    index,
    onUpdate,
    onRemove,
    readOnly = false,
}: {
    endpoint: ApiEndpoint;
    index: number;
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
            onUpdate({ ...endpoint, [section]: endpoint[section].filter((_, i) => i !== idx) });
        },
        [endpoint, onUpdate],
    );

    const addField = useCallback(
        (section: "requestBody" | "responseBody") => {
            onUpdate({ ...endpoint, [section]: [...endpoint[section], { ...EMPTY_FIELD }] });
        },
        [endpoint, onUpdate],
    );

    return (
        <Box className={classes.endpointCard} data-method={endpoint.method.toLowerCase()}>
            <Flex
                className={classes.endpointHeader}
                onClick={() => setExpanded((p) => !p)}
                data-method={endpoint.method.toLowerCase()}
            >
                <Group gap="sm">
                    {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    <Badge size="lg" color={methodColor} variant="filled" className={classes.methodBadge}>
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
                            onChange={(e) => onUpdate({ ...endpoint, path: e.currentTarget.value })}
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
                                    responseStatus: Number.parseInt(e.currentTarget.value, 10) || 200,
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
                        onChange={(e) => onUpdate({ ...endpoint, summary: e.currentTarget.value })}
                        readOnly={readOnly}
                    />
                    <Textarea
                        label="Description"
                        size="xs"
                        autosize
                        minRows={2}
                        value={endpoint.description}
                        onChange={(e) => onUpdate({ ...endpoint, description: e.currentTarget.value })}
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
                                    key={fi}
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
                                key={fi}
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

export function ApiDesignEditor({ value, onChange, readOnly = false }: ApiDesignEditorProps) {
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
            updateSpec({ ...spec, endpoints: spec.endpoints.filter((_, i) => i !== index) });
        },
        [spec, updateSpec],
    );

    const addEndpoint = useCallback(() => {
        updateSpec({ ...spec, endpoints: [...spec.endpoints, { ...EMPTY_ENDPOINT }] });
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
                            {spec.endpoints.length} endpoint{spec.endpoints.length !== 1 ? "s" : ""}
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
                            onChange={(e) => updateSpec({ ...spec, title: e.currentTarget.value })}
                            placeholder="e.g., URL Shortener API"
                            readOnly={readOnly}
                            style={{ flex: 1 }}
                        />
                        <TextInput
                            label="Base Path"
                            size="xs"
                            value={spec.basePath}
                            onChange={(e) => updateSpec({ ...spec, basePath: e.currentTarget.value })}
                            placeholder="/api"
                            readOnly={readOnly}
                            w={120}
                        />
                    </Flex>

                    {spec.endpoints.map((ep, idx) => (
                        <EndpointCard
                            key={idx}
                            endpoint={ep}
                            index={idx}
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
