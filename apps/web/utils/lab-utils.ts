import * as joint from 'jointjs';

export const createArchitecturalShapes = () => {
    const shapes = {
        Server: new joint.shapes.standard.Rectangle({
            position: { x: 50, y: 50 },
            size: { width: 100, height: 60 },
            attrs: {
                body: { fill: '#F5F5F5', stroke: '#333', strokeWidth: 2, rx: 5, ry: 5, magnet: true },
                label: { text: 'Server', fill: '#333', fontSize: 14 }
            }
        }),
        Database: new joint.shapes.standard.Cylinder({
            position: { x: 50, y: 150 },
            size: { width: 80, height: 80 },
            attrs: {
                body: { fill: '#F5F5F5', stroke: '#333', strokeWidth: 2, magnet: true },
                top: { fill: '#DDD', stroke: '#333', strokeWidth: 2 },
                label: { text: 'DB', fill: '#333', fontSize: 14, refY: 0.5 }
            }
        }),
        LoadBalancer: new joint.shapes.standard.Polygon({
            position: { x: 50, y: 250 },
            size: { width: 100, height: 60 },
            attrs: {
                body: { points: '0,30 50,0 100,30 50,60', fill: '#E6E6FA', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'LB', fill: '#333', fontSize: 14 }
            }
        }),
        Client: new joint.shapes.standard.Circle({
            position: { x: 50, y: 350 },
            size: { width: 80, height: 80 },
            attrs: {
                body: { fill: '#FFF0F5', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Client', fill: '#333', fontSize: 14 }
            }
        }),
        Firewall: new joint.shapes.standard.Path({
            position: { x: 150, y: 50 },
            size: { width: 60, height: 80 },
            attrs: {
                body: { d: 'M 0 0 L 20 0 L 20 80 L 0 80 L 0 60 L 60 60 L 60 80 L 40 80 L 40 0 L 60 0 L 60 20 L 0 20 Z', fill: '#FF6347', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Firewall', fill: '#333', fontSize: 12, refY: 1.2 }
            }
        }),
        Cache: new joint.shapes.standard.Cylinder({
            position: { x: 150, y: 150 },
            size: { width: 80, height: 60 },
            attrs: {
                body: { fill: '#E0FFFF', stroke: '#333', strokeWidth: 2, magnet: true },
                top: { fill: '#AFEEEE', stroke: '#333', strokeWidth: 2 },
                label: { text: 'Cache', fill: '#333', fontSize: 14, refY: 0.5 }
            }
        }),
        Queue: new joint.shapes.standard.HeaderedRectangle({
            position: { x: 150, y: 250 },
            size: { width: 100, height: 60 },
            attrs: {
                root: { rx: 5, ry: 5 },
                body: { fill: '#F0E68C', stroke: '#333', strokeWidth: 2, magnet: true },
                header: { fill: '#DAA520', stroke: '#333', strokeWidth: 2, height: 20 },
                headerText: { text: 'msg' },
                bodyText: { text: 'Queue', fill: '#333', fontSize: 14 }
            }
        }),
        Storage: new joint.shapes.standard.Path({
            position: { x: 150, y: 350 },
            size: { width: 80, height: 60 },
            attrs: {
                body: { d: 'M 0 15 Q 40 0 80 15 Q 40 30 0 15 L 0 45 Q 40 60 80 45 L 80 15', fill: '#D3D3D3', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Storage', fill: '#333', fontSize: 14, refY: 1.2 }
            }
        }),
        Microservice: new joint.shapes.standard.Polygon({
            position: { x: 250, y: 50 },
            size: { width: 80, height: 80 },
            attrs: {
                body: { points: '40,0 80,20 80,60 40,80 0,60 0,20', fill: '#98FB98', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Service', fill: '#333', fontSize: 14 }
            }
        }),
        Router: new joint.shapes.standard.Polygon({
            position: { x: 250, y: 150 },
            size: { width: 80, height: 80 },
            attrs: {
                body: { points: '40,0 80,40 40,80 0,40', fill: '#87CEFA', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Router', fill: '#333', fontSize: 14 }
            }
        }),
        CDN: new joint.shapes.standard.Ellipse({
            position: { x: 250, y: 250 },
            size: { width: 100, height: 60 },
            attrs: {
                body: { fill: '#FFD700', stroke: '#333', strokeWidth: 2, strokeDasharray: '5,5', magnet: true },
                label: { text: 'CDN', fill: '#333', fontSize: 14 }
            }
        }),
        Func: new joint.shapes.standard.Rectangle({
            position: { x: 250, y: 350 },
            size: { width: 60, height: 60 },
            attrs: {
                body: { fill: '#FF8C00', stroke: '#333', strokeWidth: 2, rx: 10, ry: 10, magnet: true },
                label: { text: 'λ', fill: '#FFF', fontSize: 40, fontWeight: 'bold' }
            }
        }),
        Box: new joint.shapes.standard.Rectangle({
            position: { x: 350, y: 50 },
            size: { width: 100, height: 100 },
            attrs: {
                body: { fill: '#FFFFFF', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Box', fill: '#333', fontSize: 14 }
            }
        }),
        Group: new joint.shapes.standard.Rectangle({
            position: { x: 350, y: 150 },
            size: { width: 400, height: 300 },
            attrs: {
                body: { fill: 'transparent', stroke: '#333', strokeWidth: 2, rx: 5, ry: 5, magnet: true },
                label: { text: 'Group / VPC', fill: '#333', fontSize: 16, refY: 10, refY2: 0 }
            }
        }),
        Zone: new joint.shapes.standard.Rectangle({
            position: { x: 350, y: 300 },
            size: { width: 300, height: 200 },
            attrs: {
                body: { fill: 'transparent', stroke: '#333', strokeWidth: 2, strokeDasharray: '10,5', rx: 5, ry: 5, magnet: true },
                label: { text: 'Zone / Subnet', fill: '#333', fontSize: 14, refY: 10, refY2: 0 }
            }
        }),
        Kubernetes: new joint.shapes.standard.Polygon({
            position: { x: 450, y: 50 },
            size: { width: 80, height: 80 },
            attrs: {
                body: { points: '40,0 80,20 80,60 40,80 0,60 0,20', fill: '#326CE5', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'K8s', fill: '#FFF', fontSize: 14, fontWeight: 'bold' }
            }
        }),
        Nextjs: new joint.shapes.standard.Rectangle({
            position: { x: 450, y: 150 },
            size: { width: 80, height: 60 },
            attrs: {
                body: { fill: '#000000', stroke: '#FFF', strokeWidth: 2, rx: 5, ry: 5, magnet: true },
                label: { text: 'Next.js', fill: '#FFF', fontSize: 14, fontWeight: 'bold' }
            }
        }),
        React: new joint.shapes.standard.Ellipse({
            position: { x: 450, y: 250 },
            size: { width: 80, height: 60 },
            attrs: {
                body: { fill: '#282c34', stroke: '#61DAFB', strokeWidth: 3, magnet: true },
                label: { text: 'React', fill: '#61DAFB', fontSize: 14, fontWeight: 'bold' }
            }
        }),
        Docker: new joint.shapes.standard.Path({
            position: { x: 450, y: 350 },
            size: { width: 80, height: 60 },
            attrs: {
                // Simplified whale/container shape
                body: { d: 'M 0 20 L 80 20 L 80 60 L 0 60 Z M 10 0 L 30 0 L 30 20 L 10 20 Z M 40 0 L 60 0 L 60 20 L 40 20 Z', fill: '#2496ED', stroke: '#333', strokeWidth: 2, magnet: true },
                label: { text: 'Docker', fill: '#FFF', fontSize: 12, refY: 40 }
            }
        })
    };
    return shapes;
};

// Function to jumble the graph for student mode
export const jumbleGraph = (graphJSON: any) => {
    const jumbled = JSON.parse(JSON.stringify(graphJSON));
    // Remove all links
    jumbled.cells = jumbled.cells.filter((c: any) => c.type !== 'standard.Link');

    // Randomize positions of elements
    jumbled.cells.forEach((cell: any) => {
        if (cell.type !== 'standard.Link') {
            cell.position = {
                x: Math.floor(Math.random() * 600) + 50,
                y: Math.floor(Math.random() * 400) + 50
            };
        }
    });

    return jumbled;
};

export const validateGraph = (masterJSON: any, studentJSON: any) => {
    const masterLinks = masterJSON.cells.filter((c: any) => c.type === 'standard.Link');
    const studentLinks = studentJSON.cells.filter((c: any) => c.type === 'standard.Link');

    const masterConnections = new Set(
        masterLinks.map((l: any) => `${l.source.id}->${l.target.id}`)
    );

    let correctLinks = 0;
    studentLinks.forEach((link: any) => {
        const key = `${link.source.id}->${link.target.id}`;
        if (masterConnections.has(key)) {
            correctLinks++;
        }
    });

    const score = masterLinks.length > 0 ? (correctLinks / masterLinks.length) * 100 : 100;
    return {
        score,
        passed: score === 100,
        details: `${correctLinks}/${masterLinks.length} correct connections`
    };
};
