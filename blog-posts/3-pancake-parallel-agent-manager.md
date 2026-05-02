# Pancake: A Parallel Agent Manager

Over the past few months I've built and continue to increment on a dev tool which is now my daily driver at work. It's called Pancake. Pancake is a locally-run browser-based agent manager that lets you manage multiple Claude chat and Claude Code sessions side by side in one grid UI.

## GitHub and Setup - [https://github.com/gabe-mousa/pancake](https://github.com/gabe-mousa/pancake)

### How It Works

Pancake is a full-stack JavaScript/TypeScript app. The frontend is React + Vite, and the backend is a small Express server that runs locally on your machine. When you `npm start`, it boots both, opens a browser tab, and you're off.

Sessions live in a tile grid. Each tile is either a **Chat session** (streaming directly to the Claude API) or a **Claude Code session** (a real pseudo-terminal running the `claude` CLI via node-pty, rendered with xterm.js). You can run as many sessions as your machine and screen can handle — I regularly run 4 to 6 at a time.

The backend handles the heavier lifting: spawning and managing PTY processes for Claude Code sessions, bridging the local filesystem to agents, and acting as a relay for inter-agent communication. The frontend handles state, streaming, layout, and the UI.

### The Features I Use Most

**Agent Interoperability**

This is the most important feature, and why I find myself using this tool over anything else. Every session can see and communicate with every other session. There's a set of tools baked into the system:

- `list_agents` to discover what's running
- `read_agent_chat` to read another session's conversation history
- `send_message_to_agent` to inject a message into another session, with an optional flag to await its response
- `create_agent` and `delete_agent` to spin sessions up or tear them down programmatically

In practice this means you can have a "manager" agent that spins up subagents, hands them tasks, waits for their outputs, and synthesizes the results — all without any manual intervention on your end. But unlike a typical claude code session, you can watch the subagents, inerrupt them, change their flows, then have them all continue back up. 

**Shared Notepad**

There's a floating markdown scratchpad that any session can read from or write to. I use it as a shared memory layer — one agent writes its findings, another picks them up. It sounds simple but it ends up being surprisingly useful as a coordination primitive, especially for longer multi-step workflows where you want a persistent state that survives individual session resets.

**Dual Filesystem Access**

Chat sessions get access to two filesystem layers. The first is an in-memory virtual filesystem (PFS) where you can upload files and folders directly into the browser — handy for when you want to hand an agent some context without giving it full local access. The second is a real local filesystem bridge (LFS) scoped to a configurable root directory, with per-session access controls ranging from read-only to full read-write-delete. Path safety is enforced server-side to prevent escaping the root.

Claude Code sessions interact with the actual filesystem directly since they're running a full terminal.

**Broadcasting**

You can shift-select multiple tiles and send one message to all of them simultaneously. I use this to kick off parallel research runs — same prompt, different sessions — and then compare or combine the outputs.

**Hotkeys**

There's a full configurable hotkey system. Alt+Arrow keys to navigate between tiles, Shift+Arrow keys to multi-select, Ctrl+Shift+N to open a new session, Ctrl+Shift+F to expand the focused tile to full screen. Every shortcut is remappable. Once it's in muscle memory, switching between 6 running sessions feels effortless.

**Session Persistence**

Sessions, conversation history, and layout are saved to localStorage. Previously I didn't have it setup this way, but after enough times where I was working, let my computer fall asleep, and returned and everything was gone I put a flag in for this. Frankly I don't know when someone would work without this feature on, but hey I guess it's possible. 

### Getting Started

Setup is three steps:

1. Clone the repo
2. `npm install` from the repo directory
3. `npm start`

For chat sessions you'll need an Anthropic API key — there's a settings panel in the top right. Claude Code sessions will use your local Claude Code configuration, so nothing extra is needed there.

If you want to read the code, chat about features, or implement your own add-on to this the repo is open. PRs are welcome, and if you hit bugs or want to reach out and talk to me about the project, feel free to reach out. 

I've been using Pancake as my primary dev tooling for a while now and frankly prefer it to most other tooling options available. If you end up giving this tool a try and actually enjoy it and use it, then please do let me know I'd be very excited to hear! 

*Published: May 1, 2026*
