import { SwapnoAppState } from '../types';

export const workspaceAData: SwapnoAppState = {
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
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
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
      contentCopy: "Synthetic veneers and chemical finishes don't just look cheap—they compromise the air you breathe. 🪵 We craft our sanctuaries with organic local timbers and zero-VOC oil finishes. Sustainable luxury that respects your well-being.",
      imagePrompt: "Close-up photo of clean, handcrafted timber joints in warm oak wood, minimalist joinery detail, elegant shadows",
      imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80",
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
      contentCopy: "How do you weave nature into Gulshan's urban grid? Our latest residential pavilion integrates open courtyards, rain harvesting systems, and local clay tiles. A true biophilic retreat designed for Nadia and Farhan's family.",
      imagePrompt: "A luxury minimalist concrete and wooden pavilion garden courtyard with bamboo accents and beautiful pool reflections",
      imageUrl: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80",
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
      contentCopy: "Bespoke sustainable design meets master handcraft. Our heirloom timber screens are carved by traditional Bangladeshi woodworkers, preserving legacy skills while matching modern minimalist guidelines. ✨",
      imagePrompt: "A beautifully lit interior showing intricate minimalist wooden screens casting artistic shadows on sand colored clay walls",
      imageUrl: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80",
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
  currentStep: "dashboard"
};

export const workspaceBData: SwapnoAppState = {
  businessSetup: {
    name: "Gourmet Hub",
    industry: "Artisanal Italian Dining",
    targetAudience: "Local Gastronomy Lovers, Organic Food Enthusiasts & Couples",
    description: "An authentic Italian bistro dedicated to traditional hand-rolled pasta, sustainably sourced heritage ingredients, and micro-batch natural wines in a cozy candle-lit environment.",
    tone: "Warm, Narrative, Evocative, Elegantly Unpretentious",
    colors: ["#991b1b", "#854d0e", "#164e63"],
    keywords: ["Hand-rolled Pasta", "Artisanal Dining", "Heritage Ingredients", "Tuscany Bistro", "Organic Pasta"]
  },
  businessBrain: {
    elevatorPitch: "Gourmet Hub is a sanctuary for slow food in a fast-paced world. We honor centuries-old gastronomy secrets by hand-making lasagna, ravioli, and fresh sourdough in-house daily, using zero-mile organic crops.",
    valueProposition: "Experience real Italian craftsmanship. Savor hand-stretched heirloom dough and sustainably dry-aged steaks paired with authentic, single-vineyard biodynamic wines in an intimate, elegant setting.",
    competitorList: ["Olive Garden", "Local Italian Bistro", "Premium Italian Trattoria", "Gourmet Food Delivery Services"],
    synced: true
  },
  research: {
    marketOverview: "Consumers increasingly prioritize narrative authenticity, natural sourdough fermentation, and chemical-free agricultural sourcing. Digital dining engagement peaks when users see slow-motion culinary craft videos.",
    competitorAnalysis: "Chain restaurants rely heavily on processed ingredients and frozen stocks, offering zero narrative connection. Competitor social channels fail to share the stories of farm partners and culinary chefs.",
    trendingHashtags: ["#ArtisanalPasta", "#SlowFoodMovement", "#HeritageKitchen", "#TuscanyFlavors", "#GourmetItalian"],
    personaProfiles: [
      {
        name: "Marco Rossi",
        age: "42",
        goals: "Find authentic dining experiences that remind him of his family dinners in Florence.",
        painPoints: "Tired of Americanized, heavy cream 'Italian' pasta, and struggles to find premium natural wine lists locally.",
        mediaChannels: ["Instagram", "Substack", "Yelp"]
      },
      {
        name: "Sophia Martinez",
        age: "31",
        goals: "Plan special, memorable weekend dates centering clean, non-inflammatory organic food options.",
        painPoints: "Allergies to mass-produced wheat and chemical preservatives. Seeks restaurants that list exact organic farms.",
        mediaChannels: ["Instagram", "TikTok", "Pinterest"]
      }
    ],
    approved: true,
    notes: "Culinary landscape analysis finalized."
  },
  strategy: {
    channels: [
      { name: "Instagram", frequency: "4 posts per week", focus: "Slow-motion food prep, chef profile storytelling, table-setting aesthetic grids." },
      { name: "Facebook", frequency: "2 posts per week", focus: "Weekly organic farmer highlight, booking reservations, community dinner announcements." }
    ],
    pillars: ["Artisanal Pasta Mastery", "Local Organic Ingredients", "The Visual Sensation of Dining", "Behind-the-Scenes Culinary Art"],
    campaignThemes: [
      { title: "No Shortcuts in Gastronomy", objective: "Educate diners on our 24-hour slow fermentation process", keyMessage: "Mass dining focuses on speed. We focus on patience. Our 100-layer lasagna sheets are hand-rolled and rested for 24 hours." },
      { title: "Meet the Soil Partners", objective: "Highlight our organic agricultural network", keyMessage: "An exceptional dish begins in healthy soil. Connect with farm partners cultivating heirloom Tuscan greens." }
    ],
    approved: true,
    notes: "Brand narrative strategy aligned with slower dining concepts."
  },
  contentPlan: [
    {
      id: "post-gourmet-1",
      title: "The art of rolling 100-layer lasagna sheets",
      platform: "Instagram",
      scheduledDate: "2026-07-10",
      pillar: "Artisanal Pasta Mastery",
      status: "approved",
      generationStatus: "generated",
      contentCopy: "Gastronomy is a patience game. 🇮🇹\n\nAt Gourmet Hub, our lasagna isn't built on assembly lines. Our culinary team hand-rolls every single sheet of pasta, letting it rest for 24 hours to achieve the perfect bite (al dente, always).\n\nLayered with rich, 6-hour slow-simmered bolognese and fresh, organic house-made bechamel.\n\nReserve your table tonight. Link in bio. Savor slow dining. ✨\n\n#ArtisanalPasta #SlowFoodMovement #LasagnaArt #GourmetHub",
      imagePrompt: "A close up photo of hand-rolled golden lasagna pasta sheets stacked delicately, chef flour hands, rustic wooden table",
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
      notes: "High engagement video teaser copy."
    },
    {
      id: "post-gourmet-2",
      title: "Sourcing heirloom tomatoes from local Tuscany farms",
      platform: "Facebook",
      scheduledDate: "2026-07-11",
      pillar: "Local Organic Ingredients",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "Our summer heirloom tomatoes are picked at sunrise. Grown with love by local farm partners, delivered straight to your plate.",
      imagePrompt: "Vibrant freshly picked red heirloom tomatoes with dew drops in a rustic wooden crate",
      notes: "Local farming focus."
    },
    {
      id: "post-gourmet-3",
      title: "Meet Chef Beatrice: Our culinary conductor",
      platform: "Instagram",
      scheduledDate: "2026-07-13",
      pillar: "Behind-the-Scenes Culinary Art",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "Meet the mind behind our recipes. Chef Beatrice believes food is storytelling. Every plate she orchestrates holds a memory.",
      imagePrompt: "A proud smiling Italian female chef in white uniform holding a rolling pin, bright cozy kitchen",
      notes: "Staff appreciation post."
    },
    {
      id: "post-gourmet-4",
      title: "Our weekly menu reveal: Truffle-infused ravioli",
      platform: "Facebook",
      scheduledDate: "2026-07-15",
      pillar: "Artisanal Pasta Mastery",
      status: "planned",
      generationStatus: "pending",
      contentCopy: "This weekend's spotlight: Truffle-infused handmade ravioli. Hand-piped with aged ricotta and finished with fresh truffle shavings.",
      imagePrompt: "A beautifully plated ravioli pasta dish with black truffle shavings, elegant dark stone dining table",
      notes: "Weekend feature announcement."
    }
  ],
  analytics: [
    { date: "2026-07-01", platform: "Instagram", title: "Roll call for pasta lovers: Sourdough ravioli", impressions: 3200, engagement: 620, clicks: 110 },
    { date: "2026-07-03", platform: "Facebook", title: "Where our organic farm crops are cultivated", impressions: 1400, engagement: 180, clicks: 65 },
    { date: "2026-07-05", platform: "Instagram", title: "Slow-motion bolognese simmer secret", impressions: 4500, engagement: 910, clicks: 230 },
    { date: "2026-07-08", platform: "Instagram", title: "The art of rolling 100-layer lasagna sheets", impressions: 5800, engagement: 1120, clicks: 340 }
  ],
  memoryLogs: [
    { id: "log-gourmet-1", timestamp: "2026-07-08T10:00:00-07:00", type: "system", note: "Gourmet Hub brand system initialized." },
    { id: "log-gourmet-2", timestamp: "2026-07-08T10:20:00-07:00", type: "setup", note: "Gastronomy focus profile established." },
    { id: "log-gourmet-3", timestamp: "2026-07-08T11:45:00-07:00", type: "research", note: "Slow food audience demographics and organic farm networks synced to Memory." }
  ],
  currentStep: "dashboard"
};
