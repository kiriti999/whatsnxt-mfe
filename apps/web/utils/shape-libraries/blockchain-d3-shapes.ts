/**
 * Blockchain / Web3 Shape Library
 * Covers L3 topics: Layer 1/2 Blockchains, Smart Contracts, DeFi, NFTs, DAOs, Wallets, IPFS
 */
import * as d3 from 'd3';

export interface BlockchainShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const blockchainD3Shapes: Record<string, BlockchainShapeDefinition> = {
    block: {
        id: 'bc-block',
        name: 'Block',
        type: 'block',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // 3D block
            g.append('polygon')
                .attr('points', `${width * 0.1},${height * 0.3} ${width * 0.5},${height * 0.1} ${width * 0.9},${height * 0.3} ${width * 0.5},${height * 0.5}`)
                .attr('fill', '#5dade2').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            g.append('polygon')
                .attr('points', `${width * 0.1},${height * 0.3} ${width * 0.5},${height * 0.5} ${width * 0.5},${height * 0.9} ${width * 0.1},${height * 0.7}`)
                .attr('fill', '#2e86c1').attr('stroke', '#1f618d').attr('stroke-width', 1.5);
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.5} ${width * 0.9},${height * 0.3} ${width * 0.9},${height * 0.7} ${width * 0.5},${height * 0.9}`)
                .attr('fill', '#3498db').attr('stroke', '#1f618d').attr('stroke-width', 1.5);
            // Hash text
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('#hash');
        },
    },

    chain: {
        id: 'bc-chain',
        name: 'Chain Link',
        type: 'chain',
        width: 75,
        height: 35,
        render: (g, width, height) => {
            // Chain links
            [0, 0.35].forEach((x) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.15).attr('width', width * 0.35).attr('height', height * 0.7).attr('rx', height * 0.35).attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 3);
            });
            // Third overlapping
            g.append('rect').attr('x', width * 0.6).attr('y', height * 0.15).attr('width', width * 0.35).attr('height', height * 0.7).attr('rx', height * 0.35).attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 3);
        },
    },

    wallet: {
        id: 'bc-wallet',
        name: 'Wallet',
        type: 'wallet',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Wallet body
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.15).attr('width', width * 0.84).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#8e44ad');
            // Card slot
            g.append('rect').attr('x', width * 0.6).attr('y', height * 0.3).attr('width', width * 0.25).attr('height', height * 0.15).attr('rx', 2).attr('fill', '#f1c40f');
            // Coin circle
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.55).attr('r', width * 0.12).attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.35).attr('y', height * 0.59).attr('text-anchor', 'middle').attr('fill', '#2c3e50').attr('font-size', 8).attr('font-weight', 'bold').text('Ξ');
        },
    },

    smartcontract: {
        id: 'bc-contract',
        name: 'Smart Contract',
        type: 'smartcontract',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            // Scroll document
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.05).attr('width', width * 0.9).attr('height', height * 0.9).attr('rx', 4).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Contract code
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.2).attr('fill', '#8e44ad').attr('font-size', 7).attr('font-weight', 'bold').text('contract');
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.3).attr('x2', width * 0.8).attr('y2', height * 0.3).attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.42).attr('x2', width * 0.7).attr('y2', height * 0.42).attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.54).attr('x2', width * 0.6).attr('y2', height * 0.54).attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            // Checkmark seal
            g.append('circle').attr('cx', width * 0.7).attr('cy', height * 0.78).attr('r', width * 0.15).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.7).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 10).text('✓');
        },
    },

    defipool: {
        id: 'bc-defi',
        name: 'DeFi Pool',
        type: 'defipool',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Pool container
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.2} L${width * 0.9},${height * 0.2} L${width * 0.8},${height * 0.85} Q${width * 0.5},${height * 0.95} ${width * 0.2},${height * 0.85} Z`)
                .attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Liquid waves
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.5} Q${width * 0.3},${height * 0.4} ${width * 0.5},${height * 0.5} Q${width * 0.7},${height * 0.6} ${width * 0.85},${height * 0.5}`)
                .attr('fill', 'none').attr('stroke', '#3498db').attr('stroke-width', 1.5);
            // Two token circles
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.68).attr('r', 8).attr('fill', '#f39c12').attr('stroke', '#d35400').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.35).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('A');
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.68).attr('r', 8).attr('fill', '#3498db').attr('stroke', '#1f618d').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.65).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('B');
            // Swap arrows
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#2c3e50').attr('font-size', 10).text('⇄');
        },
    },

    nft: {
        id: 'bc-nft',
        name: 'NFT',
        type: 'nft',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            // NFT frame
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Image placeholder
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.08).attr('width', width * 0.8).attr('height', height * 0.6).attr('rx', 3).attr('fill', '#d7bde2');
            // Diamond in image
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.15} ${width * 0.72},${height * 0.38} ${width * 0.5},${height * 0.6} ${width * 0.28},${height * 0.38}`)
                .attr('fill', '#8e44ad').attr('opacity', 0.7);
            // Token ID
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 7).text('#001');
            // Verified badge
            g.append('circle').attr('cx', width * 0.82).attr('cy', height * 0.78).attr('r', 5).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.82).attr('y', height * 0.81).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('✓');
        },
    },

    dao: {
        id: 'bc-dao',
        name: 'DAO',
        type: 'dao',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Decentralized governance
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.45).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Governance = voting nodes around ring
            const nodes = 6;
            for (let i = 0; i < nodes; i++) {
                const angle = (i * 360 / nodes - 90) * Math.PI / 180;
                const cx = width / 2 + Math.cos(angle) * width * 0.3;
                const cy = height / 2 + Math.sin(angle) * height * 0.3;
                g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 5).attr('fill', i < 4 ? '#27ae60' : '#e74c3c').attr('stroke', '#2c3e50').attr('stroke-width', 0.5);
                // Lines to center
                g.append('line').attr('x1', width / 2).attr('y1', height / 2).attr('x2', cx).attr('y2', cy).attr('stroke', '#2e86c1').attr('stroke-width', 1).attr('opacity', 0.4);
            }
            // Center icon
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 8).attr('fill', '#2e86c1');
            g.append('text').attr('x', width / 2).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('⚖');
        },
    },

    consensus: {
        id: 'bc-consensus',
        name: 'Consensus',
        type: 'consensus',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Validator nodes
            const positions = [[0.2, 0.3], [0.5, 0.15], [0.8, 0.3], [0.35, 0.65], [0.65, 0.65]];
            // All-to-all connections
            positions.forEach(([x1, y1], i) => {
                positions.forEach(([x2, y2], j) => {
                    if (j > i) {
                        g.append('line').attr('x1', width * x1).attr('y1', height * y1).attr('x2', width * x2).attr('y2', height * y2).attr('stroke', '#27ae60').attr('stroke-width', 0.8).attr('opacity', 0.3);
                    }
                });
            });
            // Node dots with checkmarks
            positions.forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 6).attr('fill', '#27ae60').attr('stroke', '#1e8449').attr('stroke-width', 1);
                g.append('text').attr('x', width * x).attr('y', height * y + 3).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('✓');
            });
        },
    },

    gastoken: {
        id: 'bc-gas',
        name: 'Gas / Token',
        type: 'gastoken',
        width: 50,
        height: 50,
        render: (g, width, height) => {
            // Coin
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.42).attr('fill', '#f9e79f').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.34).attr('fill', 'none').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            // Ethereum diamond
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.2} ${width * 0.65},${height * 0.5} ${width * 0.5},${height * 0.42} ${width * 0.35},${height * 0.5}`)
                .attr('fill', '#d4ac0d');
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.8} ${width * 0.65},${height * 0.5} ${width * 0.5},${height * 0.58} ${width * 0.35},${height * 0.5}`)
                .attr('fill', '#e67e22');
        },
    },
};
