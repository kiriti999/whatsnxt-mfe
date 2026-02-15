/**
 * Authentication & Authorization Shape Library
 * Covers L3 topics: OAuth 2.0, JWT, SSO, MFA, RBAC, Identity Providers, SAML, OpenID Connect
 */
import * as d3 from 'd3';

export interface AuthShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const authD3Shapes: Record<string, AuthShapeDefinition> = {
    oauthflow: {
        id: 'auth-oauth',
        name: 'OAuth Flow',
        type: 'oauthflow',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Client
            g.append('circle').attr('cx', width * 0.12).attr('cy', height * 0.5).attr('r', 8).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.12).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('App');
            // Auth Server
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.15).attr('width', width * 0.3).attr('height', height * 0.3).attr('rx', 4).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.34).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('Auth');
            // Resource
            g.append('circle').attr('cx', width * 0.88).attr('cy', height * 0.5).attr('r', 8).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.88).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('API');
            // Flow arrows
            // 1. Redirect to auth
            g.append('path')
                .attr('d', `M${width * 0.2},${height * 0.42} Q${width * 0.3},${height * 0.22} ${width * 0.35},${height * 0.3}`)
                .attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.22).attr('y', height * 0.28).attr('fill', '#e74c3c').attr('font-size', 5).text('①');
            // 2. Code back
            g.append('path')
                .attr('d', `M${width * 0.35},${height * 0.4} Q${width * 0.28},${height * 0.55} ${width * 0.2},${height * 0.55}`)
                .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.24).attr('y', height * 0.6).attr('fill', '#f39c12').attr('font-size', 5).text('②');
            // 3. Token exchange
            g.append('line').attr('x1', width * 0.65).attr('y1', height * 0.3).attr('x2', width * 0.65).attr('y2', height * 0.62).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.68).attr('y', height * 0.5).attr('fill', '#8e44ad').attr('font-size', 5).text('③');
            // 4. Access resource
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.7).attr('x2', width * 0.78).attr('y2', height * 0.7).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.66).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 5).text('④ token');
            // Token box
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.6).attr('width', width * 0.3).attr('height', height * 0.22).attr('rx', 3).attr('fill', '#8e44ad').attr('opacity', 0.2);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.75).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 5).text('🪙 access');
        },
    },

    jwttoken: {
        id: 'auth-jwt',
        name: 'JWT Token',
        type: 'jwttoken',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Three JWT sections
            // Header
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.08).attr('width', width * 0.9).attr('height', height * 0.22).attr('rx', 3).attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('header');
            // Dot separator
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.36).attr('text-anchor', 'middle').attr('fill', '#f1c40f').attr('font-size', 10).text('·');
            // Payload
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.38).attr('width', width * 0.9).attr('height', height * 0.22).attr('rx', 3).attr('fill', '#8e44ad');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.52).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('payload');
            // Dot separator
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.66).attr('text-anchor', 'middle').attr('fill', '#f1c40f').attr('font-size', 10).text('·');
            // Signature
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.68).attr('width', width * 0.9).attr('height', height * 0.22).attr('rx', 3).attr('fill', '#2e86c1');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('signature');
        },
    },

    identityprovider: {
        id: 'auth-idp',
        name: 'Identity Provider',
        type: 'identityprovider',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Shield
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.08} L${width * 0.82},${height * 0.2} L${width * 0.82},${height * 0.55} Q${width * 0.82},${height * 0.78} ${width * 0.5},${height * 0.92} Q${width * 0.18},${height * 0.78} ${width * 0.18},${height * 0.55} L${width * 0.18},${height * 0.2} Z`)
                .attr('fill', '#27ae60').attr('stroke', '#1e8449').attr('stroke-width', 1);
            // Person silhouette inside shield
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.35).attr('r', 7).attr('fill', '#fff');
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.72} Q${width * 0.3},${height * 0.52} ${width * 0.5},${height * 0.5} Q${width * 0.7},${height * 0.52} ${width * 0.7},${height * 0.72}`)
                .attr('fill', '#fff');
            // Checkmark badge
            g.append('circle').attr('cx', width * 0.72).attr('cy', height * 0.2).attr('r', 6).attr('fill', '#f1c40f');
            g.append('text').attr('x', width * 0.72).attr('y', height * 0.24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('✓');
        },
    },

    mfa: {
        id: 'auth-mfa',
        name: 'MFA',
        type: 'mfa',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Factor 1: Password
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.08).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.275).attr('y', height * 0.24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('🔑');
            // Factor 2: Phone
            g.append('rect').attr('x', width * 0.55).attr('y', height * 0.08).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.725).attr('y', height * 0.24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('📱');
            // Factor 3: Biometric
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.4).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.275).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('👆');
            // Factor N: Hardware key
            g.append('rect').attr('x', width * 0.55).attr('y', height * 0.4).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.725).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('🔐');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 8).attr('font-weight', 'bold').text('MFA');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.94).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('Multi-Factor');
        },
    },

    rbac: {
        id: 'auth-rbac',
        name: 'RBAC',
        type: 'rbac',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // User
            g.append('circle').attr('cx', width * 0.15).attr('cy', height * 0.5).attr('r', 7).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('U');
            // Arrow to Role
            g.append('line').attr('x1', width * 0.22).attr('y1', height * 0.5).attr('x2', width * 0.33).attr('y2', height * 0.5).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            // Role
            g.append('rect').attr('x', width * 0.33).attr('y', height * 0.32).attr('width', width * 0.2).attr('height', height * 0.36).attr('rx', 4).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.43).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('Role');
            g.append('text').attr('x', width * 0.43).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fef9e7').attr('font-size', 5).text('Admin');
            // Arrow to Permissions
            g.append('line').attr('x1', width * 0.53).attr('y1', height * 0.5).attr('x2', width * 0.63).attr('y2', height * 0.5).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            // Permissions
            const perms = ['read', 'write', 'delete'];
            perms.forEach((p, i) => {
                const y = 0.2 + i * 0.22;
                g.append('rect').attr('x', width * 0.63).attr('y', height * y).attr('width', width * 0.32).attr('height', height * 0.18).attr('rx', 3).attr('fill', i === 2 ? '#e74c3c' : '#27ae60');
                g.append('text').attr('x', width * 0.79).attr('y', height * (y + 0.12)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text(p);
            });
        },
    },

    sso: {
        id: 'auth-sso',
        name: 'SSO',
        type: 'sso',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Central SSO hub
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 12).attr('fill', '#2e86c1');
            g.append('text').attr('x', width / 2).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).attr('font-weight', 'bold').text('SSO');
            // Connected apps
            const apps = [
                { x: 0.15, y: 0.2, label: '📧', color: '#e74c3c' },
                { x: 0.85, y: 0.2, label: '📊', color: '#27ae60' },
                { x: 0.15, y: 0.8, label: '📁', color: '#f39c12' },
                { x: 0.85, y: 0.8, label: '💬', color: '#8e44ad' },
            ];
            apps.forEach(({ x, y, label, color }) => {
                g.append('line').attr('x1', width / 2).attr('y1', height / 2).attr('x2', width * x).attr('y2', height * y).attr('stroke', '#2e86c1').attr('stroke-width', 1).attr('opacity', 0.5);
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 8).attr('fill', color);
                g.append('text').attr('x', width * x).attr('y', height * y + 3).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text(label);
            });
        },
    },

    sessiontoken: {
        id: 'auth-session',
        name: 'Session Token',
        type: 'sessiontoken',
        width: 55,
        height: 40,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', height * 0.3).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Token chip
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.18).attr('width', width * 0.2).attr('height', height * 0.64).attr('rx', 3).attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            // Chip circuit
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.35).attr('x2', width * 0.22).attr('y2', height * 0.35).attr('stroke', '#d4ac0d').attr('stroke-width', 0.5);
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.5).attr('x2', width * 0.22).attr('y2', height * 0.5).attr('stroke', '#d4ac0d').attr('stroke-width', 0.5);
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.65).attr('x2', width * 0.22).attr('y2', height * 0.65).attr('stroke', '#d4ac0d').attr('stroke-width', 0.5);
            // Token string
            g.append('text').attr('x', width * 0.35).attr('y', height * 0.42).attr('fill', '#e74c3c').attr('font-size', 5).text('eyJhbGci...');
            g.append('text').attr('x', width * 0.35).attr('y', height * 0.62).attr('fill', '#95a5a6').attr('font-size', 5).text('exp: 1h');
        },
    },

    apikey: {
        id: 'auth-apikey',
        name: 'API Key',
        type: 'apikey',
        width: 55,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Key icon
            g.append('circle').attr('cx', width * 0.22).attr('cy', height * 0.5).attr('r', width * 0.12).attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.22).attr('cy', height * 0.5).attr('r', width * 0.05).attr('fill', '#fef9e7');
            // Key shaft
            g.append('line').attr('x1', width * 0.34).attr('y1', height * 0.5).attr('x2', width * 0.75).attr('y2', height * 0.5).attr('stroke', '#f1c40f').attr('stroke-width', 2.5);
            // Key teeth
            g.append('line').attr('x1', width * 0.6).attr('y1', height * 0.5).attr('x2', width * 0.6).attr('y2', height * 0.68).attr('stroke', '#f1c40f').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.7).attr('y1', height * 0.5).attr('x2', width * 0.7).attr('y2', height * 0.62).attr('stroke', '#f1c40f').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.5).attr('x2', width * 0.75).attr('y2', height * 0.68).attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#d4ac0d').attr('font-size', 6).text('x-api-key');
        },
    },
};
