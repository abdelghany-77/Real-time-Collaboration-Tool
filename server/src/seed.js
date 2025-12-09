/**
 * Seed Script - Populate database with comprehensive sample data
 * Run with: node src/seed.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models using require (models are exported as default from CommonJS-compatible files)
const { Board, List, Card } = require("./models");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/taskboard";

const sampleData = {
  boards: [
    {
      title: " Product Launch Q1",
      description: "Main product launch roadmap for Q1 2025",
      background: "#0079bf",
      lists: [
        {
          title: "Backlog",
          cards: [
            {
              title: "Market research analysis",
              description:
                "Conduct comprehensive market research for target demographics",
              priority: "medium",
              dueDate: new Date("2025-01-15"),
            },
            {
              title: "Competitor analysis report",
              description: "Analyze top 5 competitors and their strategies",
              priority: "high",
              dueDate: new Date("2025-01-10"),
            },
            {
              title: "User persona development",
              description: "Create detailed user personas based on research",
              priority: "medium",
            },
            {
              title: "Feature prioritization workshop",
              description:
                "Conduct workshop with stakeholders to prioritize features",
              priority: "high",
            },
            {
              title: "Budget allocation review",
              description: "Review and allocate budget for Q1 initiatives",
              priority: "high",
              dueDate: new Date("2025-01-05"),
            },
          ],
        },
        {
          title: "To Do",
          cards: [
            {
              title: "Design landing page mockups",
              description: "Create 3 variations of landing page designs",
              priority: "high",
              dueDate: new Date("2025-01-20"),
            },
            {
              title: "Write product copy",
              description: "Craft compelling product descriptions and taglines",
              priority: "medium",
            },
            {
              title: "Set up analytics tracking",
              description: "Implement Google Analytics and Mixpanel",
              priority: "medium",
            },
            {
              title: "Create email templates",
              description: "Design responsive email templates for campaigns",
              priority: "low",
            },
            {
              title: "Social media content calendar",
              description: "Plan 30 days of social media content",
              priority: "medium",
              dueDate: new Date("2025-01-25"),
            },
            {
              title: "Press release draft",
              description:
                "Write initial press release for launch announcement",
              priority: "low",
            },
          ],
        },
        {
          title: "In Progress",
          cards: [
            {
              title: "Build pricing page",
              description: "Implement responsive pricing page with 3 tiers",
              priority: "high",
              dueDate: new Date("2025-01-12"),
            },
            {
              title: "Integration with payment gateway",
              description: "Set up Stripe integration for subscriptions",
              priority: "high",
            },
            {
              title: "Mobile responsiveness testing",
              description: "Test all pages on various mobile devices",
              priority: "medium",
            },
            {
              title: "SEO optimization",
              description: "Optimize meta tags, headings, and content for SEO",
              priority: "medium",
            },
          ],
        },
        {
          title: "Review",
          cards: [
            {
              title: "Homepage design review",
              description: "Get stakeholder approval on homepage design",
              priority: "high",
            },
            {
              title: "Legal compliance check",
              description: "Review privacy policy and terms of service",
              priority: "high",
              dueDate: new Date("2025-01-08"),
            },
            {
              title: "Accessibility audit",
              description: "Ensure WCAG 2.1 AA compliance",
              priority: "medium",
            },
          ],
        },
        {
          title: "Done",
          cards: [
            {
              title: "Domain registration",
              description: "Registered productlaunch.com",
              priority: "high",
            },
            {
              title: "Hosting setup",
              description: "Configured AWS infrastructure",
              priority: "high",
            },
            {
              title: "Brand guidelines document",
              description: "Completed brand style guide",
              priority: "medium",
            },
            {
              title: "Logo design finalized",
              description: "Approved final logo variations",
              priority: "high",
            },
          ],
        },
      ],
    },
    {
      title: "Development Sprint",
      description: "Software development sprint board",
      background: "#519839",
      lists: [
        {
          title: "Sprint Backlog",
          cards: [
            {
              title: "Implement user authentication",
              description: "Add JWT-based auth with refresh tokens",
              priority: "high",
              dueDate: new Date("2025-01-18"),
            },
            {
              title: "Database schema design",
              description: "Design and implement MongoDB schemas",
              priority: "high",
            },
            {
              title: "API rate limiting",
              description: "Implement rate limiting middleware",
              priority: "medium",
            },
            {
              title: "Error handling middleware",
              description: "Create centralized error handling",
              priority: "medium",
            },
            {
              title: "Logging system setup",
              description: "Implement Winston logger with log rotation",
              priority: "low",
            },
            {
              title: "Unit test coverage",
              description: "Achieve 80% test coverage",
              priority: "high",
            },
          ],
        },
        {
          title: "In Development",
          cards: [
            {
              title: "REST API endpoints",
              description: "Build CRUD operations for all resources",
              priority: "high",
              dueDate: new Date("2025-01-14"),
            },
            {
              title: "WebSocket integration",
              description: "Real-time updates with Socket.io",
              priority: "high",
            },
            {
              title: "File upload service",
              description: "Implement S3 file upload with presigned URLs",
              priority: "medium",
            },
            {
              title: "Search functionality",
              description: "Add full-text search with MongoDB Atlas Search",
              priority: "medium",
            },
          ],
        },
        {
          title: "Code Review",
          cards: [
            {
              title: "PR #142: Auth module",
              description: "Review authentication implementation",
              priority: "high",
            },
            {
              title: "PR #145: Database models",
              description: "Review Mongoose model definitions",
              priority: "high",
            },
            {
              title: "PR #148: API validation",
              description: "Review Joi validation schemas",
              priority: "medium",
            },
          ],
        },
        {
          title: "Testing",
          cards: [
            {
              title: "Integration tests for auth",
              description: "Test login, logout, token refresh flows",
              priority: "high",
            },
            {
              title: "Load testing",
              description: "Run k6 load tests on critical endpoints",
              priority: "medium",
            },
            {
              title: "E2E test scenarios",
              description: "Write Cypress tests for user journeys",
              priority: "medium",
              dueDate: new Date("2025-01-22"),
            },
          ],
        },
        {
          title: " Deployed",
          cards: [
            {
              title: "CI/CD pipeline",
              description: "GitHub Actions workflow configured",
              priority: "high",
            },
            {
              title: "Docker containerization",
              description: "Dockerized application with multi-stage builds",
              priority: "high",
            },
            {
              title: "Environment configuration",
              description: "Set up dev, staging, and prod environments",
              priority: "medium",
            },
          ],
        },
      ],
    },
    {
      title: "Design System",
      description: "UI/UX design tasks and components",
      background: "#b04632",
      lists: [
        {
          title: "Design Requests",
          cards: [
            {
              title: "Dashboard redesign",
              description: "Modernize the main dashboard layout",
              priority: "high",
              dueDate: new Date("2025-01-30"),
            },
            {
              title: "Mobile navigation patterns",
              description: "Design mobile-first navigation system",
              priority: "high",
            },
            {
              title: "Dark mode support",
              description: "Create dark theme color palette",
              priority: "medium",
            },
            {
              title: "Icon library expansion",
              description: "Add 50 new custom icons",
              priority: "low",
            },
            {
              title: "Illustration style guide",
              description: "Define illustration style for marketing",
              priority: "low",
            },
          ],
        },
        {
          title: "In Design",
          cards: [
            {
              title: "Component library updates",
              description: "Update buttons, inputs, and modals",
              priority: "high",
            },
            {
              title: "User onboarding flow",
              description: "Design 5-step onboarding experience",
              priority: "high",
              dueDate: new Date("2025-01-16"),
            },
            {
              title: "Settings page redesign",
              description: "Simplify settings navigation",
              priority: "medium",
            },
          ],
        },
        {
          title: "Design Review",
          cards: [
            {
              title: "Profile page mockups",
              description: "Review with product team",
              priority: "medium",
            },
            {
              title: "Email template designs",
              description: "Get marketing approval",
              priority: "low",
            },
          ],
        },
        {
          title: "Ready for Dev",
          cards: [
            {
              title: "Login/Signup screens",
              description: "Specs and assets ready for implementation",
              priority: "high",
            },
            {
              title: "Notification center",
              description: "Design specs exported to Figma",
              priority: "medium",
            },
            {
              title: "Search results page",
              description: "All variants documented",
              priority: "medium",
            },
            {
              title: "Empty states collection",
              description: "15 empty state illustrations ready",
              priority: "low",
            },
          ],
        },
        {
          title: "Implemented",
          cards: [
            {
              title: "Typography system",
              description: "Font scales implemented in Tailwind",
              priority: "high",
            },
            {
              title: "Color palette",
              description: "All colors added to design tokens",
              priority: "high",
            },
            {
              title: "Spacing system",
              description: "8px grid system implemented",
              priority: "medium",
            },
            {
              title: "Button component",
              description: "All variants built in React",
              priority: "high",
            },
          ],
        },
      ],
    },
    {
      title: "Mobile App",
      description: "React Native mobile application development",
      background: "#89609e",
      lists: [
        {
          title: "Backlog",
          cards: [
            {
              title: "Push notification system",
              description: "Implement FCM for Android and APNs for iOS",
              priority: "high",
            },
            {
              title: "Offline mode support",
              description: "Add Redux Persist for offline data",
              priority: "high",
            },
            {
              title: "Biometric authentication",
              description: "Face ID and fingerprint login",
              priority: "medium",
            },
            {
              title: "App performance optimization",
              description: "Reduce app size and improve startup time",
              priority: "medium",
            },
            {
              title: "Deep linking implementation",
              description: "Handle universal links and app links",
              priority: "low",
            },
          ],
        },
        {
          title: " Building",
          cards: [
            {
              title: "Home screen widget",
              description: "iOS 14+ and Android widget support",
              priority: "medium",
              dueDate: new Date("2025-02-01"),
            },
            {
              title: "Camera integration",
              description: "Document scanning feature",
              priority: "high",
            },
            {
              title: "Location services",
              description: "Background location tracking",
              priority: "medium",
            },
          ],
        },
        {
          title: " QA Testing",
          cards: [
            {
              title: "iOS 17 compatibility",
              description: "Test on latest iOS version",
              priority: "high",
            },
            {
              title: "Android 14 testing",
              description: "Verify all features on Android 14",
              priority: "high",
            },
            {
              title: "Tablet layout testing",
              description: "iPad and Android tablet support",
              priority: "medium",
            },
          ],
        },
        {
          title: " Released",
          cards: [
            {
              title: "v1.0 - Initial release",
              description: "Core features launched",
              priority: "high",
            },
            {
              title: "v1.1 - Bug fixes",
              description: "Fixed crash on older devices",
              priority: "high",
            },
            {
              title: "v1.2 - Performance update",
              description: "50% faster load times",
              priority: "medium",
            },
          ],
        },
      ],
    },
    {
      title: " Marketing Campaign",
      description: "Q1 2025 Marketing initiatives",
      background: "#cd5a91",
      lists: [
        {
          title: "💡 Ideas",
          cards: [
            {
              title: "Influencer partnership program",
              description: "Reach out to 20 micro-influencers",
              priority: "medium",
            },
            {
              title: "Podcast advertising",
              description: "Sponsor 5 tech podcasts",
              priority: "low",
            },
            {
              title: "Webinar series",
              description: "Monthly educational webinars",
              priority: "medium",
            },
            {
              title: "Referral program launch",
              description: "Design viral referral mechanics",
              priority: "high",
            },
            {
              title: "Community building initiative",
              description: "Launch Discord server",
              priority: "medium",
            },
          ],
        },
        {
          title: " Planned",
          cards: [
            {
              title: "Product Hunt launch",
              description: "Prepare for PH launch day",
              priority: "high",
              dueDate: new Date("2025-02-15"),
            },
            {
              title: "LinkedIn ad campaign",
              description: "Target B2B decision makers",
              priority: "high",
            },
            {
              title: "Blog content strategy",
              description: "Plan 12 blog posts for Q1",
              priority: "medium",
            },
            {
              title: "Case study production",
              description: "Create 3 customer success stories",
              priority: "medium",
            },
          ],
        },
        {
          title: " Running",
          cards: [
            {
              title: "Google Ads campaign",
              description: "Search and display ads live",
              priority: "high",
            },
            {
              title: "Email nurture sequence",
              description: "7-email onboarding sequence active",
              priority: "high",
            },
            {
              title: "Social media ads",
              description: "Facebook and Instagram campaigns",
              priority: "medium",
            },
          ],
        },
        {
          title: "Analyzing",
          cards: [
            {
              title: "December campaign results",
              description: "Compile ROI report",
              priority: "high",
            },
            {
              title: "A/B test analysis",
              description: "Landing page variant performance",
              priority: "medium",
            },
          ],
        },
        {
          title: " Completed",
          cards: [
            {
              title: "Brand awareness survey",
              description: "Baseline metrics established",
              priority: "medium",
            },
            {
              title: "Competitor ad analysis",
              description: "Documented competitor strategies",
              priority: "low",
            },
            {
              title: "Marketing automation setup",
              description: "HubSpot workflows configured",
              priority: "high",
            },
          ],
        },
      ],
    },
    {
      title: " Bug Tracker",
      description: "Bug tracking and issue management",
      background: "#d29034",
      lists: [
        {
          title: " New",
          cards: [
            {
              title: "Login fails on Safari",
              description: "Users report login issues on Safari 17",
              priority: "high",
              dueDate: new Date("2025-01-09"),
            },
            {
              title: "Image upload timeout",
              description: "Large images cause upload timeout",
              priority: "high",
            },
            {
              title: "Email formatting broken",
              description: "HTML emails display incorrectly in Outlook",
              priority: "medium",
            },
            {
              title: "Search returns no results",
              description: "Empty search results for valid queries",
              priority: "high",
            },
            {
              title: "Mobile menu not closing",
              description: "Menu stays open after navigation",
              priority: "medium",
            },
            {
              title: "Date picker timezone issue",
              description: "Dates show wrong in different timezones",
              priority: "medium",
            },
          ],
        },
        {
          title: " Investigating",
          cards: [
            {
              title: "Memory leak in dashboard",
              description: "Dashboard memory usage increases over time",
              priority: "high",
            },
            {
              title: "Slow API response times",
              description: "Some endpoints taking 3+ seconds",
              priority: "high",
            },
            {
              title: "WebSocket disconnections",
              description: "Random disconnections on mobile",
              priority: "medium",
            },
          ],
        },
        {
          title: " Fixing",
          cards: [
            {
              title: "Form validation errors",
              description: "Error messages not displaying correctly",
              priority: "high",
            },
            {
              title: "Pagination off by one",
              description: "Page count incorrect on last page",
              priority: "medium",
            },
            {
              title: "Dark mode contrast issues",
              description: "Some text unreadable in dark mode",
              priority: "low",
            },
          ],
        },
        {
          title: " Resolved",
          cards: [
            {
              title: "CSS grid layout breaking",
              description: "Fixed grid overflow on small screens",
              priority: "high",
            },
            {
              title: "Duplicate API calls",
              description: "Eliminated unnecessary re-fetches",
              priority: "medium",
            },
            {
              title: "Session expiry not handled",
              description: "Added graceful session handling",
              priority: "high",
            },
            {
              title: "File download not working",
              description: "Fixed blob handling in Safari",
              priority: "medium",
            },
            {
              title: "Keyboard navigation broken",
              description: "Restored tab navigation order",
              priority: "medium",
            },
          ],
        },
      ],
    },
  ],
};

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Card.deleteMany({});
    await List.deleteMany({});
    await Board.deleteMany({});

    // Create all boards with their lists and cards
    console.log("\n Creating sample data...\n");

    let totalCards = 0;
    let totalLists = 0;
    const boardIds = [];

    for (const boardData of sampleData.boards) {
      // Create board
      const board = await Board.create({
        title: boardData.title,
        description: boardData.description,
        background: boardData.background,
      });
      boardIds.push(board._id);
      console.log(` Created board: ${board.title}`);

      // Create lists and cards for this board
      for (let i = 0; i < boardData.lists.length; i++) {
        const listData = boardData.lists[i];

        // Create list
        const list = await List.create({
          title: listData.title,
          board: board._id,
          position: (i + 1) * 65535,
        });
        totalLists++;
        console.log(`   ${list.title} (${listData.cards.length} cards)`);

        // Create cards for this list
        for (let j = 0; j < listData.cards.length; j++) {
          const cardData = listData.cards[j];
          await Card.create({
            title: cardData.title,
            description: cardData.description,
            priority: cardData.priority || "none",
            dueDate: cardData.dueDate || null,
            list: list._id,
            board: board._id,
            position: (j + 1) * 65535,
          });
          totalCards++;
        }
      }
      console.log("");
    }

    console.log("═".repeat(50));
    console.log("✅ Seed completed successfully!");
    console.log("═".repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   • Boards: ${sampleData.boards.length}`);
    console.log(`   • Lists: ${totalLists}`);
    console.log(`   • Cards: ${totalCards}`);
    console.log(`\n🔗 Board URLs:`);
    sampleData.boards.forEach((board, index) => {
      console.log(
        `   ${board.title}: http://localhost:5173/board/${boardIds[index]}`
      );
    });
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
