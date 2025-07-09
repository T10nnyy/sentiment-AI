# Sentiment Analysis Frontend

Modern React Next.js TypeScript frontend for the sentiment analysis microservice.

## Features

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Dual API Support**: Toggle between REST and GraphQL APIs
- **Real-time Analysis**: Instant sentiment analysis with confidence scores
- **Batch Processing**: Analyze multiple texts simultaneously
- **Analysis History**: Track and manage previous analyses
- **Model Information**: View current model status and configuration
- **Animations**: Smooth transitions with Framer Motion
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error handling with toast notifications

## Quick Start

### Prerequisites

- Node.js 18+ 
- Backend service running on http://localhost:8000

### Installation

\`\`\`bash
cd frontend/
npm install
\`\`\`

### Development

\`\`\`bash
# Start development server
npm run dev

# Open http://localhost:3000
\`\`\`

### Production Build

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Environment Variables

Create a \`.env.local\` file:

\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## Features Overview

### 1. Single Text Analysis
- Real-time sentiment analysis
- Confidence score visualization
- Quick example texts
- API type toggle (REST/GraphQL)

### 2. Batch Analysis
- Multiple text processing
- Results export (CSV)
- Statistical overview
- Progress tracking

### 3. Analysis History
- Local storage of results
- Timestamp tracking
- Quick actions (delete, clear all)
- Search and filter capabilities

### 4. Model Information
- Current model details
- System health status
- Performance metrics
- API configuration

## API Integration

The frontend seamlessly integrates with both REST and GraphQL APIs:

### REST API Endpoints
- \`POST /api/predict\` - Single prediction
- \`POST /api/predict/batch\` - Batch prediction
- \`GET /api/model/info\` - Model information
- \`GET /api/health\` - Health check

### GraphQL Queries
- \`predict(text: String!)\` - Single prediction
- \`batchPredict(texts: [String!]!)\` - Batch prediction
- \`modelInfo\` - Model information

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Project Structure

\`\`\`
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── SentimentAnalyzer.tsx
│   ├── BatchAnalyzer.tsx
│   ├── AnalysisHistory.tsx
│   ├── ModelInfo.tsx
│   └── Layout.tsx
├── hooks/              # Custom React hooks
├── lib/                # API client and utilities
├── pages/              # Next.js pages
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── public/             # Static assets
\`\`\`

## Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: React Query for API response caching
- **Lazy Loading**: Components loaded on demand

## Deployment

### Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## Testing

\`\`\`bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when added)
npm test
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
