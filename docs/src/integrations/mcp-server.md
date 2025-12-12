---
title: Regle MCP server
description: Integrate Regle MCP with your favorite AI assistant
---


# MCP Server

Regle offers an MCP server that can be used to get documentation and autocomplete for Regle.

## Features

The MCP server provides the following features:

- Create form validation rules
- Search documentation
- Get precise information on any rule
- Create custom rules
- API information on every Regle helper


## Cursor

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=regle-mcp-server&config=eyJjb21tYW5kIjoicG5weCBAcmVnbGUvbWNwLXNlcnZlciJ9)

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




