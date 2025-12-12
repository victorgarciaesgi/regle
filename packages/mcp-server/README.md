# @regle/mcp-server

MCP (Model Context Protocol) Server for [Regle](https://reglejs.dev) - providing AI-powered assistance for Vue form validation.


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

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=regle&config=eyJjb21tYW5kIjoibnB4IEByZWdsZS9tY3Atc2VydmVyIn0%3D)

Or add to your MCP settings:

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

