const { COMMIT_SCOPES } = require("./config/taxonomy.cjs");

module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "feat",
                "fix",
                "docs",
                "refactor",
                "perf",
                "test",
                "build",
                "ci",
                "chore",
                "style",
                "revert",
            ],
        ],

        "scope-enum": [
            1,
            "always",
            {
                scopes: COMMIT_SCOPES,
                delimiters: ["|"],
            },
        ],

        "scope-case": [2, "always", "kebab-case"],
        "subject-case": [0],
        "subject-empty": [2, "never"],
        "subject-full-stop": [2, "never", "."],
        "header-max-length": [2, "always", 100],
    },
};
