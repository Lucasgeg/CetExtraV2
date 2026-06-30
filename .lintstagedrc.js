module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "bun tsc --noEmit",

  // Lint & format TS and JS files
  "**/*.(ts|tsx|js)": (filenames) => [
    `bun biome check --write --unsafe ${filenames.join(" ")}`
  ],

  // Format JSON files
  "**/*.json": (filenames) => `bun biome format --write ${filenames.join(" ")}`
};
