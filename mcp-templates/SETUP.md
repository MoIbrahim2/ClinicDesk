# MCP Setup Templates For ClinicDesk

These templates are for **Windows** and are tailored to this repo:

- Project path: `D:\01_iti_task\team_poject\hackathon_project`

## What To Install First

1. Install **Node.js** so `npx` works.
2. Create a **GitHub personal access token** if you want GitHub MCP.
3. Get your **Stitch MCP URL** if Stitch gives you a remote MCP endpoint.

## Recommended MCPs For This Project

### Required

- `filesystem`
  - lets the agent read and edit this repo

### Strongly Recommended

- `github`
  - lets the agent inspect repos, issues, PRs, and project state

### Optional

- `openaiDeveloperDocs`
  - useful inside Codex for current OpenAI/Codex docs
- `stitch`
  - if Stitch gives you a remote MCP URL

## Codex

Use:

- [codex.config.toml.example](D:/01_iti_task/team_poject/hackathon_project/mcp-templates/codex.config.toml.example)

Where it goes:

- `C:\Users\<YOUR_USER>\.codex\config.toml`

Notes:

- Codex supports remote HTTP MCP directly with `url`.
- Local stdio servers use `command` and `args`.

## Claude Desktop

Use:

- [claude_desktop_config.example.json](D:/01_iti_task/team_poject/hackathon_project/mcp-templates/claude_desktop_config.example.json)

Where it goes:

- `%APPDATA%\Claude\claude_desktop_config.json`

Notes:

- Claude Desktop local config is for **local stdio MCP servers**.
- For **remote MCP connectors** like Stitch, use Claude's connector UI instead of this local JSON:
  - open Claude Desktop
  - go to connectors or integrations
  - add a custom remote MCP connector
  - paste the Stitch MCP URL there

## Antigravity

Use:

- [antigravity_mcp_config.example.json](D:/01_iti_task/team_poject/hackathon_project/mcp-templates/antigravity_mcp_config.example.json)

Where it likely goes:

- `C:\Users\<YOUR_USER>\.gemini\antigravity\mcp_config.json`

Notes:

- Antigravity examples in public integration guides use `serverUrl` for remote MCP servers.
- After editing the file, restart Antigravity.

## Stitch

If Stitch gives you a remote MCP URL, plug it in like this:

- Codex: `url = "YOUR_STITCH_MCP_URL"`
- Antigravity: `"serverUrl": "YOUR_STITCH_MCP_URL"`
- Claude Desktop: add it through the **custom connector UI**

## What To Replace

Replace these placeholders:

- `YOUR_GITHUB_TOKEN`
- `YOUR_STITCH_MCP_URL`
- `C:\\Users\\YOUR_USER`

## First Test

After connecting the configs:

1. Restart the client.
2. Check that `filesystem` is visible.
3. Ask the agent:
   - `List the files in this project`
4. Then test GitHub:
   - `Show available branches`
5. Then test Stitch:
   - `List available Stitch tools`

## Why These Templates Are Shaped This Way

- Codex remote MCP syntax was verified from the OpenAI Docs MCP page.
- Claude Desktop local MCP behavior was verified from Anthropic MCP help docs.
- Antigravity uses `serverUrl` and a global `mcp_config.json` in public integration examples; treat that part as best-effort guidance if your installed Antigravity build differs.

