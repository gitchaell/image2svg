export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		//   TODO Add Scope Enum Here
		// 'scope-enum': [2, 'always', ['yourscope', 'yourscope']],
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"docs",
				"chore",
				"style",
				"refactor",
				"ci",
				"test",
				"revert",
				"perf",
			],
		],
		"header-max-length": [0, "always", Infinity],
		"body-max-length": [0, "always", Infinity],
		"footer-max-length": [0, "always", Infinity],
	},
};
