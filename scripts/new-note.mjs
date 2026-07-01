#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { NOTE_TAGS } = require("../config/taxonomy.cjs");

const args = process.argv.slice(2);
const templatePath = path.join("templates", "note.md");

function printHelp() {
    console.log(`Create a new Software Foundry note.

Usage:
  npm run note -- --path content/ru/backend/service-boundary.md --title "Service Boundary" [options]

Options:
  --path <path>           Required. Full note path from project root.
  --title <text>          Required. Note title and default H1.
  --description <text>    Optional. Quartz description frontmatter.
  --tags <list>           Optional. Comma-separated tags from config/taxonomy.cjs.
  --help                  Show this help.

Examples:
  npm run note -- --path content/ru/backend/service-boundary.md --title "Service Boundary" --description "Русское описание" --tags architecture,backend
  npm run note -- --path content/en/linux/signals.md --title "Linux Signals" --tags linux
`);
}

function readArg(name, fallback = null) {
    const index = args.indexOf(`--${name}`);
    if (index === -1) return fallback;
    return args[index + 1] ?? fallback;
}

function hasArg(name) {
    return args.includes(`--${name}`);
}

if (hasArg("help")) {
    printHelp();
    process.exit(0);
}

function parseTags(raw) {
    if (!raw) return [];

    return raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
}

function validateTags(tags) {
    const unknown = tags.filter((tag) => !NOTE_TAGS.includes(tag));

    if (unknown.length > 0) {
        throw new Error(
            [
                `Unknown tags: ${unknown.join(", ")}`,
                "",
                "Allowed tags:",
                NOTE_TAGS.map((tag) => `- ${tag}`).join("\n"),
            ].join("\n"),
        );
    }
}

function validateNotePath(value) {
    if (path.isAbsolute(value) || value.split(/[\\/]/).includes("..")) {
        throw new Error("--path must be a safe relative path from the project root.");
    }

    if (!value.startsWith("content/")) {
        throw new Error("--path must point inside content/.");
    }

    if (!value.endsWith(".md")) {
        throw new Error("--path must end with .md");
    }

    if (path.basename(value, ".md").length === 0) {
        throw new Error("--path must include a non-empty file name before .md");
    }
}

function idFromPath(value) {
    return value
        .replace(/\.md$/i, "")
        .split(/[\\/]/)
        .filter((segment) => segment !== "content")
        .join(".");
}

function yamlQuote(value) {
    return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function formatYamlStringArray(values) {
    if (values.length === 0) {
        return " []";
    }

    return `\n${values.map((value) => `  - ${value}`).join("\n")}`;
}

function renderTemplate(template, variables) {
    return template.replace(/\{\{([a-z]+)\}\}/g, (match, key) => {
        if (!(key in variables)) {
            throw new Error(`Unknown template placeholder: ${match}`);
        }

        return variables[key];
    });
}

const title = readArg("title");
const notePath = readArg("path");
const description = readArg("description", "");
const tags = parseTags(readArg("tags", ""));

if (!notePath) {
    throw new Error("Missing --path");
}

if (!title) {
    throw new Error("Missing --title");
}

validateTags(tags);
validateNotePath(notePath);

const id = idFromPath(notePath);
const targetDir = path.dirname(notePath);
const targetPath = notePath;

if (fs.existsSync(targetPath)) {
    throw new Error(
        `File already exists: ${targetPath}. Choose another --path.`,
    );
}

fs.mkdirSync(targetDir, { recursive: true });

const template = fs.readFileSync(templatePath, "utf8");
const note = renderTemplate(template, {
    description: yamlQuote(description),
    draft: "true",
    id,
    tags: formatYamlStringArray(tags),
    title,
});

fs.writeFileSync(targetPath, note, "utf8");

console.log(`Created ${targetPath}`);
