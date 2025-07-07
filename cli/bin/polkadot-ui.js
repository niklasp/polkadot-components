#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const execa = require("execa");
const fs = require("fs").promises;
const path = require("path");

const program = new Command();

// Registry URL based on environment
let REGISTRY_URL = "https://polkadot-ui-registry.vercel.app";

// Check if project uses Tailwind v4
async function getTailwindVersion() {
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
  const tailwindVersion =
    packageJson.dependencies?.tailwindcss ||
    packageJson.devDependencies?.tailwindcss;

  if (!tailwindVersion) {
    throw new Error("Tailwind CSS not found in package.json");
  }

  if (tailwindVersion && tailwindVersion.includes("4")) {
    return 4;
  }
  return 3;
}

// Detect project type and structure
async function detectProjectStructure() {
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));

    // Check if it's a React project
    const hasReact =
      packageJson.dependencies?.react || packageJson.devDependencies?.react;
    if (!hasReact) {
      throw new Error("This doesn't appear to be a React project");
    }

    // Detect project type
    const isNextJs =
      packageJson.dependencies?.next || packageJson.devDependencies?.next;
    const isVite =
      packageJson.devDependencies?.vite || packageJson.dependencies?.vite;
    const isCRA = packageJson.dependencies?.["react-scripts"];

    // Determine component directory
    let componentDir = "components";
    let srcDir = "";

    if (isVite || isCRA) {
      // Vite and CRA typically use src/ directory
      srcDir = "src";
      componentDir = "src/components";

      // Check if src directory exists
      try {
        await fs.access("src");
      } catch {
        throw new Error(
          "src/ directory not found. Please ensure this is a properly set up React project."
        );
      }
    }

    return {
      isNextJs: !!isNextJs,
      isVite: !!isVite,
      isCRA: !!isCRA,
      srcDir,
      componentDir,
      hookDir: srcDir ? `${srcDir}/hooks` : "hooks",
      providerDir: srcDir ? `${srcDir}/providers` : "providers",
      registryDir: "registry/new-york", // For registry template structure
      hasTypeScript: !!(
        packageJson.devDependencies?.typescript ||
        packageJson.dependencies?.typescript
      ),
    };
  } catch (error) {
    throw new Error(`Project validation failed: ${error.message}`);
  }
}

async function validateProject() {
  const spinner = ora("Validating project structure...").start();

  try {
    const structure = await detectProjectStructure();
    spinner.succeed("Project structure validated");
    return structure;
  } catch (error) {
    spinner.fail(`Project validation failed: ${error.message}`);
    throw error;
  }
}

// Check existing papi configuration
async function checkExistingPapiConfig() {
  try {
    const configPath = ".papi/polkadot-api.json";
    await fs.access(configPath);
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    const existingChains = Object.keys(config.entries || {});
    return existingChains.length > 0 ? existingChains : null;
  } catch {
    return null;
  }
}

async function updatePolkadotConfig(chainName, structure) {
  try {
    const configPath = `${structure.registryDir}/lib/polkadot-config.ts`;
    const configExists = await fs
      .access(configPath)
      .then(() => true)
      .catch(() => false);

    if (!configExists) {
      console.log(chalk.yellow("⚠ Polkadot config not found, skipping update"));
      return;
    }

    let content = await fs.readFile(configPath, "utf-8");

    // Check if the chain is already imported
    const importRegex = new RegExp(
      `import.*${chainName}.*from.*@polkadot-api/descriptors`
    );
    if (importRegex.test(content)) {
      console.log(chalk.gray(`Chain ${chainName} already imported`));
      return;
    }

    // Add the import for the new chain
    const descriptorImportRegex =
      /import { ([^}]+) } from "@polkadot-api\/descriptors";/;
    if (descriptorImportRegex.test(content)) {
      content = content.replace(descriptorImportRegex, (match, imports) => {
        const importList = imports.split(",").map((imp) => imp.trim());
        if (!importList.includes(chainName)) {
          importList.push(chainName);
        }
        return `import { ${importList.join(
          ", "
        )} } from "@polkadot-api/descriptors";`;
      });
    }

    // Add the chain configuration if it doesn't exist
    const chainConfigRegex = new RegExp(`${chainName}:\\s*{`);
    if (!chainConfigRegex.test(content)) {
      // Find the chains object and add the new chain
      const chainsRegex = /(chains:\s*{\s*)/;
      if (chainsRegex.test(content)) {
        const isTestnet =
          chainName.includes("testnet") ||
          chainName.includes("paseo") ||
          chainName.includes("rococo") ||
          chainName.includes("westend");
        const displayName = chainName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Get default endpoint for common chains
        const endpoints = {
          polkadot: "wss://polkadot-rpc.publicnode.com",
          kusama: "wss://kusama-rpc.polkadot.io",
          westend: "wss://westend-rpc.polkadot.io",
          rococo: "wss://rococo-rpc.polkadot.io",
          asset_hub_polkadot: "wss://polkadot-asset-hub-rpc.polkadot.io",
          asset_hub_kusama: "wss://kusama-asset-hub-rpc.polkadot.io",
          paseo_asset_hub: "wss://sys.ibp.network/asset-hub-paseo",
        };

        const endpoint =
          endpoints[chainName] || `wss://${chainName}.polkadot.io`;

        const chainConfig = `    ${chainName}: {
      descriptor: ${chainName},
      endpoint: "${endpoint}",
      displayName: "${displayName}",
      isTestnet: ${isTestnet},
    },`;

        content = content.replace(chainsRegex, `$1${chainConfig}\n`);
      }
    }

    await fs.writeFile(configPath, content);
    console.log(
      chalk.green(`✔ Updated Polkadot config with "${chainName}" chain`)
    );
  } catch (error) {
    console.error(chalk.yellow(`⚠ Failed to update config: ${error.message}`));
  }
}

// Setup polkadot-api with proper chain detection
async function setupPolkadotApi(componentInfo, structure, isDev = false) {
  console.log(chalk.cyan("Setting up Polkadot API..."));

  // Check for existing papi configuration
  const existingChains = await checkExistingPapiConfig();

  if (existingChains) {
    console.log(
      chalk.green(
        `✔ Found existing Polkadot chains: ${existingChains.join(", ")}`
      )
    );
    console.log(chalk.green("✔ Reusing existing Polkadot API configuration"));

    // Still update the config to ensure proper chain configuration
    const defaultChain = isDev ? "paseo_asset_hub" : "polkadot";
    console.log(chalk.cyan(`Updating chain configuration...`));
    await updatePolkadotConfig(defaultChain, structure);

    return true; // Return true to indicate setup exists
  }

  // Choose default chain based on environment
  const defaultChain = isDev ? "paseo_asset_hub" : "polkadot";
  const chainDisplayName = isDev ? "Paseo Asset Hub" : "Polkadot";

  const spinner = ora(`Adding ${chainDisplayName} chain metadata...`).start();

  try {
    if (isDev) {
      // Add Paseo Asset Hub for development
      await execa(
        "pnpm",
        ["papi", "add", "paseo_asset_hub", "-n", "paseo_asset_hub"],
        {
          stdio: "pipe",
        }
      );
    } else {
      // Add Polkadot mainnet for production
      await execa("pnpm", ["papi", "add", "polkadot", "-n", "polkadot"], {
        stdio: "pipe",
      });
    }

    spinner.text = "Generating Polkadot API types...";

    // Generate types
    await execa("pnpm", ["papi"], {
      stdio: "pipe",
    });
    spinner.succeed(`${chainDisplayName} chain metadata and types generated`);

    console.log(chalk.cyan(`Updating config for ${chainDisplayName}...`));
    await updatePolkadotConfig(defaultChain, structure);
  } catch (error) {
    spinner.fail("Failed to setup Polkadot API");
    console.error(chalk.red("Error:"), error.message);
    throw error;
  }
}

async function installComponent(componentName, isDev = false) {
  console.log(chalk.cyan(`Installing ${componentName} component...`));

  try {
    // Validate project structure
    const structure = await validateProject();

    // Get component info from registry
    const componentUrl = `${REGISTRY_URL}/r/${componentName}.json`;

    // Determine shadcn command based on Tailwind version
    const tailwindVersion = await getTailwindVersion();
    const shadcnCmd = tailwindVersion === 4 ? "shadcn@canary" : "shadcn@latest";

    console.log(chalk.cyan(`Detected Tailwind CSS v${tailwindVersion}`));
    console.log(chalk.cyan(`Using ${shadcnCmd} for compatibility`));

    // Install component with shadcn
    const spinner = ora("Installing component with shadcn...").start();

    try {
      spinner.stop(); // Stop spinner before interactive prompts
      await execa("npx", [shadcnCmd, "add", componentUrl], {
        stdio: "inherit", // Show shadcn prompts for user interaction
      });
      console.log(chalk.green("✓ Component installed successfully"));
    } catch (error) {
      console.log(chalk.red("✗ Failed to install component with shadcn"));
      throw error;
    }

    // Check if this is a Polkadot component
    const needsSetup = await needsPolkadotSetup(componentName);
    if (needsSetup) {
      await setupPolkadotApi(null, structure, isDev);
    }

    console.log(
      chalk.green(
        `✅ ${componentName} component installed successfully${
          needsSetup ? " with Polkadot API setup" : ""
        }!`
      )
    );

    if (needsSetup) {
      console.log(chalk.cyan("\nNext steps:"));
      console.log(chalk.gray("1. Wrap your app with the PolkadotProvider:"));
      console.log(chalk.gray("   // In your app/layout.tsx or pages/_app.tsx"));
      console.log(
        chalk.gray(
          "   import { PolkadotProvider } from '@/providers/polkadot-provider';"
        )
      );
      console.log(
        chalk.gray("   <PolkadotProvider>{children}</PolkadotProvider>")
      );
      console.log(chalk.gray(""));
      console.log(chalk.gray("2. Import and use the component in your pages:"));
      console.log(
        chalk.gray(
          `   import { ${componentName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("")} } from '@/components/${componentName}';`
        )
      );
      console.log(chalk.gray(""));
      console.log(
        chalk.gray(
          "3. The component will automatically connect to the blockchain!"
        )
      );
    } else {
      console.log(chalk.cyan("\nNext steps:"));
      console.log(chalk.gray("1. Import and use the component in your pages:"));
      console.log(
        chalk.gray(
          `   import { ${componentName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("")} } from '@/components/${componentName}';`
        )
      );
    }
  } catch (error) {
    console.error(chalk.red("Failed to install component:"), error.message);
    process.exit(1);
  }
}

async function needsPolkadotSetup(componentName) {
  try {
    const response = await fetch(`${REGISTRY_URL}/r/${componentName}.json`);
    if (!response.ok) return false;

    const registry = await response.json();
    // Check if it requires polkadot-api or has polkadot-api in dependencies
    return (
      registry.requiresPolkadotApi === true ||
      registry.dependencies?.includes("polkadot-api")
    );
  } catch {
    return false;
  }
}

async function listComponents() {
  const spinner = ora("Fetching available components...").start();

  try {
    const response = await fetch(`${REGISTRY_URL}/registry.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }

    const registry = await response.json();
    spinner.succeed("Components loaded");

    console.log(chalk.green("\nAvailable Polkadot UI Components:\n"));

    // Handle the actual registry format with items array
    const items = registry.items || [];

    if (items.length === 0) {
      console.log(chalk.yellow("No components found in registry."));
      return;
    }

    // Group items by type or show all
    const polkadotComponents = items.filter((item) => item.requiresPolkadotApi);
    const regularComponents = items.filter((item) => !item.requiresPolkadotApi);

    if (polkadotComponents.length > 0) {
      console.log(chalk.cyan("Polkadot Components:"));
      polkadotComponents.forEach((item) => {
        const description = item.description || "No description available";
        console.log(chalk.gray(`  * ${item.name} - ${description}`));
      });
      console.log();
    }

    if (regularComponents.length > 0) {
      console.log(chalk.cyan("Other Components:"));
      regularComponents.forEach((item) => {
        const description = item.description || "No description available";
        console.log(chalk.gray(`  * ${item.name} - ${description}`));
      });
      console.log();
    }

    console.log(chalk.yellow("Usage:"));
    console.log(chalk.gray("  polkadot-ui add <component-name>"));
    console.log(
      chalk.gray(
        "  polkadot-ui add <component-name> --dev  # Use localhost registry"
      )
    );
  } catch (error) {
    spinner.fail("Failed to fetch components");
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
}

// Set up CLI commands
program
  .name("polkadot-ui")
  .description(
    "CLI for installing Polkadot UI components with automatic API setup"
  )
  .version("0.1.0");

program
  .command("list")
  .description("List all available components")
  .option("--dev", "Use local development registry")
  .action((options) => {
    if (options.dev) {
      REGISTRY_URL = "http://localhost:3000";
      console.log(chalk.cyan("Using development registry at localhost:3000"));
    }
    listComponents();
  });

program
  .command("add")
  .description("Add a component to your project")
  .argument("<component>", "Component name to install")
  .option("--dev", "Use local development registry")
  .action((component, options) => {
    if (options.dev) {
      REGISTRY_URL = "http://localhost:3000";
      console.log(chalk.cyan("Using development registry at localhost:3000"));
    }
    installComponent(component, options.dev);
  });

program.parse();
