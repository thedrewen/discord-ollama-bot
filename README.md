# discord-ollama-bot

A Discord bot that integrates [Ollama](https://ollama.com) to bring local AI models directly into your Discord server. Send prompts via slash commands and get AI-generated responses, with built-in conversation history and a request queue system.

> Built on top of [discordbot-ts-template](https://gitea.under-scape.com/UnderScape/discordbot-ts-template).

## Features

- 🤖 Slash command `/prompt` to interact with an Ollama model
- 🧠 Persistent conversation history (last 50 messages kept)
- 🗂️ Request queue — users are notified of their position while the model is busy
- 📝 Customizable system prompt via `data/prompt.md`
- 🐳 Docker-ready for easy deployment
- 📘 TypeScript for type safety

## Prerequisites

- [Node.js](https://nodejs.org) 18 or higher
- A running [Ollama](https://ollama.com) instance
- A Discord bot token and application client ID

## Installation

```bash
git clone https://github.com/thedrewen/discord-ollama-bot
cd discord-ollama-bot
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_client_id
GUILD_ID=your_discord_guild_id
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b
```

Then create the data directory and required files:

```bash
mkdir -p data
echo '[]' > data/history.json
echo 'You are a helpful assistant.' > data/prompt.md
```

Edit `data/prompt.md` to set your custom system prompt for the model.

## Usage

Start the bot:

```bash
npm run start
```

Use the `/prompt` slash command in Discord to send a message to the AI. The model is configured via the `OLLAMA_MODEL` environment variable. Make sure it is pulled in your Ollama instance:

```bash
ollama pull gemma4:e2b
```

## Docker Deployment

### Build and run

```bash
docker buildx build -t discord-ollama-bot . && docker run -d \
  --restart unless-stopped \
  --name discord-ollama-bot \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  discord-ollama-bot
```

### Container management

```bash
# View logs
docker logs -f discord-ollama-bot

# Stop
docker stop discord-ollama-bot

# Start
docker start discord-ollama-bot

# Remove
docker rm discord-ollama-bot
```

### Complete rebuild

```bash
docker stop discord-ollama-bot && docker rm discord-ollama-bot && \
docker buildx build -t discord-ollama-bot . && \
docker run -d --restart unless-stopped --name discord-ollama-bot \
  --env-file .env -v $(pwd)/data:/app/data discord-ollama-bot
```

## License

MIT