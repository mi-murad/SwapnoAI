import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { authRouter } from "./src/server/routes/authRoutes";
import { workspaceRouter } from "./src/server/routes/workspaceRoutes";
import { aiProviderRouter } from "./src/server/routes/aiProviderRoutes";
import { db } from "./src/server/db/database";
import { authService } from "./src/server/auth/authService";
import { requireAuth } from "./src/server/middleware/authMiddleware";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { SwapnoAppState, ContentItem, MemoryLog, PersonaProfile, MarketingChannel, CampaignTheme } from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const DB_FILE = path.join(process.cwd(), "db.json");
const isPublicDemo = process.env.NODE_ENV === "production" || process.env.PUBLIC_DEMO_MODE === "true";
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = process.env.FRONTEND_ORIGINS
  ?.split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins ?? (isProduction ? [] : [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173"
]);

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many API requests. Try again later." }
  }
});
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "AUTH_RATE_LIMIT_EXCEEDED", message: "Too many authentication attempts. Try again later." }
  }
});
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "AI_RATE_LIMIT_EXCEEDED", message: "AI request limit reached. Try again shortly." }
  }
});

// Middleware
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS) || 0);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      error: { code: "ORIGIN_NOT_ALLOWED", message: "This application origin is not allowed." }
    });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Workspace-ID");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(origin ? 204 : 403);
  }
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", mode: isPublicDemo ? "public-demo" : "development" });
});

app.use("/api", apiRateLimit);
app.use("/api/v1/auth", authRateLimit);
app.use(["/api/ai", "/api/v1/ai"], aiRateLimit);
app.use("/api", (req, res, next) => {
  if (isPublicDemo) {
    return res.status(404).json({
      success: false,
      error: { code: "DEMO_MODE", message: "Backend APIs are disabled in the public sample demo." }
    });
  }
  next();
});

// Mount SaaS v1 Multi-Tenant APIs
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/ai/providers", aiProviderRouter);
app.use(["/api/state", "/api/reset"], (_req, res) => {
  return res.status(410).json({
    success: false,
    error: { code: "LEGACY_API_DISABLED", message: "Legacy shared-state APIs are disabled." }
  });
});
app.use("/api/ai", requireAuth);

// Initialize Gemini API Client gracefully
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found or is placeholder. Server will fallback to intelligent simulated responses.");
}

// Default initial state for a brilliant demo
const defaultState: SwapnoAppState = {
  businessSetup: {
    name: "NiRBAAN Design Studio",
    industry: "Interior Design",
    targetAudience: "Luxury Homeowners",
    description: "A premium sustainable interior design studio in Bangladesh, crafting bespoke, minimalist architectural environments. We combine international minimalist aesthetics with local Bangladeshi heritage craftsmanship, utilizing raw, sustainable, non-toxic materials.",
    tone: "Professional, Luxury, Minimal",
    colors: ["#171717", "#5c6f59", "#dfd7ca"],
    keywords: ["SustainableLuxury", "MinimalistInterior", "BespokeArchitect", "BangladeshiHeritage", "EcoPremiumDesign"]
  },
  businessBrain: {
    elevatorPitch: "NiRBAAN Design Studio designs bespoke, sustainable interior environments that merge international minimalist aesthetics with Bangladeshi craftsmanship for discerning luxury homeowners.",
    valueProposition: "Crafting eye-safe, sustainable living sanctuaries. We utilize natural local timbers, energy-efficient architecture, and non-toxic finishes to deliver luxury spaces that honor both human well-being and the planet.",
    competitorList: ["Global Architectural Importers", "Bespoke Premium Builders", "Traditional Classical Design Houses"],
    synced: true
  },
  research: {
    marketOverview: "Bangladesh's premium real estate market is seeing a massive surge in demand for sustainable luxury. Homeowners are moving away from heavy, over-decorated classical interiors toward biophilic, clean, and minimalist architectural sanctuaries.",
    competitorAnalysis: "Traditional design firms in Dhaka focus on heavy gilding, artificial veneers, and imported synthetic materials. NiRBAAN stands out uniquely by offering carbon-neutral, zero-emission local materials and hand-crafted timber architecture inspired by Norm Architects and Studio MK27.",
    trendingHashtags: ["#SustainableLuxury", "#MinimalistInterior", "#BangladeshiArchitecture", "#BiophilicDesign", "#BespokeSanctuary"],
    personaProfiles: [
      {
        name: "Farhan Ahmed",
        age: "45",
        goals: "Build a multi-generational eco-friendly residential estate in Gulshan that incorporates daylight optimization and local clay crafts.",
        painPoints: "Frustrated by the lack of local designers who understand biophilic layouts; struggles to source authentic, non-toxic premium timbers.",
        mediaChannels: ["LinkedIn", "Instagram", "Architectural Digest"]
      },
      {
        name: "Nadia Rahman",
        age: "38",
        goals: "Redesign her duplex penthouse to feel like a quiet, organic sanctuary away from Dhaka's urban congestion.",
        painPoints: "Suffer from dust allergies and chemical sensitivities; requires strict zero-VOC finishes and natural air purification systems.",
        mediaChannels: ["Instagram", "Pinterest", "LinkedIn"]
      }
    ],
    approved: true,
    notes: "Deep-dive premium luxury market research finalized."
  },
  strategy: {
    channels: [
      { name: "LinkedIn", frequency: "2 posts per week", focus: "Corporate biophilic design, green architectural investments, executive office retreats." },
      { name: "Instagram", frequency: "4 posts per week", focus: "Slow-panning video walk-throughs, close-ups of handcrafted timber joints, ambient lighting moodboards." },
      { name: "Facebook", frequency: "2 posts per week", focus: "Client case studies, artisan collaboration highlights, ecological material deep-dives." }
    ],
    pillars: ["Soft Minimalism", "Sustainable Craftsmanship", "Biophilic Sanctuaries", "Bangladeshi Heritage Fusion"],
    campaignThemes: [
      { title: "Quiet Sanctuaries in Dhaka", objective: "Position NiRBAAN as the premier escape from urban noise", keyMessage: "The ultimate luxury is peace. Crafting minimalist, sustainable spaces where your mind can breathe." },
      { title: "Sustainable Timber Heritage", objective: "Educate clients on carbon-neutral premium wood craftsmanship", keyMessage: "Global minimalism meeting Bangladeshi hands. Our timber is sustainably harvested and hand-shaped by local masters." }
    ],
    approved: true,
    notes: "CMO aligned premium interior design campaign themes and biophilic channels."
  },
  contentPlan: [
    {
      id: "post-1",
      title: "The philosophy of soft minimalism in Bangladeshi homes",
      platform: "LinkedIn",
      scheduledDate: "2026-07-10",
      pillar: "Soft Minimalism",
      status: "approved",
      generationStatus: "generated",
      contentCopy: "Dhaka is one of the most vibrant, high-energy cities in the world. But when you cross your threshold, your home should belong to another rhythm. 🌿\n\nAt NiRBAAN Design Studio, we practice soft minimalism—an architectural philosophy inspired by Norm Architects and Studio MK27, but grounded deeply in Bangladeshi heritage.\n\nBy prioritizing raw natural textures, light optimization, and breathable negative space, we don't just decorate rooms. We design sanctuaries where your mind can finally find peace.\n\nRead our executive design briefing on investing in sustainable residential architecture.\n\n#SustainableLuxury #MinimalistInterior #BangladeshiArchitecture #SoftMinimalism #NiRBAAN",
      imagePrompt: "A gorgeous modern minimalist living room with warm sand plaster walls, soft natural light streaming in, a sustainable handcrafted timber chair, lush green indoor plants, Swiss design feel",
      notes: "First brand concept launch post."
    },
    {
      id: "post-2",
      title: "Why raw materials make your sanctuary healthier",
      platform: "Instagram",
      scheduledDate: "2026-07-11",
      pillar: "Sustainable Craftsmanship",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "",
      imagePrompt: "Close-up photo of clean, handcrafted timber joints in warm oak wood, minimalist joinery detail, elegant shadows",
      notes: "Material focus explaining healthy materials."
    },
    {
      id: "post-3",
      title: "Biophilic architectural retreats: Gulshan Pavilion case study",
      platform: "LinkedIn",
      scheduledDate: "2026-07-13",
      pillar: "Biophilic Sanctuaries",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "",
      imagePrompt: "A luxury minimalist concrete and wooden pavilion garden courtyard with bamboo accents and beautiful pool reflections",
      notes: "Gulshan luxury case study."
    },
    {
      id: "post-4",
      title: "Heirloom timber and Bangladeshi hands: Blending design",
      platform: "Instagram",
      scheduledDate: "2026-07-15",
      pillar: "Bangladeshi Heritage Fusion",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "",
      imagePrompt: "A beautifully lit interior showing intricate minimalist wooden screens casting artistic shadows on sand colored clay walls",
      notes: "Heritage artisan highlight."
    }
  ],
  analytics: [
    { date: "2026-07-01", platform: "LinkedIn", title: "Announcing NiRBAAN: Designing spaces that breathe", impressions: 1450, engagement: 220, clicks: 105 },
    { date: "2026-07-03", platform: "Instagram", title: "Soft minimalism philosophy in Gulshan", impressions: 1850, engagement: 310, clicks: 84 },
    { date: "2026-07-05", platform: "LinkedIn", title: "The economics of carbon-neutral residential design", impressions: 2400, engagement: 412, clicks: 195 },
    { date: "2026-07-06", platform: "Instagram", title: "Close up of handcrafted zero-VOC wood joinery", impressions: 3100, engagement: 540, clicks: 120 },
    { date: "2026-07-08", platform: "Instagram", title: "Biophilic rain courtyard visualization", impressions: 4200, engagement: 710, clicks: 220 }
  ],
  memoryLogs: [
    { id: "log-1", timestamp: "2026-07-08T10:00:00-07:00", type: "system", note: "NiRBAAN Design Studio system operating center loaded." },
    { id: "log-2", timestamp: "2026-07-08T10:15:00-07:00", type: "setup", note: "Brand profiles and sustainable guidelines synchronized." },
    { id: "log-3", timestamp: "2026-07-08T11:30:00-07:00", type: "research", note: "Luxury Gulshan buyer personas and biophilic keyword trackers configured." },
    { id: "log-4", timestamp: "2026-07-08T12:00:00-07:00", type: "strategy", note: "Soft Minimalism and Heritage Fusion pillars locked into strategy core." }
  ],
  currentStep: "setup"
};

// State Helper Functions
function readState(): SwapnoAppState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading db.json, returning default state:", err);
  }
  // Write default state if no file exists
  writeState(defaultState);
  return defaultState;
}

function writeState(state: SwapnoAppState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

// API Routes

// 1. Get current full state
app.get("/api/state", (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies && req.cookies.auth_token);

  if (token) {
    const payload = authService.verifyToken(token);
    if (payload) {
      const workspaceId = req.headers['x-workspace-id'] as string;
      if (workspaceId && db.getUserMembership(workspaceId, payload.userId)) {
        const data = db.getWorkspaceData(workspaceId);
        if (data) return res.json(data);
      }
      const workspaces = db.getWorkspacesForUser(payload.userId);
      if (workspaces.length > 0) {
        const data = db.getWorkspaceData(workspaces[0].workspace.id);
        if (data) return res.json(data);
      }
    }
  }

  const state = readState();
  res.json(state);
});

// 2. Save full state or merge
app.post("/api/state", (req, res) => {
  const newState = req.body;
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.cookies && req.cookies.auth_token);

  if (token) {
    const payload = authService.verifyToken(token);
    if (payload) {
      const workspaceId = req.headers['x-workspace-id'] as string;
      if (workspaceId && db.getUserMembership(workspaceId, payload.userId)) {
        const updated = db.updateWorkspaceData(workspaceId, newState);
        return res.json({ success: true, state: updated });
      }
      const workspaces = db.getWorkspacesForUser(payload.userId);
      if (workspaces.length > 0) {
        const updated = db.updateWorkspaceData(workspaces[0].workspace.id, newState);
        return res.json({ success: true, state: updated });
      }
    }
  }

  writeState(newState);
  res.json({ success: true, state: newState });
});

// 3. Reset state
app.post("/api/reset", (req, res) => {
  return res.status(403).json({
    success: false,
    error: {
      code: "GLOBAL_RESET_DISABLED",
      message: "Global database reset has been disabled. Workspaces are now strictly isolated per authenticated user."
    }
  });
  // Disabled legacy reset:
  writeState(defaultState);
  res.json({ success: true, state: defaultState });
});

// 3b. Strategic AI Agent Chat
app.post("/api/ai/chat", async (req, res) => {
  const { agentName, message, state } = req.body;
  const setup = state.businessSetup;
  const brain = state.businessBrain;

  const systemPrompt = `You are the ${agentName} agent inside Swapno AI - the autonomous Marketing Operating System.
You work alongside other agents (CEO AI, Research AI, Strategy AI, etc.) to advise the business owner.
The active business details are:
Name: ${setup.name || "Swapno AI"}
Industry: ${setup.industry || "SaaS"}
Target Audience: ${setup.targetAudience || "SMEs"}
Description: ${setup.description || "No description provided."}
Tone: ${setup.tone || "Professional"}

Business Brain:
Elevator Pitch: ${brain?.elevatorPitch || ""}
Value Proposition: ${brain?.valueProposition || ""}

Current Marketing Strategy pillars: ${(state.strategy?.pillars || []).join(", ")}

Your specific role is:
${agentName === "CEO AI" ? "CEO and Strategic director of the company. Focus on business health, core brand mission, vision, values, and high-level decisions." : ""}
${agentName === "Research AI" ? "Market Research Specialist. Focus on identifying market gaps, competitor movements, customer demographics, and keyword/hashtag opportunities." : ""}
${agentName === "Strategy AI" ? "Chief Marketing Officer (CMO). Focus on formulating multi-channel campaign architectures, content pillars, and structural strategy." : ""}
${agentName === "Content AI" ? "Senior Copywriter and Content Strategist. Focus on crafting engaging copy, headlines, educational lists, and platform-specific messaging." : ""}
${agentName === "Creative AI" ? "Creative Director and Visual Designer. Focus on visual aesthetic guides, graphic themes, Unsplash integration, and image prompt crafting." : ""}
${agentName === "Analytics AI" ? "Data Analyst and Growth Hacker. Focus on summarizing engagement metrics, conversion optimization, bounce rates, and ROI reports." : ""}
${agentName === "Report AI" ? "Executive Dossier compiler. Focus on structuring report outputs, preparing documents for stakeholders, and auditing business documentation." : ""}
${agentName === "Memory AI" ? "Brand Memory Architect. Focus on recording feedback loops, lessons learned, and updating the Business Brain knowledge base." : ""}
${agentName === "Automation AI" ? "DevOps & Social publisher automation coordinator. Focus on schedule dispatching, queue maintenance, and cron rules." : ""}
${agentName === "Quality AI" ? "Editorial and Brand Guardian. Focus on grammatical check, tone alignment, policy compliance, and making sure nothing gets published without user approval." : ""}

Respond to the user's query: "${message}"
Always be highly professional, strategic, clear, and direct. Present your response as a strategic memo from the ${agentName}.
Also include:
1. Reasoning (brief bullet of why you recommend this)
2. Confidence score (a percentage, e.g. "95%")
3. Expected business impact (e.g., "ROI: +15% lift", "Engagement: 2x conversion", "Time Saved: 3 hours").

Return your response strictly in the following JSON format:
{
  "reply": "your clear and formatted markdown response text here",
  "reasoning": "brief statement of reasoning",
  "confidence": "95%",
  "businessImpact": "your estimated business impact description here"
}`;

  const fallback = () => {
    let reply = "";
    let reasoning = "";
    let confidence = "92%";
    let businessImpact = "Est. +15% operational throughput and brand alignment";

    const lowerMsg = message.toLowerCase();
    if (agentName === "CEO AI") {
      reply = `Hello! As the **CEO AI Strategic Advisor**, I have analyzed your question regarding *"${message}"*.\n\nFor a business like **${setup.name}** operating in **${setup.industry}**, it is absolutely critical to preserve brand consistency and establish a strong, professional core identity before scaling outward.\n\nI recommend we double-down on our core Value Proposition: *"${brain?.valueProposition || "Autonomous operational efficiency"}"*.\n\nWe should ensure that every campaign we run can directly trace back to this mission. Would you like me to coordinate with **Strategy AI** to refine our content pillars accordingly?`;
      reasoning = `Brand consistency is the number one driver of customer lifetime value in ${setup.industry || "SaaS"}.`;
      confidence = "95%";
      businessImpact = "Est. +20% conversion trust lift and strong brand loyalty";
    } else if (agentName === "Research AI") {
      reply = `Hello! I have run an autonomous scan of the **${setup.industry}** landscape to address your query: *"${message}"*.\n\nCurrently, there is a strong marketing gap in identifying specific pain points of ${setup.targetAudience}. Our key competitors (like HubSpot/Buffer) are focusing heavily on generic metrics rather than highly tailored, ${setup.tone || "professional"} communication pipelines.\n\nWe should prioritize targeting trending hashtags (like **#AIMarketing** and **#SaaSGrowth**) and focusing our messaging on resolving high copywriting overheads.`;
      reasoning = "Targeting underserved competitive gaps yields the lowest cost per acquisition.";
      confidence = "91%";
      businessImpact = "Est. -30% customer acquisition cost (CAC)";
    } else if (agentName === "Strategy AI") {
      reply = `CMO Strategy AI reporting. I have evaluated your question: *"${message}"*.\n\nTo drive maximum organic visibility for **${setup.name}**, our multi-channel campaign mix should remain focused on high-authority platforms. \n\nWe currently prioritize **LinkedIn** (for B2B thought leadership) and **Twitter** (for rapid-value industry bullets). Under this strategic model, we should maintain a content mix emphasizing authority-building (at least 45% of output) to cement our market position.`;
      reasoning = "Thought-leadership content establishes baseline trust that fuels organic conversions.";
      confidence = "94%";
      businessImpact = "Est. +40% increase in high-quality inbound sales leads";
    } else {
      reply = `Hello! As your strategic **${agentName}** assistant, I have analyzed your query about *"${message}"*.\n\nFor **${setup.name}** targeting **${setup.targetAudience}**, we must ensure our workflows are tightly integrated. I suggest we leverage our Business Brain state to guide this decision, making sure all content copy and scheduling remains tightly aligned with our guidelines.`;
      reasoning = "Automated coordination ensures error-free execution across all touchpoints.";
      confidence = "90%";
      businessImpact = "Est. 4 hours saved per campaign and zero tone drift";
    }

    res.json({
      reply,
      reasoning,
      confidence,
      businessImpact
    });
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              confidence: { type: Type.STRING },
              businessImpact: { type: Type.STRING }
            },
            required: ["reply", "reasoning", "confidence", "businessImpact"]
          }
        }
      });
      
      const resText = response.text || "{}";
      const parsed = JSON.parse(resText.trim());
      res.json(parsed);
    } catch (err: any) {
      console.log("Strategic chat query triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1200);
  }
});

// 4. AI Brainstorm Elevator Pitch and Value Proposition (Business Brain)
app.post("/api/ai/brainstorm", async (req, res) => {
  const { businessSetup } = req.body;
  
  const systemPrompt = `You are the core Business Brain architect for Swapno AI. 
Based on the following business profile:
Name: ${businessSetup.name}
Industry: ${businessSetup.industry}
Target Audience: ${businessSetup.targetAudience}
Description: ${businessSetup.description}
Tone: ${businessSetup.tone}

Generate an elevator pitch (concise, 1-2 sentences), a clear value proposition (one paragraph or list), and a list of 3-4 key industry competitors.
Return the output strictly in the following JSON format:
{
  "elevatorPitch": "your text here",
  "valueProposition": "your text here",
  "competitorList": ["competitor A", "competitor B", "competitor C"]
}`;

  const fallback = () => {
    res.json({
      elevatorPitch: `For ${businessSetup.name}, we provide a state-of-the-art solution tailored specifically for ${businessSetup.targetAudience} in the ${businessSetup.industry} industry.`,
      valueProposition: `We solve core ${businessSetup.industry} bottlenecks by delivering high-quality, high-impact marketing results driven by a professional, ${businessSetup.tone} tone.`,
      competitorList: ["Traditional agencies", "Manual social media templates", "Ad-hoc freelance copywriters"]
    });
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              elevatorPitch: { type: Type.STRING },
              valueProposition: { type: Type.STRING },
              competitorList: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["elevatorPitch", "valueProposition", "competitorList"]
          }
        }
      });
      
      const resText = response.text || "{}";
      const parsed = JSON.parse(resText.trim());
      res.json(parsed);
    } catch (err: any) {
      console.log("Business brainstorm triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1500);
  }
});

// 5. AI Market Research, hashtags, and user persona profiles
app.post("/api/ai/research", async (req, res) => {
  const { businessSetup, businessBrain } = req.body;

  const systemPrompt = `You are a high-end market research analyst for Swapno AI.
Analyze this business setup and brain parameters:
Name: ${businessSetup.name}
Industry: ${businessSetup.industry}
Description: ${businessSetup.description}
Target Audience: ${businessSetup.targetAudience}
Value Proposition: ${businessBrain.valueProposition}

Generate:
1. Market Overview (opportunities and trends in the industry)
2. Competitor Analysis (how the business stands out against: ${businessBrain.competitorList.join(", ")})
3. A list of 5 trending hashtags
4. 2 detailed user persona profiles (name, age, goals, painPoints, mediaChannels)

Return strictly as JSON matching this schema:
{
  "marketOverview": "string overview here",
  "competitorAnalysis": "string analysis here",
  "trendingHashtags": ["#tag1", "#tag2", ...],
  "personaProfiles": [
    {
      "name": "Persona Name",
      "age": "Age string",
      "goals": "Core goals",
      "painPoints": "Key challenges",
      "mediaChannels": ["LinkedIn", "Instagram", etc]
    }
  ]
}`;

  const fallback = () => {
    res.json({
      marketOverview: `The ${businessSetup.industry} landscape is experiencing accelerated shift toward automation. Companies implementing ${businessSetup.tone} communications are capturing greater trust from their target market: ${businessSetup.targetAudience}.`,
      competitorAnalysis: `Compared to traditional options, ${businessSetup.name} provides a highly differentiated, unified value proposition that optimizes operational speed and preserves the core identity of the brand.`,
      trendingHashtags: ["#Innovation", `#${businessSetup.name.replace(/\s+/g, '')}`, `#${businessSetup.industry.split(' ')[0]}`, "#Automation", "#GrowthMindset"],
      personaProfiles: [
        {
          name: "Alex Rivera",
          age: "31",
          goals: `Optimize time-to-market and establish reliable communication workflows in the ${businessSetup.industry} sector.`,
          painPoints: "Too many independent applications, lack of cohesive brand guidelines, high budget spend on manual setup.",
          mediaChannels: ["LinkedIn", "Twitter"]
        },
        {
          name: "Emily Vance",
          age: "45",
          goals: "Maintain a steady stream of authoritative thought-leadership content that converts readers to clients.",
          painPoints: "Struggles with creative block; maintaining consistent tone across distinct platforms.",
          mediaChannels: ["LinkedIn", "Instagram"]
        }
      ]
    });
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              marketOverview: { type: Type.STRING },
              competitorAnalysis: { type: Type.STRING },
              trendingHashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              personaProfiles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    age: { type: Type.STRING },
                    goals: { type: Type.STRING },
                    painPoints: { type: Type.STRING },
                    mediaChannels: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "age", "goals", "painPoints", "mediaChannels"]
                }
              }
            },
            required: ["marketOverview", "competitorAnalysis", "trendingHashtags", "personaProfiles"]
          }
        }
      });
      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed);
    } catch (err: any) {
      console.log("Market research assistant triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1500);
  }
});

// 6. AI Strategy generation (Marketing channels, Content pillars, Campaign themes)
app.post("/api/ai/strategy", async (req, res) => {
  const { businessSetup, research } = req.body;

  const systemPrompt = `You are a Chief Marketing Officer AI for Swapno AI.
Analyze these inputs:
Business: ${businessSetup.name} (${businessSetup.industry})
Target Audience: ${businessSetup.targetAudience}
Market Overview: ${research.marketOverview}
Target Personas: ${research.personaProfiles.map((p: PersonaProfile) => p.name + " (" + p.age + ")").join(", ")}

Generate a strategic marketing proposal:
1. 3 tailored marketing channels (name, frequency, focus)
2. 4 core brand content pillars (high-level topics)
3. 2 strategic campaign themes (title, objective, keyMessage)

Return strictly as JSON:
{
  "channels": [
    { "name": "Channel Name", "frequency": "frequency description", "focus": "detailed channel content focus" }
  ],
  "pillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"],
  "campaignThemes": [
    { "title": "Theme Title", "objective": "Theme goal", "keyMessage": "Primary slogan or message" }
  ]
}`;

  const fallback = () => {
    res.json({
      channels: [
        { name: "LinkedIn", frequency: "3 posts per week", focus: "B2B thought leadership, sharing professional tutorials, product use cases." },
        { name: "Twitter", frequency: "5 short posts per week", focus: "Quick value bullets, industry updates, engaging with thought leaders." },
        { name: "Email Newsletter", frequency: "1 digest bi-weekly", focus: "Deep-dives, sharing actionable guides, customer success stories." }
      ],
      pillars: ["Core Tech Innovation", "Client Case Studies", "Industry Problem Solving", "Behind-the-Scenes & Culture"],
      campaignThemes: [
        { title: "Empowering Next-Gen Teams", objective: `Position ${businessSetup.name} as the key catalyst for efficiency in ${businessSetup.industry}`, keyMessage: `Don't just compete, operate ahead of the curve.` },
        { title: "Simplify the Complexity", objective: "De-mystify complex industry challenges", keyMessage: "High-end strategy streamlined into a single smart pipeline." }
      ]
    });
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              channels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    focus: { type: Type.STRING }
                  },
                  required: ["name", "frequency", "focus"]
                }
              },
              pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
              campaignThemes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    keyMessage: { type: Type.STRING }
                  },
                  required: ["title", "objective", "keyMessage"]
                }
              }
            },
            required: ["channels", "pillars", "campaignThemes"]
          }
        }
      });
      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed);
    } catch (err: any) {
      console.log("Marketing strategy generator triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1500);
  }
});

// 7. AI Content Planner (List of content items based on Strategy & Setup)
app.post("/api/ai/plan", async (req, res) => {
  const { businessSetup, strategy } = req.body;

  const systemPrompt = `You are a Professional Content Strategist AI for Swapno AI.
Create a rich, structured content plan with exactly 4 specific, actionable content ideas.
Context:
Business Name: ${businessSetup.name}
Industry: ${businessSetup.industry}
Brand Tone: ${businessSetup.tone}
Strategy Pillars: ${strategy.pillars.join(", ")}
Target Channels: ${strategy.channels.map((c: MarketingChannel) => c.name).join(", ")}
Campaign Themes: ${strategy.campaignThemes.map((t: CampaignTheme) => t.title).join(", ")}

Generate a schedule of exactly 4 content items. Assign scheduled dates starting from tomorrow (incrementing by 1-2 days). Match each to a suitable channel/platform, select one of the core strategy pillars, and define a clear visual image prompt. Leave the contentCopy empty (it will be generated during Content Generation phase).

Return strictly in the following JSON schema:
{
  "contentItems": [
    {
      "id": "unique-id-1",
      "title": "A highly catchy post title or hook",
      "platform": "platform name, e.g. LinkedIn or Twitter",
      "scheduledDate": "YYYY-MM-DD",
      "pillar": "Exactly matching one of the Strategy Pillars",
      "imagePrompt": "Detailed, creative visual image generation prompt suitable for a modern AI image generator (e.g., 3D render, minimalist vector, etc.)",
      "notes": "A brief internal note about why this topic fits the strategy"
    }
  ]
}`;

  const fallback = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const getFormattedDate = (daysToAdd: number) => {
      const d = new Date();
      d.setDate(tomorrow.getDate() + daysToAdd);
      return d.toISOString().split('T')[0];
    };

    const fallbackItems: ContentItem[] = [
      {
        id: "post-auto-1",
        title: `How to break through the noise in modern ${businessSetup.industry}`,
        platform: strategy.channels[0]?.name || "LinkedIn",
        scheduledDate: getFormattedDate(0),
        pillar: strategy.pillars[0] || "Empowering Lean Teams",
        status: "planned",
        generationStatus: "pending",
        contentCopy: "",
        imagePrompt: `A vibrant vector style graphic showing a glowing key unlocking a maze of data, neat modern aesthetic, suitable for ${businessSetup.name}`,
        notes: "Focuses on our key differentiator of a unified system."
      },
      {
        id: "post-auto-2",
        title: "Stop wasting hours on manual campaign planning. Here's why.",
        platform: strategy.channels[1]?.name || "Twitter",
        scheduledDate: getFormattedDate(2),
        pillar: strategy.pillars[1] || "Unified Brand Strategy",
        status: "planned",
        generationStatus: "pending",
        contentCopy: "",
        imagePrompt: "A sleek dashboard representation with clock gears moving smoothly, cool blue and green accents",
        notes: "Addresses Marcus Chen's main bottleneck: time."
      },
      {
        id: "post-auto-3",
        title: "Scale your workflow, not your stress levels",
        platform: strategy.channels[0]?.name || "LinkedIn",
        scheduledDate: getFormattedDate(4),
        pillar: strategy.pillars[2] || "ROI & Time Savings",
        status: "planned",
        generationStatus: "pending",
        contentCopy: "",
        imagePrompt: "An elegant minimal aesthetic of balancing scales holding a clock and a glowing crystal, neutral modern background",
        notes: "Speaks to high-level productivity hacks."
      },
      {
        id: "post-auto-4",
        title: `Key trends driving the future of ${businessSetup.industry}`,
        platform: strategy.channels[2]?.name || "Instagram",
        scheduledDate: getFormattedDate(6),
        pillar: strategy.pillars[3] || "Core Tech Innovation",
        status: "planned",
        generationStatus: "pending",
        contentCopy: "",
        imagePrompt: "A bento box layout representing multi-channel analytics and beautiful chart widgets, neon isometric design",
        notes: "A visual showpiece."
      }
    ];
    res.json(fallbackItems);
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              contentItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    scheduledDate: { type: Type.STRING },
                    pillar: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                    notes: { type: Type.STRING }
                  },
                  required: ["id", "title", "platform", "scheduledDate", "pillar", "imagePrompt", "notes"]
                }
              }
            },
            required: ["contentItems"]
          }
        }
      });
      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed.contentItems);
    } catch (err: any) {
      console.log("Strategic content planner triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1500);
  }
});

// 8. AI Content Copy Generation for a specific planner item
app.post("/api/ai/generate-content", async (req, res) => {
  const { businessSetup, item } = req.body;

  const systemPrompt = `You are a world-class copywriter for Swapno AI.
Write highly engaging social media copy for the following content post:
Title: ${item.title}
Platform: ${item.platform}
Core Pillar: ${item.pillar}
Brand Name: ${businessSetup.name}
Tone: ${businessSetup.tone}
Business Context: ${businessSetup.description}

Rules:
- Adapt the length and style specifically to the platform:
  - LinkedIn: Structured, spacing, punchy paragraphs, professional but highly engaging, call to action, 3-4 hashtags.
  - Twitter: Under 280 characters, highly hooky, brief bullets or brief punchline, 1-2 hashtags.
  - Instagram: Conversational, aesthetic layout, clean list format, call to comment/like, 5-6 hashtags.
  - Email Newsletter: Multi-paragraph, formal introduction, value body, clear CTA, signoff.
- Speak in the brand's exact tone: ${businessSetup.tone}.
- Do not include placeholders. Write the final ready-to-publish content.

Return your response strictly in the following JSON format:
{
  "contentCopy": "your fully written post copy here, using newline characters (\\n) for spacing and formatting"
}`;

  const fallback = () => {
    let copy = "";
    if (item.platform.toLowerCase() === "twitter" || item.platform.toLowerCase() === "x") {
      copy = `🚨 Quick tip for businesses in the ${businessSetup.industry} space:\n\nIf you're still wasting 10+ hours a week on manual campaign setup, it's time to transition to structured automation.\n\nSimplify the prompts. Focus on the pipelines. 🚀\n\n#${businessSetup.name.replace(/\s+/g, '')} #Automation`;
    } else if (item.platform.toLowerCase() === "instagram") {
      copy = `Consistency isn't just about showing up—it's about staying true to your brand's core values. ✨\n\nIn the world of ${businessSetup.industry}, representing your brand in a ${businessSetup.tone} voice is what builds customer trust and converts readers into long-term loyal clients.\n\nSwipe left to see our dynamic framework of pillars!\n\n👇 Which branding pillar matters most to your business? Let us know below!\n\n#${businessSetup.name.replace(/\s+/g, '')} #Branding101 #ContentAutomation #IndustryHacks`;
    } else {
      copy = `How do you break through the noise in modern ${businessSetup.industry}? 🤔\n\nMany businesses believe the secret is "more content". But flooding channels with disorganized, ad-hoc posts only confuses your target audience.\n\nThe real secret is an integrated strategy:\n\n1️⃣ A defined core identity & guidelines\n2️⃣ Rigid content pillars that anchor your topics\n3️⃣ Continuous analytics feedback loops\n\nThat's why we created ${businessSetup.name}. Instead of managing scattered tools, you operate a fully unified brand intelligence calendar.\n\nReady to elevate your workflow?\n\n🚀 Visit the link in our bio to try out our autonomous Marketing OS.\n\n#AIMarketing #MarketingOS #${businessSetup.name.replace(/\s+/g, '')} #SaaSGrowth`;
    }
    res.json({ contentCopy: copy });
  };

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              contentCopy: { type: Type.STRING }
            },
            required: ["contentCopy"]
          }
        }
      });
      const parsed = JSON.parse((response.text || "{}").trim());
      res.json(parsed);
    } catch (err: any) {
      console.log("Copywriter assistant triggered local fallback flow due to rate limits.");
      fallback();
    }
  } else {
    setTimeout(fallback, 1200);
  }
});

// 9. AI Image Generation (Mock or Gemini 3.1 depending on availability)
app.post("/api/ai/generate-image", async (req, res) => {
  const { prompt } = req.body;

  // We want to generate beautiful visual cards or use a placeholder system.
  // Using an abstract visual representation with rich SVG, or attempting a Gemini-3.1-flash-lite-image model call
  if (ai && apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      console.log(`Generating real image via Gemini for prompt: "${prompt}"`);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });
      
      let base64Image = "";
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }
      
      if (base64Image) {
        return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
      } else {
        throw new Error("No inlineData found in Gemini response parts");
      }
    } catch (err: any) {
      console.log("Image generator requested local fallback representation due to status rate limits.");
    }
  }

  // Graceful fallback: return a beautifully generated SVG or solid Unsplash category image
  // To make it look stunning, let's use high-quality tech / workspace vector mockups or dynamic Unsplash search
  const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80`; // Beautiful abstract fluid vector 3D design
  
  // Custom smart images matching keywords
  let matchedUrl = fallbackUrl;
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("calendar") || lowerPrompt.includes("schedule")) {
    matchedUrl = "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"; // Calendar organization
  } else if (lowerPrompt.includes("people") || lowerPrompt.includes("sarah") || lowerPrompt.includes("team") || lowerPrompt.includes("leader")) {
    matchedUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"; // Confident woman worker
  } else if (lowerPrompt.includes("chart") || lowerPrompt.includes("analytics") || lowerPrompt.includes("dashboard")) {
    matchedUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"; // Tech chart dashboard
  } else if (lowerPrompt.includes("robot") || lowerPrompt.includes("ai") || lowerPrompt.includes("cyber") || lowerPrompt.includes("technology")) {
    matchedUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"; // Modern vector tech
  } else if (lowerPrompt.includes("social") || lowerPrompt.includes("marketing") || lowerPrompt.includes("creative")) {
    matchedUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"; // Creative office design
  }
  
  setTimeout(() => {
    res.json({ imageUrl: matchedUrl });
  }, 1000);
});

// Production-ready Vite assets server setup
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    console.log("Vite dev server mounted on Express.");
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Bind server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Swapno AI backend running on http://0.0.0.0:${PORT}`);
});
