---
title: Regle MCP server
description: Integrate Regle MCP with your favorite AI assistant
---

# MCP Server

Regle offers an MCP server that can be used to get documentation and autocomplete in your favorite AI assistant editor.

The MCP server provides the following features:

- Create form validation rules
- Search documentation
- Get precise information on any rule
- Create custom rules
- API information on every Regle helper

## Cursor

<a href="https://cursor.com/en-US/install-mcp?name=regle&config=eyJjb21tYW5kIjoibnB4IEByZWdsZS9tY3Atc2VydmVyIn0%3D">
  <div class="light-only">
      <img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install MCP Server" />
  </div>
  <div class="dark-only">
      <img src="https://cursor.com/deeplink/mcp-install-light.svg" alt="Install MCP Server" />
  </div>
</a>

Or add to your `.cursor/mcp.json`

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

## Claude Desktop

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
