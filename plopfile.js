const { readdir } = require("fs/promises");
const execSync = require("child_process").execSync;

async function listPackages(path) {
  const myPackages = (await readdir(path, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dir) => dir.name);
  return myPackages;
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

module.exports = async function (plop) {
  const uiPackages = await listPackages(`${__dirname}/packages`);
  const nextAppBasePath = `apps/{{kebabCase AppName}}`;
  const uiPackageBasePath = `packages/{{kebabCase name}}`;
  const templateBasePath = `tools/generator-templates`;
  const reactBasePath = `packages/{{kebabCase projectName}}/src/{{pascalCase name}}`;

  plop.setGenerator("⚡ Micro-Frontend-next-app", {
    description:
      "Generates a new Next.js Micro-Frontend application, with customizable name, component, and port number",
    prompts: [
      {
        type: "input",
        name: "AppName",
        message: "Enter your Microfrontend name:"
      },
      {
        type: "input",
        name: "componentName",
        message: "Enter the Name of the component:"
      },
      {
        type: "checkbox",
        name: "uiPackagesList",
        message:
          "Select all UI Package you want to transpile and want to use in this application:",
        choices: uiPackages
      },
      {
        type: "input",
        name: "portNumber",
        message: "Enter the port number for running app:"
      }
    ],
    actions: [
      {
        type: "addMany",
        destination: `${nextAppBasePath}`,
        base: `${templateBasePath}/mfe-app`,
        templateFiles: `${templateBasePath}/mfe-app/*.hbs`
      },
      {
        type: "add",
        path: `${nextAppBasePath}/public/.gitkeep`,
        templateFile: `${templateBasePath}/mfe-app/public/.gitkeep.hbs`
      },
      {
        type: "add",
        path: `${nextAppBasePath}/styles/globals.css`,
        templateFile: `${templateBasePath}/mfe-app/styles/global.css.hbs`
      },
      {
        type: "add",
        path: `${nextAppBasePath}/app/_app.tsx`,
        templateFile: `${templateBasePath}/mfe-app/app/_app.tsx.hbs`
      },
      {
        type: "add",
        path: `${nextAppBasePath}/app/index.tsx`,
        templateFile: `${templateBasePath}/mfe-app/app/index.tsx.hbs`
      },
      {
        type: "add",
        path: `${nextAppBasePath}/components/{{pascalCase componentName}}MicroFrontEnd.tsx`,
        templateFile: `${templateBasePath}/mfe-app/components/MicroFrontEnd.tsx.hbs`
      },
      {
        type: "modify",
        path: "./pnpm-workspace.yaml",
        pattern: /$/gi,
        template: `\n  - "${nextAppBasePath}"`
      },
      {
        type: "modify",
        path: "package.json",
        transform: (fileContent, data) => {
          const myPackage = JSON.parse(fileContent);
          const firstWord = data.AppName.split(" ")[0];
          const scriptName = `dev:${plop.getHelper("kebabCase")(
            firstWord
          )}-mfe`;
          myPackage.scripts[
            scriptName
          ] = `turbo run dev --filter=${plop.getHelper("kebabCase")(
            data.AppName
          )} --no-daemon`;
          myPackage.workspaces.push(
            `apps/${plop.getHelper("kebabCase")(data.AppName)}`
          );
          return JSON.stringify(myPackage, null, 2);
        }
      },
      {
        type: "modify",
        path: ".vscode/tasks.json",
        transform: (tasks, data) => {
          let tasksArray = JSON.parse(tasks);
          try {
            let colours = [
              "terminal.ansiBlack",
              "terminal.ansiBlue",
              "terminal.ansiCyan",
              "terminal.ansiGreen",
              "terminal.ansiMagenta",
              "terminal.ansiRed",
              "terminal.ansiWhite",
              "terminal.ansiYellow"
            ];
            const firstWord = data.AppName.split(" ")[0];
            const scriptName = `dev:${plop.getHelper("kebabCase")(
              firstWord
            )}-mfe`;
            tasksArray.tasks.push({
              type: "npm",
              script: scriptName,
              problemMatcher: [],
              label: `${plop.getHelper("kebabCase")(firstWord)}-mfe:dev`,
              icon: {
                id: "preview",
                color: colours[Math.floor(Math.random() * colours.length)]
              }
            });
            return JSON.stringify(tasksArray, null, 2);
          } catch (error) {
            console.error("Error parsing JSON:", error.message);
            return tasksArray;
          }
        }
      },
      () => {
        execSync("pnpm i", { stdio: "inherit" });
        console.log("🤞 Happy Coding");
      }
    ]
  });

  plop.setGenerator("📦 UI-Package", {
    description:
      "Generates a new React UI Package with all the configurations needed",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the UI package:"
      }
    ],
    actions: [
      {
        type: "addMany",
        destination: `${uiPackageBasePath}`,
        base: `${templateBasePath}/ui-package`,
        templateFiles: `${templateBasePath}/ui-package/*.hbs`
      },
      {
        type: "modify",
        path: ".vscode/settings.json",
        transform: (settingsContent, data) => {
          let kebabCaseName = toKebabCase(data.name);
          try {
            let settings = JSON.parse(settingsContent);
            settings["material-icon-theme.folders.associations"][
              kebabCaseName
            ] = "react-components";
            return JSON.stringify(settings, null, 2);
          } catch (error) {
            console.error("Error parsing JSON:", error.message);
            return settingsContent;
          }
        }
      },
      {
        type: "modify",
        path: "package.json",
        transform: (fileContent, data) => {
          const myPackage = JSON.parse(fileContent);
          myPackage.workspaces.push(
            `packages/ui-packages/${plop.getHelper("kebabCase")(data.name)}`
          );
          return JSON.stringify(myPackage, null, 2);
        }
      },
      {
        type: "modify",
        path: "./pnpm-workspace.yaml",
        pattern: /$/gi,
        template: `\n  - "${uiPackageBasePath}"`
      },
      () => {
        execSync("pnpm i", { stdio: "inherit" });
        console.log("🤞 Happy Coding");
      }
    ]
  });

  plop.setGenerator("⚛️  React-component", {
    description: "Generate a React component in the selected UI Package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name: "
      },
      {
        type: "list",
        name: "projectName",
        message: "Select a package name:",
        choices: uiPackages
      }
    ],
    actions: [
      {
        type: "add",
        path: `${reactBasePath}/{{pascalCase name}}.tsx`,
        templateFile: `${templateBasePath}/react-component/Component.tsx.hbs`
      },
      {
        type: "add",
        path: `${reactBasePath}/{{pascalCase name}}.module.css`,
        templateFile: `${templateBasePath}/react-component/Component.css.hbs`
      },
      {
        type: "add",
        path: `${reactBasePath}/index.ts`,
        templateFile: `${templateBasePath}/react-component/index.ts.hbs`
      }
    ]
  });
};
