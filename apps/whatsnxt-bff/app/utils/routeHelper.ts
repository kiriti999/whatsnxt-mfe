import { Application } from "express";

/**
 * Route Helper
 *
 * Utility to extract and print available routes from Express application.
 */

interface Route {
  method: string;
  path: string;
}

interface RouterLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
  name?: string;
  regexp?: RegExp & { source: string };
  handle?: {
    stack: RouterLayer[];
  };
}

interface ExpressRouter {
  stack: RouterLayer[];
}

/**
 * Prints all available routes in the Express application
 * @param app - Express application instance
 */
export function printAvailableRoutes(app: Application): void {
  // For Express apps, access the router stack directly
  const router = (app as any)._router as ExpressRouter | undefined;

  if (router && router.stack) {
    const availableRoutes: Route[] = [];

    // Helper function to extract routes from router layers
    const extractRoutes = (
      stack: RouterLayer[],
      basePath: string = "",
    ): void => {
      stack.forEach((layer) => {
        if (layer.route) {
          // Direct route
          const methods = Object.keys(layer.route.methods);
          methods.forEach((method) => {
            availableRoutes.push({
              method: method.toUpperCase(),
              path: basePath + layer.route!.path,
            });
          });
        } else if (layer.name === "router" && layer.handle?.stack) {
          // Nested router (e.g., from app.use('/api', router))
          const match = layer.regexp?.source.match(/\^\\?\/?(.+?)\\?\$/) || [
            "",
            "",
          ];
          const nestedBasePath = basePath + match[1].replace(/\\\//g, "/");
          extractRoutes(layer.handle.stack, nestedBasePath);
        }
      });
    };

    extractRoutes(router.stack);

    if (availableRoutes.length > 0) {
      console.log("\n📋 Available Routes:");
      console.log("====================");

      // Sort routes by path for better readability
      availableRoutes
        .sort((a, b) => a.path.localeCompare(b.path))
        .forEach((route) => {
          const methodColor = getMethodColor(route.method);
          console.log(
            `${methodColor}${route.method.padEnd(6)} ${route.path}\x1b[0m`,
          );
        });

      console.log(`\n✅ Total routes found: ${availableRoutes.length}\n`);
    } else {
      console.warn("No routes found in the application.");
    }
  } else {
    console.error("No router found in the Express application.");
  }
}

/**
 * Returns all available routes without printing
 * @param app - Express application instance
 * @returns Array of routes
 */
export function getAvailableRoutes(app: Application): Route[] {
  const router = (app as any)._router as ExpressRouter | undefined;
  const availableRoutes: Route[] = [];

  if (router && router.stack) {
    const extractRoutes = (
      stack: RouterLayer[],
      basePath: string = "",
    ): void => {
      stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods);
          methods.forEach((method) => {
            availableRoutes.push({
              method: method.toUpperCase(),
              path: basePath + layer.route!.path,
            });
          });
        } else if (layer.name === "router" && layer.handle?.stack) {
          const match = layer.regexp?.source.match(/\^\\?\/?(.+?)\\?\$/) || [
            "",
            "",
          ];
          const nestedBasePath = basePath + match[1].replace(/\\\//g, "/");
          extractRoutes(layer.handle.stack, nestedBasePath);
        }
      });
    };

    extractRoutes(router.stack);
  }

  return availableRoutes.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Helper function to add colors to HTTP methods
 * @param method - HTTP method
 * @returns ANSI color code
 */
function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: "\x1b[32m", // Green
    POST: "\x1b[33m", // Yellow
    PUT: "\x1b[34m", // Blue
    PATCH: "\x1b[35m", // Magenta
    DELETE: "\x1b[31m", // Red
    OPTIONS: "\x1b[36m", // Cyan
    HEAD: "\x1b[37m", // White
  };
  return colors[method] || "\x1b[0m"; // Default color
}
