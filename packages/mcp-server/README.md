# @regle/mcp-server

MCP (Model Context Protocol) Server for [Regle](https://reglejs.dev) - providing AI-powered assistance for Vue.js form validation.

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

