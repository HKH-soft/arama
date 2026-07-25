# Arama (آراما)

Arama is an AI-powered mental health companion designed for Persian speakers. It features voice journaling, mood tracking, guided meditations, and CBT exercises.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Styling**: Tailwind CSS
- **Authentication**: Custom OTP auth via MeliPayamak
- **AI Integration**: OpenAI (Whisper + GPT) or compatible models

## Prerequisites
- Node.js >= 18
- PostgreSQL instance running locally or remotely
- A valid MeliPayamak API Key (for SMS)

## Environment Variables
Create a `.env.local` file at the root of the project with the following (see `.env` for defaults):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/arama
AI_API_KEY=your_openai_or_custom_api_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

MELIPAYAMAK_USERNAME=your_username
MELIPAYAMAK_APIKEY=your_api_key
MELIPAYAMAK_FROM=your_sender_number

NEXT_PUBLIC_BASE_URL=http://localhost:3000
ZARINPAL_MERCHANT_ID=00000000-0000-0000-0000-000000000000
ZARINPAL_SANDBOX=true
```

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup & Migrations**
   Make sure your PostgreSQL server is running and the database matches `DATABASE_URL`.
   Run Drizzle migrations to create tables:
   ```bash
   npm run db:push
   ```
   Or if you want to generate and run standard migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
