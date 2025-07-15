module.exports = {
	extends: ['@n8n_io/eslint-config/node'],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	rules: {
		// Regras específicas do projeto
		'@typescript-eslint/no-unsafe-assignment': 'warn',
		'@typescript-eslint/no-unsafe-member-access': 'warn',
		'@typescript-eslint/no-unsafe-call': 'warn',
		'@typescript-eslint/no-unsafe-return': 'warn',
		'@typescript-eslint/no-unsafe-argument': 'warn',
		'import/no-extraneous-dependencies': 'off',
		'import/prefer-default-export': 'off',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'default',
				format: ['camelCase'],
			},
			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE'],
			},
			{
				selector: 'parameter',
				format: ['camelCase'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'property',
				format: ['camelCase', 'snake_case'],
			},
			{
				selector: 'typeProperty',
				format: ['camelCase', 'snake_case'],
			},
			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
		],
	},
	ignorePatterns: ['dist/**', 'node_modules/**'],
};