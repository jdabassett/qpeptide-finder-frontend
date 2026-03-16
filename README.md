# QPeptide Cutter Frontend

Next.js frontend application for the QPeptide Cutter protein digestion tool.

## Tech Stack 

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS


## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

1. Install dependencies:
   npm install
   2. Set up environment variables:
   cp .env.example .env.local
   # Edit .env.local with your API URL
   3. Run development server:
   npm run dev
   4. Open [http://localhost:3000](http://localhost:3000)

## Docker

### Build
docker build -t qpeptide-frontend .### Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 qpeptide-frontend## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## Deployment

See deployment documentation for EC2 setup instructions.