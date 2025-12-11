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
    Server: { type: 'rect', label: 'Server', width: 100, height: 60, fill: '#F5F5F5', stroke: '#333', strokeWidth: 2, rx: 4 },
    Database: {
        type: 'database', label: 'DB', width: 80, height: 80, fill: '#F5F5F5', stroke: '#333', strokeWidth: 2,
        // Rendered dynamically in DiagramEditor based on width/height
    },
    LoadBalancer: {
        type: 'diamond', label: 'LB', width: 80, height: 80, fill: '#E6E6FA', stroke: '#333', strokeWidth: 2,
        // Rendered dynamically in DiagramEditor based on width/height
    },
    Client: { type: 'circle', label: 'Client', width: 80, height: 80, fill: '#FFF0F5', stroke: '#333', strokeWidth: 2 },
    Firewall: { type: 'rect', label: 'Firewall', width: 60, height: 80, fill: '#FF6347', stroke: '#333', strokeWidth: 2, strokeDashArray: '5,2' },
    Cache: { type: 'rect', label: 'Cache', width: 80, height: 60, fill: '#E0FFFF', stroke: '#333', strokeWidth: 2, rx: 10 },
    Queue: { type: 'rect', label: 'Queue', width: 100, height: 50, fill: '#F0E68C', stroke: '#333', strokeWidth: 2 },
    Storage: {
        type: 'path', label: 'Storage', width: 80, height: 60, fill: '#D3D3D3', stroke: '#333', strokeWidth: 2,
        pathData: 'M0,60 L0,10 Q40,-10 80,10 L80,60 Q40,80 0,60 Z'
    },
    Microservice: {
        type: 'path', label: 'Service', width: 80, height: 80, fill: '#98FB98', stroke: '#333', strokeWidth: 2,
        pathData: 'M20,0 L60,0 L80,40 L60,80 L20,80 L0,40 Z' // Hexagon
    },
    Router: { type: 'circle', label: 'Router', width: 60, height: 60, fill: '#87CEFA', stroke: '#333', strokeWidth: 2, strokeDashArray: '2,2' },
    CDN: { type: 'circle', label: 'CDN', width: 90, height: 60, fill: '#FFD700', stroke: '#333', strokeWidth: 2 },
    Func: { type: 'rect', label: 'λ', width: 50, height: 50, fill: '#FF8C00', stroke: '#333', strokeWidth: 2, rx: 8 },
    Box: { type: 'rect', label: 'Box', width: 100, height: 100, fill: '#FFFFFF', stroke: '#333', strokeWidth: 2 },
    Group: { type: 'group', label: 'Group / VPC', width: 400, height: 300, fill: 'transparent', stroke: '#333', strokeWidth: 2, rx: 5, strokeDashArray: '10,5' },
    Zone: { type: 'zone', label: 'Zone / Subnet', width: 300, height: 200, fill: 'transparent', stroke: '#333', strokeWidth: 2, rx: 5, strokeDashArray: '5,5' },
    Kubernetes: {
        type: 'path', label: 'K8s', width: 80, height: 80, fill: '#326CE5', stroke: '#333', strokeWidth: 2,
        pathData: 'M40,0 L75,20 L75,60 L40,80 L5,60 L5,20 Z' // Hexagon
    },
    Nextjs: { type: 'rect', label: 'Next.js', width: 80, height: 60, fill: '#000000', stroke: '#FFF', strokeWidth: 2, rx: 5 },
    React: { type: 'circle', label: 'React', width: 80, height: 60, fill: '#282c34', stroke: '#61DAFB', strokeWidth: 3 },
    Docker: {
        type: 'path', label: 'Docker', width: 80, height: 60, fill: '#2496ED', stroke: '#333', strokeWidth: 2,
        pathData: 'M0,20 L80,20 L80,60 L0,60 Z M10,0 L30,0 L30,20 L10,20 Z M40,0 L60,0 L60,20 L40,20 Z'
    },
    Pool: {
        type: 'pool',
        label: 'Pool',
        width: 600,
        height: 300,
        fill: 'transparent',
        stroke: '#333',
        strokeWidth: 2
    },
    Heart: {
        type: 'heart',
        label: 'Love',
        width: 80,
        height: 80,
        fill: '#ff4d4d',
        stroke: '#c0392b',
        strokeWidth: 2
    },
    Star: {
        type: 'star',
        label: 'Star',
        width: 80,
        height: 80,
        fill: '#ffeb3b',
        stroke: '#fbc02d',
        strokeWidth: 2
    },
    Cloud: {
        type: 'cloud',
        label: 'Cloud',
        width: 100,
        height: 60,
        fill: '#87CEEB',
        stroke: '#333',
        strokeWidth: 2
    }
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

        nodes.forEach((node: any, i: number) => {
            const index = indices[i];
            const col = index % cols;
            const row = Math.floor(index / cols);

            // Calculate center position of the cell
            const cellCenterX = PADDING + col * cellWidth + cellWidth / 2;
            const cellCenterY = PADDING + row * cellHeight + cellHeight / 2;

            // Optional: Resize large nodes if they exceed cell size (to prevent overlap)
            // But keep a minimum visibility size
            const maxWidth = cellWidth * 0.9;
            const maxHeight = cellHeight * 0.9;

            if (node.width > maxWidth) node.width = Math.max(50, maxWidth);
            if (node.height > maxHeight) node.height = Math.max(40, maxHeight);

            // Place node centered in cell
            node.x = cellCenterX - node.width / 2;
            node.y = cellCenterY - node.height / 2;

            // Ensures it is strictly within view
            node.x = Math.max(PADDING, Math.min(node.x, VIEW_WIDTH - PADDING - node.width));
            node.y = Math.max(PADDING, Math.min(node.y, VIEW_HEIGHT - PADDING - node.height));
        });
    }

    return jumbled;
};

export const validateGraph = (masterJson: any, studentJson: any) => {
    if (!masterJson || !studentJson) return { score: 0, passed: false, details: 'Missing data' };

    const masterLinks = masterJson.links || [];
    const studentLinks = studentJson.links || [];

    // Check connections
    // D3 links might store source/target as objects after simulation, or ids.
    // We assume JSON persistence stores IDs.
    const masterConnections = new Set(
        // @ts-ignore
        masterLinks.map(l => {
            const s = typeof l.source === 'object' ? l.source.id : l.source;
            const t = typeof l.target === 'object' ? l.target.id : l.target;
            return `${s}-${t}`;
        })
    );

    let correctLinks = 0;
    // @ts-ignore
    studentLinks.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        const key = `${s}-${t}`;
        if (masterConnections.has(key)) {
            correctLinks++;
        }
    });

    const totalMasterLinks = masterLinks.length;
    const score = totalMasterLinks > 0 ? (correctLinks / totalMasterLinks) * 100 : 100;

    return {
        score,
        passed: score === 100,
        details: `${correctLinks}/${totalMasterLinks} correct connections`
    };
};
