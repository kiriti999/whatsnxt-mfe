
// Shape Data Definitions for GoJS
export const architecturalShapes = {
    Server: { category: 'Server', text: 'Server', fill: '#F5F5F5', stroke: '#333' },
    Database: { category: 'Database', text: 'DB', fill: '#F5F5F5', stroke: '#333' },
    LoadBalancer: { category: 'LoadBalancer', text: 'LB', fill: '#E6E6FA', stroke: '#333' },
    Client: { category: 'Client', text: 'Client', fill: '#FFF0F5', stroke: '#333' },
    Firewall: { category: 'Firewall', text: 'Firewall', fill: '#FF6347', stroke: '#333' },
    Cache: { category: 'Cache', text: 'Cache', fill: '#E0FFFF', stroke: '#333' },
    Queue: { category: 'Queue', text: 'Queue', fill: '#F0E68C', stroke: '#333' },
    Storage: { category: 'Storage', text: 'Storage', fill: '#D3D3D3', stroke: '#333' },
    Microservice: { category: 'Microservice', text: 'Service', fill: '#98FB98', stroke: '#333' },
    Router: { category: 'Router', text: 'Router', fill: '#87CEFA', stroke: '#333' },
    CDN: { category: 'CDN', text: 'CDN', fill: '#FFD700', stroke: '#333' },
    Func: { category: 'Func', text: 'λ', fill: '#FF8C00', stroke: '#333' },
    Box: { category: 'Box', text: 'Box', fill: '#FFFFFF', stroke: '#333' },
    Group: { category: 'Group', text: 'Group / VPC', isGroup: true, fill: 'transparent', stroke: '#333', dash: [10, 5] },
    Zone: { category: 'Zone', text: 'Zone / Subnet', isGroup: true, fill: 'transparent', stroke: '#333', dash: [5, 5] },
    Kubernetes: { category: 'Kubernetes', text: 'K8s', fill: '#326CE5', stroke: '#333' },
    Nextjs: { category: 'Nextjs', text: 'Next.js', fill: '#000000', stroke: '#FFF' },
    React: { category: 'React', text: 'React', fill: '#282c34', stroke: '#61DAFB' },
    Docker: { category: 'Docker', text: 'Docker', fill: '#2496ED', stroke: '#333' }
};

export const createArchitecturalShapes = () => {
    return architecturalShapes;
};

// Function to jumble the graph for student mode
export const jumbleGraph = (modelJson: any) => {
    if (!modelJson) return modelJson;
    const jumbled = JSON.parse(JSON.stringify(modelJson));

    // Clear links
    jumbled.linkDataArray = [];

    // Jumble positions
    if (jumbled.nodeDataArray) {
        jumbled.nodeDataArray.forEach((node: any) => {
            // Random position within typical bounds (e.g., 800x600 canvas)
            // GoJS uses string "x y" for location
            const x = Math.floor(Math.random() * 600) + 50;
            const y = Math.floor(Math.random() * 400) + 50;
            node.loc = `${x} ${y}`;

            // If it was in a group, maybe ungroup it? 
            // For now, let's keep groups if they exist in the master, 
            // or we could remove 'group' property to really mess it up.
            // Let's keep groups for structure but remove links.
        });
    }

    return jumbled;
};

export const validateGraph = (masterJson: any, studentJson: any) => {
    if (!masterJson || !studentJson) return { score: 0, passed: false, details: 'Missing data' };

    // Compare connections (links)
    const masterLinks = masterJson.linkDataArray || [];
    const studentLinks = studentJson.linkDataArray || [];

    // Create a Set of "from-to" strings for master
    // Note: This simple check assumes directionality matches and no duplicate links.
    // In GoJS, 'from' and 'to' are keys. 
    // We need to map keys to something persistent if keys are regenerated?
    // GoJS usually preserves keys if we load the same model. 
    // If student starts from jumbled model (which is a clone), keys should be same.

    const masterConnections = new Set(
        // @ts-ignore
        masterLinks.map(l => `${l.from}-${l.to}`)
    );

    let correctLinks = 0;
    // @ts-ignore
    studentLinks.forEach(link => {
        const key = `${link.from}-${link.to}`;
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
