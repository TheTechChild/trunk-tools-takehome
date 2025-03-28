# Commit Message Standards

This document outlines the commit message standards used in this repository. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification to maintain a clean git history and enable automated versioning and changelog generation.

## Commit Message Format

Each commit message should follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type

The `type` field must be one of the following:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `build`: Changes to build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify source or test files

### Scope

The `scope` field is optional and should be a noun describing the section of the codebase the commit affects. Examples:
- `feat(auth)`: New authentication feature
- `fix(api)`: Bug fix in the API
- `docs(readme)`: Documentation changes in the README

### Description

The `description` field should:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Not capitalize the first letter
- Have no dot (.) at the end

### Body

The `body` field is optional and should:
- Be wrapped at 100 characters
- Include the motivation for the change
- Contrast with previous behavior

### Footer

The `footer` field is optional and can contain:
- Breaking changes
- Related issues
- Deprecation notices

## Examples

```
feat(auth): add JWT authentication middleware

Implement JWT-based authentication with refresh token support.
Add middleware to validate tokens and attach user to request.

Closes #123
```

```
fix(api): handle null response from Coinbase API

- Add null check for exchange rate response
- Return appropriate error message
- Add test case for null response

Fixes #456
```

```
docs(readme): update installation instructions

Update README with new environment variables and
Docker Compose configuration requirements.
```

## Enforcement

Commit message standards are enforced through:

1. Local commitlint configuration (`commitlint.config.cjs`)
2. GitHub Actions workflow (`.github/workflows/commit-lint.yml`)
3. Pre-commit hooks (if configured)

The CI pipeline will fail if commit messages do not follow these standards.

## Benefits

Following these standards provides several benefits:

- Automated versioning based on commit types
- Automated changelog generation
- Clear communication of changes
- Easier code review process
- Better git history readability
- Integration with various tools and services