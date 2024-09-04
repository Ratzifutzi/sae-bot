# SAE 2024
DiscordJs Bot built with typescript, using MongoDb for the database. License found in ./LICENSE

# Features
- Slashcommands with cooldown system
- Sharding
- Typing
- Routing
- Pretty output
- PM2 support

# Requirements
- MongoDb
- NodeJs
- Typescript Compiler

# Build
```bash
npm install
npx tsc
```

# Run
With Sharding (Recommended):
```bash
node index.js
```

With**out** Sharding:
```bash
node bot.js
```