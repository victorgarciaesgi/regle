# @regle/mcp-server

MCP (Model Context Protocol) Server for [Regle](https://reglejs.dev) - providing AI-powered assistance for Vue.js form validation.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open protocol that enables AI assistants to interact with external tools and resources. This server provides Regle-specific tools and documentation to help AI assistants better understand and generate Regle validation code.

## Installation

```bash
# npm
npm install @regle/mcp-server

# pnpm
pnpm add @regle/mcp-server

# yarn
yarn add @regle/mcp-server
```

## Usage with AI Assistants

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "regle": {
      "command": "npx",
      "args": ["@regle/mcp-server"]
    }
  }
}
```

### Cursor

Add to your MCP settings:

```json
{
  "mcpServers": {
    "regle": {
      "command": "npx",
      "args": ["@regle/mcp-server"]
    }
  }
}
```

## Available Tools

### `get_rule_info`

Get detailed information about a specific Regle validation rule.

**Parameters:**
- `ruleName` (string): The name of the rule (e.g., "required", "email", "minLength")

**Example:**
```
Get info about the "email" rule
```

### `search_rules`

Search for Regle validation rules by name or description.

**Parameters:**
- `query` (string): Search query

**Example:**
```
Search for rules related to "length"
```

### `list_rules`

List all available built-in Regle validation rules.

### `generate_form_validation`

Generate a Vue component with Regle form validation based on field definitions.

**Parameters:**
- `fields` (array): Array of field definitions with:
  - `name` (string): Field name
  - `type` (string): Field type (string, number, boolean, date, email, url, password, array)
  - `required` (boolean, optional): Whether the field is required
  - `minLength` (number, optional): Minimum length
  - `maxLength` (number, optional): Maximum length
  - `min` (number, optional): Minimum value (for numbers)
  - `max` (number, optional): Maximum value (for numbers)
- `componentName` (string, optional): Name of the component

**Example:**
```
Generate a login form with email and password fields
```

### `generate_custom_rule`

Generate a custom Regle validation rule.

**Parameters:**
- `ruleName` (string): Name of the custom rule
- `async` (boolean, optional): Whether the rule is async
- `hasParams` (boolean, optional): Whether the rule accepts parameters
- `paramName` (string, optional): Name of the parameter
- `paramType` (string, optional): Type of the parameter
- `errorMessage` (string): Error message when validation fails

## Available Resources

The server provides documentation resources that AI assistants can read:

- `regle://docs/introduction` - Introduction to Regle
- `regle://docs/core-concepts` - Understanding useRegle
- `regle://docs/built-in-rules` - Built-in rules reference
- `regle://docs/validation-properties` - Validation properties reference

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck
```

## License

MIT

