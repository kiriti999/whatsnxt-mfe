// Shape Data Definitions for D3
export interface NodeType {
    id?: string;
    x?: number;
    y?: number;
    type: string; // 'rect', 'circle', 'path', 'group'
    label: string;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    strokeDashArray?: string;
    pathData?: string; // For 'path' type
    rx?: number; // Corner radius for rect
}

export const architecturalShapes: Record<string, Partial<NodeType>> = {
    Server: {
        type: "rect",
        label: "Server",
        width: 100,
        height: 60,
        fill: "#F5F5F5",
        stroke: "#333",
        strokeWidth: 2,
        rx: 4,
    },
    Database: {
        type: "database",
        label: "DB",
        width: 80,
        height: 80,
        fill: "#F5F5F5",
        stroke: "#333",
        strokeWidth: 2,
        // Rendered dynamically in DiagramEditor based on width/height
    },
    LoadBalancer: {
        type: "diamond",
        label: "LB",
        width: 80,
        height: 80,
        fill: "#E6E6FA",
        stroke: "#333",
        strokeWidth: 2,
        // Rendered dynamically in DiagramEditor based on width/height
    },
    Client: {
        type: "circle",
        label: "Client",
        width: 80,
        height: 80,
        fill: "#FFF0F5",
        stroke: "#333",
        strokeWidth: 2,
    },
    Firewall: {
        type: "rect",
        label: "Firewall",
        width: 60,
        height: 80,
        fill: "#FF6347",
        stroke: "#333",
        strokeWidth: 2,
        strokeDashArray: "5,2",
    },
    Cache: {
        type: "rect",
        label: "Cache",
        width: 80,
        height: 60,
        fill: "#E0FFFF",
        stroke: "#333",
        strokeWidth: 2,
        rx: 10,
    },
    Queue: {
        type: "rect",
        label: "Queue",
        width: 100,
        height: 50,
        fill: "#F0E68C",
        stroke: "#333",
        strokeWidth: 2,
    },
    Storage: {
        type: "path",
        label: "Storage",
        width: 80,
        height: 60,
        fill: "#D3D3D3",
        stroke: "#333",
        strokeWidth: 2,
        pathData: "M0,60 L0,10 Q40,-10 80,10 L80,60 Q40,80 0,60 Z",
    },
    Microservice: {
        type: "path",
        label: "Service",
        width: 80,
        height: 80,
        fill: "#98FB98",
        stroke: "#333",
        strokeWidth: 2,
        pathData: "M20,0 L60,0 L80,40 L60,80 L20,80 L0,40 Z", // Hexagon
    },
    Router: {
        type: "circle",
        label: "Router",
        width: 60,
        height: 60,
        fill: "#87CEFA",
        stroke: "#333",
        strokeWidth: 2,
        strokeDashArray: "2,2",
    },
    CDN: {
        type: "circle",
        label: "CDN",
        width: 90,
        height: 60,
        fill: "#FFD700",
        stroke: "#333",
        strokeWidth: 2,
    },
    Func: {
        type: "rect",
        label: "λ",
        width: 50,
        height: 50,
        fill: "#FF8C00",
        stroke: "#333",
        strokeWidth: 2,
        rx: 8,
    },
    Box: {
        type: "rect",
        label: "Box",
        width: 100,
        height: 100,
        fill: "#FFFFFF",
        stroke: "#333",
        strokeWidth: 2,
    },
    Group: {
        type: "group",
        label: "Group / VPC",
        width: 400,
        height: 300,
        fill: "transparent",
        stroke: "#333",
        strokeWidth: 2,
        rx: 5,
        strokeDashArray: "10,5",
    },
    Zone: {
        type: "zone",
        label: "Zone / Subnet",
        width: 300,
        height: 200,
        fill: "transparent",
        stroke: "#333",
        strokeWidth: 2,
        rx: 5,
        strokeDashArray: "5,5",
    },
    Kubernetes: {
        type: "path",
        label: "K8s",
        width: 80,
        height: 80,
        fill: "#326CE5",
        stroke: "#333",
        strokeWidth: 2,
        pathData: "M40,0 L75,20 L75,60 L40,80 L5,60 L5,20 Z", // Hexagon
    },
    Nextjs: {
        type: "rect",
        label: "Next.js",
        width: 80,
        height: 60,
        fill: "#000000",
        stroke: "#FFF",
        strokeWidth: 2,
        rx: 5,
    },
    React: {
        type: "circle",
        label: "React",
        width: 80,
        height: 60,
        fill: "#282c34",
        stroke: "#61DAFB",
        strokeWidth: 3,
    },
    Docker: {
        type: "path",
        label: "Docker",
        width: 80,
        height: 60,
        fill: "#2496ED",
        stroke: "#333",
        strokeWidth: 2,
        pathData:
            "M0,20 L80,20 L80,60 L0,60 Z M10,0 L30,0 L30,20 L10,20 Z M40,0 L60,0 L60,20 L40,20 Z",
    },
    Pool: {
        type: "pool",
        label: "Pool",
        width: 600,
        height: 300,
        fill: "transparent",
        stroke: "#333",
        strokeWidth: 2,
    },
    Heart: {
        type: "heart",
        label: "Love",
        width: 80,
        height: 80,
        fill: "#ff4d4d",
        stroke: "#c0392b",
        strokeWidth: 2,
    },
    Star: {
        type: "star",
        label: "Star",
        width: 80,
        height: 80,
        fill: "#ffeb3b",
        stroke: "#fbc02d",
        strokeWidth: 2,
    },
    Cloud: {
        type: "cloud",
        label: "Cloud",
        width: 100,
        height: 60,
        fill: "#87CEEB",
        stroke: "#333",
        strokeWidth: 2,
    },
};

export const createArchitecturalShapes = () => {
    return architecturalShapes;
};

// Function to jumble the graph for student mode
export const jumbleGraph = (graphJson: any) => {
    if (!graphJson) return graphJson;
    const jumbled = JSON.parse(JSON.stringify(graphJson));

    // Clear links - Student must reconstruct them
    jumbled.links = [];

    if (jumbled.nodes && jumbled.nodes.length > 0) {
        const nodes = jumbled.nodes;
        const count = nodes.length;

        // Viewport dimensions (keeping some padding)
        const VIEW_WIDTH = 900;
        const VIEW_HEIGHT = 600;
        const PADDING = 50;

        // Calculate grid dimensions
        // Try to maintain a nice aspect ratio (e.g., 4:3)
        const aspectRatio = VIEW_WIDTH / VIEW_HEIGHT;
        const cols = Math.ceil(Math.sqrt(count * aspectRatio));
        const rows = Math.ceil(count / cols);

        // Calculate cell size
        const cellWidth = (VIEW_WIDTH - PADDING * 2) / cols;
        const cellHeight = (VIEW_HEIGHT - PADDING * 2) / rows;

        // Shuffle indices to ensure random placement
        const indices = Array.from({ length: count }, (_, i) => i);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Container types that should maintain larger minimum sizes
        const containerTypes = [
            "pool",
            "group",
            "zone",
            "container",
            "namespace",
            "vpc",
            "node",
            "virtualnetwork",
        ];

        nodes.forEach((node: any, i: number) => {
            const index = indices[i];
            const col = index % cols;
            const row = Math.floor(index / cols);

            // Calculate center position of the cell
            const cellCenterX = PADDING + col * cellWidth + cellWidth / 2;
            const cellCenterY = PADDING + row * cellHeight + cellHeight / 2;

            // Determine if this is a container type - containers must maintain minimum sizes
            const isContainer = containerTypes.includes(
                node.type?.toLowerCase() || "",
            );

            // Set minimum sizes - larger for containers to remain recognizable
            const minWidth = isContainer ? 150 : 50;
            const minHeight = isContainer ? 100 : 40;

            // Optional: Resize large nodes if they exceed cell size (to prevent overlap)
            // But NEVER go below minimums
            const maxWidth = cellWidth * 0.9;
            const maxHeight = cellHeight * 0.9;

            // Enforce minimum sizes first, then limit to max if needed
            node.width = Math.max(minWidth, Math.min(node.width, maxWidth));
            node.height = Math.max(minHeight, Math.min(node.height, maxHeight));

            // Place node centered in cell
            node.x = cellCenterX - node.width / 2;
            node.y = cellCenterY - node.height / 2;

            // Ensures it is strictly within view
            node.x = Math.max(
                PADDING,
                Math.min(node.x, VIEW_WIDTH - PADDING - node.width),
            );
            node.y = Math.max(
                PADDING,
                Math.min(node.y, VIEW_HEIGHT - PADDING - node.height),
            );
        });
    }

    return jumbled;
};

/**
 * Check if a shape is inside a container based on position and dimensions
 */
const isShapeInsideContainer = (
    shape: any,
    container: any,
    tolerance: number = 5,
): boolean => {
    if (!shape || !container) return false;

    const shapeLeft = shape.x || 0;
    const shapeTop = shape.y || 0;
    const shapeRight = shapeLeft + (shape.width || 0);
    const shapeBottom = shapeTop + (shape.height || 0);

    const containerLeft = container.x || 0;
    const containerTop = container.y || 0;
    const containerRight = containerLeft + (container.width || 0);
    const containerBottom = containerTop + (container.height || 0);

    // Check if shape is inside container with tolerance
    return (
        shapeLeft >= containerLeft - tolerance &&
        shapeTop >= containerTop - tolerance &&
        shapeRight <= containerRight + tolerance &&
        shapeBottom <= containerBottom + tolerance
    );
};

/**
 * Build nesting relationships for all shapes
 * Returns a map of shape ID to container ID
 */
const buildNestingMap = (nodes: any[]): Map<string, string> => {
    const nestingMap = new Map<string, string>();

    // Container types that can contain other shapes
    const containerTypes = [
        "group",
        "zone",
        "vpc",
        "namespace",
        "node",
        "virtualnetwork",
    ];

    // Get all container shapes
    const containers = nodes.filter((n) =>
        containerTypes.includes(n.type?.toLowerCase() || ""),
    );

    // Sort containers by size (smaller containers first for nested containers)
    containers.sort((a, b) => {
        const areaA = (a.width || 0) * (a.height || 0);
        const areaB = (b.width || 0) * (b.height || 0);
        return areaA - areaB;
    });

    // For each non-container shape, find its container
    nodes.forEach((shape) => {
        // Skip containers themselves
        if (containerTypes.includes(shape.type?.toLowerCase() || "")) {
            return;
        }

        // Find the smallest container that contains this shape
        for (const container of containers) {
            if (container.id === shape.id) continue;

            if (isShapeInsideContainer(shape, container)) {
                nestingMap.set(shape.id, container.id);
                break; // Use the smallest (first) matching container
            }
        }
    });

    return nestingMap;
};

/**
 * Validate graph connections and nesting order
 * Enhanced to check both link connections and shape nesting
 */
export const validateGraph = (masterJson: any, studentJson: any) => {
    if (!masterJson || !studentJson) {
        return {
            score: 0,
            passed: false,
            details: "Missing data",
            linkScore: 0,
            nestingScore: 0,
        };
    }

    const masterLinks = masterJson.links || [];
    const studentLinks = studentJson.links || [];
    const masterNodes = masterJson.nodes || [];
    const studentNodes = studentJson.nodes || [];

    // ========== PART 1: Validate Link Connections ==========
    const masterConnections = new Set(
        // @ts-expect-error
        masterLinks.map((l) => {
            const s = typeof l.source === "object" ? l.source.id : l.source;
            const t = typeof l.target === "object" ? l.target.id : l.target;
            return `${s}-${t}`;
        }),
    );

    let correctLinks = 0;
    // @ts-expect-error
    studentLinks.forEach((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        const key = `${s}-${t}`;
        if (masterConnections.has(key)) {
            correctLinks++;
        }
    });

    const totalMasterLinks = masterLinks.length;
    const linkScore =
        totalMasterLinks > 0
            ? Math.round((correctLinks / totalMasterLinks) * 100)
            : 100;

    // ========== PART 2: Validate Nesting Order ==========
    const masterNestingMap = buildNestingMap(masterNodes);
    const studentNestingMap = buildNestingMap(studentNodes);

    let correctNesting = 0;
    const totalNesting = masterNestingMap.size;

    // Check if student has same nesting relationships as master
    masterNestingMap.forEach((containerId, shapeId) => {
        const studentContainerId = studentNestingMap.get(shapeId);

        // Find the container labels for better error reporting
        const masterContainer = masterNodes.find((n: any) => n.id === containerId);
        const studentContainer = studentNodes.find(
            (n: any) => n.id === studentContainerId,
        );
        const shape = masterNodes.find((n: any) => n.id === shapeId);

        if (studentContainerId === containerId) {
            correctNesting++;
        }
    });

    const nestingScore =
        totalNesting > 0 ? Math.round((correctNesting / totalNesting) * 100) : 100;

    // ========== PART 3: Calculate Overall Score ==========
    // If there's no nesting in master diagram, only use link score
    // Otherwise, weight both equally
    let overallScore: number;
    let details: string;

    if (totalNesting === 0) {
        // No nesting to validate, only links matter
        overallScore = linkScore;
        details = `Links: ${correctLinks}/${totalMasterLinks} correct`;
    } else if (totalMasterLinks === 0) {
        // No links to validate, only nesting matters
        overallScore = nestingScore;
        details = `Nesting: ${correctNesting}/${totalNesting} shapes in correct containers`;
    } else {
        // Both links and nesting matter - weight them equally
        overallScore = Math.round((linkScore + nestingScore) / 2);
        details = `Links: ${correctLinks}/${totalMasterLinks}, Nesting: ${correctNesting}/${totalNesting}`;
    }

    return {
        score: overallScore,
        passed: overallScore === 100,
        details,
        linkScore,
        nestingScore,
        correctLinks,
        totalLinks: totalMasterLinks,
        correctNesting,
        totalNesting,
    };
};

/**
 * Shape definition for architecture-specific shapes
 */
export interface ArchitectureShape {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
}

/**
 * Get architecture-specific shapes based on architecture type
 * @param architectureType - 'AWS', 'Kubernetes', or 'Generic'
 * @returns Array of architecture-specific shape definitions
 */
export function getArchitectureSpecificShapes(
    architectureType: string,
): ArchitectureShape[] {
    if (architectureType === "AWS") {
        return [
            { id: "ec2", name: "EC2", type: "rect", width: 80, height: 80 },
            { id: "lambda", name: "Lambda", type: "rect", width: 80, height: 80 },
            { id: "s3", name: "S3", type: "rect", width: 80, height: 70 },
            { id: "rds", name: "RDS", type: "database", width: 80, height: 80 },
            {
                id: "dynamodb",
                name: "DynamoDB",
                type: "database",
                width: 80,
                height: 80,
            },
            { id: "vpc", name: "VPC", type: "group", width: 500, height: 400 },
            { id: "elb", name: "ELB", type: "diamond", width: 80, height: 80 },
            {
                id: "cloudfront",
                name: "CloudFront",
                type: "circle",
                width: 80,
                height: 80,
            },
            { id: "iam", name: "IAM", type: "rect", width: 80, height: 60 },
        ];
    } else if (architectureType === "Kubernetes") {
        return [
            { id: "pod", name: "Pod", type: "rect", width: 80, height: 80 },
            {
                id: "deployment",
                name: "Deployment",
                type: "rect",
                width: 90,
                height: 90,
            },
            { id: "service", name: "Service", type: "circle", width: 80, height: 80 },
            {
                id: "ingress",
                name: "Ingress",
                type: "diamond",
                width: 80,
                height: 80,
            },
            {
                id: "persistentvolume",
                name: "PersistentVolume",
                type: "database",
                width: 80,
                height: 80,
            },
            {
                id: "configmap",
                name: "ConfigMap",
                type: "rect",
                width: 80,
                height: 60,
            },
            { id: "secret", name: "Secret", type: "rect", width: 80, height: 60 },
            {
                id: "namespace",
                name: "Namespace",
                type: "group",
                width: 500,
                height: 400,
            },
            { id: "node", name: "Node", type: "rect", width: 300, height: 250 },
        ];
    } else {
        // Generic architecture shapes with professional D3 rendering
        return [
            { id: "client", name: "Client", type: "rect", width: 80, height: 70 },
            { id: "server", name: "Server", type: "rect", width: 80, height: 90 },
            { id: "mobile", name: "Mobile", type: "rect", width: 60, height: 100 },
            { id: "router", name: "Router", type: "rect", width: 90, height: 70 },
            { id: "firewall", name: "Firewall", type: "rect", width: 80, height: 90 },
            {
                id: "database",
                name: "Database",
                type: "database",
                width: 80,
                height: 80,
            },
            { id: "cache", name: "Cache", type: "database", width: 80, height: 70 },
            {
                id: "loadbalancer",
                name: "Load Balancer",
                type: "diamond",
                width: 80,
                height: 80,
            },
            { id: "api", name: "API", type: "rect", width: 80, height: 60 },
        ];
    }
}
