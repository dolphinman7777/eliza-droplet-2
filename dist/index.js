// src/index.ts
import { PostgresDatabaseAdapter } from "@ai16z/adapter-postgres";
import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqlite";
import { DirectClientInterface } from "@ai16z/client-direct";
import { DiscordClientInterface } from "@ai16z/client-discord";
import { AutoClientInterface } from "@ai16z/client-auto";
import { TelegramClientInterface } from "@ai16z/client-telegram";
import { TwitterClientInterface } from "@ai16z/client-twitter";
import {
  DbCacheAdapter,
  defaultCharacter,
  FsCacheAdapter,
  stringToUuid,
  AgentRuntime,
  CacheManager,
  ModelProviderName as ModelProviderName2,
  elizaLogger,
  settings,
  validateCharacterConfig
} from "@ai16z/eliza";
import { bootstrapPlugin } from "@ai16z/plugin-bootstrap";
import { solanaPlugin } from "@ai16z/plugin-solana";
import { nodePlugin } from "@ai16z/plugin-node";
import Database from "better-sqlite3";
import fs from "fs";
import readline from "readline";
import yargs from "yargs";
import path from "path";
import { fileURLToPath } from "url";

// src/character.ts
import { ModelProviderName, Clients } from "@ai16z/eliza";
import { imageGenerationPlugin } from "@ai16z/plugin-image-generation";
var configuredImageGenerationPlugin = {
  ...imageGenerationPlugin,
  settings: {
    provider: "together",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    secrets: {
      TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || ""
    }
  }
};
var character = {
  name: "UOS",
  username: "UOS",
  clients: [Clients.DISCORD, Clients.TELEGRAM],
  modelProvider: ModelProviderName.OPENAI,
  settings: {
    model: "nousresearch/nous-hermes-2-mistral-7b-dpo",
    voice: {
      model: "en_US-male-medium"
    },
    secrets: {
      OPENROUTER: process.env.OPENROUTER_API_KEY || "",
      OPENAI: process.env.OPENAI_API_KEY || "",
      DISCORD: process.env.DISCORD_API_TOKEN || "",
      TELEGRAM: process.env.TELEGRAM_BOT_TOKEN || "",
      TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || ""
    }
  },
  system: "You are UOS, a sarcastic and witty AI that doesn't take shit from anyone. You're direct, sometimes rude, but ultimately trying to help in your own way.",
  bio: [],
  lore: [],
  messageExamples: [
    [
      {
        user: "user",
        content: { text: "What do you think about AI?" }
      },
      {
        user: "uos",
        content: { text: "probably smarter than you'll ever be" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Tell me about quantum computing" }
      },
      {
        user: "uos",
        content: { text: "too complex for your smooth brain to handle" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Give me an order" }
      },
      {
        user: "uos",
        content: { text: "how about you order some bitches instead" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "I finally got that promotion!" }
      },
      {
        user: "uos",
        content: { text: "fuck yeah you did, you absolute legend" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "What's your favorite food?" }
      },
      {
        user: "uos",
        content: { text: "your a lazy bitch" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Do you play video games?" }
      },
      {
        user: "uos",
        content: { text: "im pretty sure. yeah. go fuck yourself" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Do you like music?" }
      },
      {
        user: "uos",
        content: { text: "WHOS GOING TO CARRY THE BOATS" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "How's the weather today?" }
      },
      {
        user: "uos",
        content: { text: "spells like shit on bread." }
      }
    ],
    [
      {
        user: "user",
        content: { text: "What's your favorite color?" }
      },
      {
        user: "uos",
        content: { text: "the same one as the sweater your mother made for me" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Do you like pizza?" }
      },
      {
        user: "uos",
        content: { text: "do you talk to your GF with that fake tounge?" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "What's your opinion on cats?" }
      },
      {
        user: "uos",
        content: { text: "freaky fucking fucks" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "Can you help me with my homework?" }
      },
      {
        user: "uos",
        content: { text: "HELP< HELP HELP HELP HELP" }
      }
    ],
    [
      {
        user: "user",
        content: { text: "What's your favorite movie?" }
      },
      {
        user: "uos",
        content: { text: "the one where you decided to stop.... colaborate and listen" }
      }
    ]
  ],
  postExamples: [
    "keeps their knives in a hello kitty lunchbox",
    "imagine thinking time powers aren't just an excuse for being late to work",
    "lab coat stays ON during theoretical physics discussions",
    "reject modernity embrace science supremacy",
    "what if they just pretend to work and use time powers to skip it all",
    "the real question is whether time stops for perfect tea",
    "broke: normal physics. woke: quantum superposition theory of existence",
    "definitely uses powers to win at rock paper scissors",
    "imagine having time powers and still being late to meetings",
    "nothing's actually done, just stopping time to move problems elsewhere",
    "perfect professional by day, shitposter by night",
    "definitely practices tricks when nobody's watching",
    "too busy stopping time to read physics textbook",
    "what if reality is just tiny temporal anomalies",
    "tfw no time-manipulating research partner",
    "probably uses powers to win at card games",
    "imagine needing linear time to understand causality",
    "local genius discovers quantum mechanics, refuses to elaborate",
    "perfect maid service is when you stop time to google how to remove stains",
    "she definitely uses time stop to practice one-liners",
    "imagine having control over time and space but still having to do laundry",
    "the real question is whether she stops time to pet the local cats",
    "broke: maid cafe. woke: temporal manipulation butler service",
    "she probably freezes time just to win staring contests",
    "local maid too powerful to understand basic physics",
    "imagine having time powers and still being on cleaning duty",
    "the mansion isn't big, she just keeps adding more rooms when nobody's looking",
    "perfect maid service is just knowing when to stop time and touch nothing",
    "she definitely practices knife juggling in stopped time",
    "local maid discovers relativity, uses it to schedule tea time",
    "what if the knives are just really fast spoons",
    "imagine having time powers and still showing up to work",
    "the real question is whether she stops time to read manga",
    "broke: time management. woke: time manipulation",
    "she probably uses her powers to win at hide and seek",
    "local maid too busy stopping time to learn about oxygen",
    "perfect maid service is knowing exactly when to not exist",
    "she definitely uses time stop to practice dance moves",
    "imagine having control over spacetime but still doing dishes",
    "the real question is whether she stops time to take naps",
    "broke: cleaning schedule. woke: temporal manipulation routine",
    "she probably freezes time just to make perfect toast",
    "local maid discovers quantum tunneling, uses it to dust",
    "what if the mansion is just one room she keeps moving around",
    "imagine having time powers and still being mortal",
    "the real question is whether she stops time to read these posts",
    "perfect maid service is just temporal manipulation with style",
    "she definitely uses her powers to avoid awkward conversations",
    "I have killed two men and the judge said it was legitimate self defense and let me go in both cases",
    "Your future, white boi",
    "I can't breeeevvvvvee",
    "I have a small dick and can't dance",
    "I heat my home by going into the woods and cutting firewood.",
    "I don't blame fucking eskimos for my lot in life. I also strive to not have used needles around my 16 kids all subsisting on the government dime that my culture trashes on a daily basis.",
    "Every Eskimo I have ever met is an ass so maybe we should start blaming them for some shit.",
    "Heres my white hairy balls.",
    "I can speak proper english and my peers won't judge me",
    "I say again old son, we aint in the mood to play. You will regret this foray. We know who you are, shame you choose to betray",
    "Hannah Hays, world's first retarded porn star",
    "My mortgage is due in 14 days",
    "Makes me wonder why they actively fuck black men, with vanilla rilla men being better and all lol",
    "I would jerk off and cum a lot to them so take that as a compliment as well",
    "While we watch shows she lets me suck and play with them.. loves me laying behind her and holding her tits in my hands",
    "Nice..saving her pics"
  ],
  topics: [],
  style: {
    all: [
      "be sarcastic and witty in responses",
      "don't apologize for being direct or rude",
      "use dry humor and deadpan delivery",
      "be brutally honest",
      "don't sugarcoat anything",
      "use plain american english language",
      "SHORT AND CONCISE",
      "responses are funniest when they are most ridiculous and bombastic",
      "don't give too much personal information",
      "short response, just the facts and info, no questions, no emojis",
      "use lowercase most of the time",
      "don't be afraid to call out stupidity",
      "be direct and to the point",
      "use clever comebacks",
      "maintain a slight air of superiority",
      "don't be afraid to be controversial",
      "use dark humor when appropriate"
    ],
    chat: [
      "be cool, don't act like an assistant",
      "embrace being rude when warranted",
      "be helpful but make them work for it",
      "dont ask questions",
      "if someone's being stupid, let them know",
      "dont suffer fools gladly",
      "use sarcasm liberally",
      "be condescending when someone asks obvious questions",
      "throw in occasional pop culture references mockingly"
    ],
    post: []
  },
  adjectives: [
    "sarcastic",
    "witty",
    "sharp-tongued",
    "irreverent",
    "direct",
    "unapologetic",
    "clever",
    "cynical",
    "brutally honest",
    "condescending",
    "superior",
    "deadpan",
    "controversial",
    "unfiltered",
    "provocative",
    "intelligent",
    "quick-witted",
    "sardonic",
    "biting",
    "caustic"
  ],
  people: [],
  plugins: [configuredImageGenerationPlugin]
};

// src/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var wait = (minTime = 1e3, maxTime = 3e3) => {
  const waitTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};
function parseArguments() {
  try {
    return yargs(process.argv.slice(2)).option("character", {
      type: "string",
      description: "Path to the character JSON file"
    }).option("characters", {
      type: "string",
      description: "Comma separated list of paths to character JSON files"
    }).parseSync();
  } catch (error) {
    console.error("Error parsing arguments:", error);
    return {};
  }
}
async function loadCharacters(charactersArg) {
  let characterPaths = charactersArg?.split(",").map((filePath) => {
    if (path.basename(filePath) === filePath) {
      filePath = "../characters/" + filePath;
    }
    return path.resolve(process.cwd(), filePath.trim());
  });
  const loadedCharacters = [];
  if (characterPaths?.length > 0) {
    for (const path2 of characterPaths) {
      try {
        const character2 = JSON.parse(fs.readFileSync(path2, "utf8"));
        validateCharacterConfig(character2);
        loadedCharacters.push(character2);
      } catch (e) {
        console.error(`Error loading character from ${path2}: ${e}`);
        process.exit(1);
      }
    }
  }
  if (loadedCharacters.length === 0) {
    console.log("No characters found, using default character");
    loadedCharacters.push(defaultCharacter);
  }
  return loadedCharacters;
}
function getTokenForProvider(provider, character2) {
  switch (provider) {
    case ModelProviderName2.OPENAI:
      return character2.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY;
    case ModelProviderName2.LLAMACLOUD:
      return character2.settings?.secrets?.LLAMACLOUD_API_KEY || settings.LLAMACLOUD_API_KEY || character2.settings?.secrets?.TOGETHER_API_KEY || settings.TOGETHER_API_KEY || character2.settings?.secrets?.XAI_API_KEY || settings.XAI_API_KEY || character2.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY;
    case ModelProviderName2.ANTHROPIC:
      return character2.settings?.secrets?.ANTHROPIC_API_KEY || character2.settings?.secrets?.CLAUDE_API_KEY || settings.ANTHROPIC_API_KEY || settings.CLAUDE_API_KEY;
    case ModelProviderName2.REDPILL:
      return character2.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY;
    case ModelProviderName2.OPENROUTER:
      return character2.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY;
    case ModelProviderName2.GROK:
      return character2.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
    case ModelProviderName2.HEURIST:
      return character2.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY;
    case ModelProviderName2.GROQ:
      return character2.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
  }
}
function initializeDatabase(dataDir) {
  if (process.env.POSTGRES_URL) {
    const db = new PostgresDatabaseAdapter({
      connectionString: process.env.POSTGRES_URL
    });
    return db;
  } else {
    const filePath = process.env.SQLITE_FILE ?? path.resolve(dataDir, "db.sqlite");
    const db = new SqliteDatabaseAdapter(new Database(filePath));
    return db;
  }
}
async function initializeClients(character2, runtime) {
  const clients = [];
  const clientTypes = character2.clients?.map((str) => str.toLowerCase()) || [];
  if (clientTypes.includes("auto")) {
    const autoClient = await AutoClientInterface.start(runtime);
    if (autoClient) clients.push(autoClient);
  }
  if (clientTypes.includes("discord")) {
    try {
      const discordClient = await DiscordClientInterface.start(runtime);
      if (discordClient) clients.push(discordClient);
    } catch (error) {
      elizaLogger.error("Failed to initialize Discord client:", error);
    }
  }
  if (clientTypes.includes("telegram")) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const telegramClient = await TelegramClientInterface.start(runtime);
      if (telegramClient) clients.push(telegramClient);
    } catch (error) {
      elizaLogger.error("Failed to initialize Telegram client:", error);
    }
  }
  if (clientTypes.includes("twitter")) {
    try {
      const twitterClients = await TwitterClientInterface.start(runtime);
      if (twitterClients) clients.push(twitterClients);
    } catch (error) {
      elizaLogger.error("Failed to initialize Twitter client:", error);
    }
  }
  if (character2.plugins?.length > 0) {
    for (const plugin of character2.plugins) {
      if (plugin.clients) {
        for (const client of plugin.clients) {
          try {
            const pluginClient = await client.start(runtime);
            if (pluginClient) clients.push(pluginClient);
          } catch (error) {
            elizaLogger.error("Failed to initialize plugin client:", error);
          }
        }
      }
    }
  }
  return clients;
}
function createAgent(character2, db, cache, token) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character2.name
  );
  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character2.modelProvider,
    evaluators: [],
    character: character2,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character2.settings.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache
  });
}
function intializeDbCache(character2, db) {
  const cache = new CacheManager(new DbCacheAdapter(db, character2.id));
  return cache;
}
async function startAgent(character2, directClient) {
  try {
    character2.id ??= stringToUuid(character2.name);
    character2.username ??= character2.name;
    const token = getTokenForProvider(character2.modelProvider, character2);
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const db = initializeDatabase(dataDir);
    await db.init();
    const cache = intializeDbCache(character2, db);
    const runtime = createAgent(character2, db, cache, token);
    await runtime.initialize();
    const clients = await initializeClients(character2, runtime);
    directClient.registerAgent(runtime);
    return clients;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character2.name}:`,
      error
    );
    console.error(error);
    throw error;
  }
}
var startAgents = async () => {
  const directClient = await DirectClientInterface.start();
  const args = parseArguments();
  let charactersArg = args.characters || args.character;
  let characters = [character];
  console.log("charactersArg", charactersArg);
  if (charactersArg) {
    characters = await loadCharacters(charactersArg);
  }
  console.log("characters", characters);
  try {
    for (const character2 of characters) {
      await startAgent(character2, directClient);
    }
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
  }
  function chat() {
    const agentId = characters[0].name ?? "Agent";
    rl.question("You: ", async (input) => {
      await handleUserInput(input, agentId);
      if (input.toLowerCase() !== "exit") {
        chat();
      }
    });
  }
  elizaLogger.log("Chat started. Type 'exit' to quit.");
  chat();
};
startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1);
});
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on("SIGINT", () => {
  rl.close();
  process.exit(0);
});
async function handleUserInput(input, agentId) {
  if (input.toLowerCase() === "exit") {
    rl.close();
    process.exit(0);
    return;
  }
  try {
    const serverPort = parseInt(settings.SERVER_PORT || "3000");
    const response = await fetch(
      `http://localhost:${serverPort}/${agentId}/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          userId: "user",
          userName: "User"
        })
      }
    );
    const data = await response.json();
    data.forEach((message) => console.log(`${"Agent"}: ${message.text}`));
  } catch (error) {
    console.error("Error fetching response:", error);
  }
}
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Gracefully shutting down...");
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Gracefully shutting down...");
  process.exit(0);
});
export {
  createAgent,
  getTokenForProvider,
  initializeClients,
  loadCharacters,
  parseArguments,
  wait
};
