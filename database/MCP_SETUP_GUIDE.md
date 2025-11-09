# Supabase MCP Setup Guide

The Supabase MCP (Model Context Protocol) lets Claude Code directly query and modify your Supabase database, making schema management much easier!

## What You Need

1. **Supabase Personal Access Token** (different from your project API keys)
2. **Claude Code** (which you already have!)

## Step 1: Get Your Supabase Personal Access Token

### Option A: Use Existing Token (If You Have One)
If you already created a personal access token, use that.

### Option B: Create New Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate New Token"**
3. Name it: `Claude Code MCP`
4. Scopes: Select **all** (or at least: projects, organizations, database)
5. Click **Generate**
6. **Copy the token** (you won't see it again!)

## Step 2: Find Your MCP Settings File

The MCP config file location depends on your OS:

**Mac** (you):
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Or try:**
```
~/.config/claude-code/mcp_settings.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

## Step 3: Add Supabase MCP Configuration

### Find the File First

Open Terminal and run:
```bash
# Check if it exists
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or check alternative location
ls -la ~/.config/claude-code/mcp_settings.json
```

### Edit the Config

Once you find the file, open it and add the Supabase MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      ]
    }
  }
}
```

**Replace `YOUR_PERSONAL_ACCESS_TOKEN_HERE` with your actual token!**

### If File Doesn't Exist

Create it:

```bash
# For Claude Desktop
mkdir -p ~/Library/Application\ Support/Claude
echo '{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      ]
    }
  }
}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## Step 4: Restart Claude Code

1. **Quit Claude Code completely** (Cmd+Q on Mac)
2. **Reopen Claude Code**
3. MCP should connect automatically

## Step 5: Verify It's Working

After restarting, Claude Code should now have access to Supabase tools. You can ask:

> "List all tables in my Supabase project"

Or:

> "Show me the schema for the checkins table"

And Claude will be able to query Supabase directly!

## Troubleshooting

### "Command not found: npx"
Install Node.js: https://nodejs.org/

### "Invalid access token"
1. Make sure you used a **Personal Access Token** (not project API key)
2. Check there are no extra spaces when copying
3. Generate a new token if needed

### "MCP server not connecting"
1. Check the file path is correct
2. Ensure JSON syntax is valid (no trailing commas)
3. Check Claude Code logs: Help → Show Logs

### "Permission denied"
Make sure the config file has read permissions:
```bash
chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## What You'll Be Able to Do

Once MCP is set up, you can ask Claude Code to:
- ✅ List all tables and views
- ✅ Show table schemas
- ✅ Run SQL queries
- ✅ Create migrations
- ✅ Check RLS policies
- ✅ View database stats

No more copy/pasting SQL into Supabase dashboard - Claude can do it directly!

## Security Note

⚠️ **Never commit the config file to git!** It contains your access token.

The config file is stored locally on your machine, outside your project directory, so it won't be committed.

---

## Quick Reference

**Personal Access Token URL:**
https://supabase.com/dashboard/account/tokens

**Config File Location (Mac):**
`~/Library/Application Support/Claude/claude_desktop_config.json`

**After Setup:**
1. Quit Claude Code (Cmd+Q)
2. Reopen
3. Ask: "List my Supabase tables"
