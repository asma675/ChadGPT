# BradGPT (Next.js + Own Backend)

## 1) Setup

1. Install deps:
```bash
npm install
```

2. Create your env file:
```bash
cp .env.example .env
```

3. Add your OpenAI key in `.env`:
- `OPENAI_API_KEY=...`
- optionally: `OPENAI_MODEL=gpt-4o-mini`

4. Create the database:
```bash
npx prisma migrate dev --name init
```

## Deploy to Vercel

1. **Create a Postgres database** (recommended: Neon, Supabase, Vercel Postgres) and copy the connection string.

2. In Vercel: **Project → Settings → Environment Variables**, set:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `OPENAI_IMAGE_MODEL` (optional)

3. Enable **Vercel Blob** for the project (Storage tab) so `BLOB_READ_WRITE_TOKEN` is provided automatically.

4. Deploy (GitHub import recommended). Then run migrations:
   - Vercel build will install deps.
   - Run once in CI/CLI:
     ```bash
     npx prisma migrate deploy
     ```

## 2) Run
```bash
npm run dev
```

Open: http://localhost:3000/SETH

## Notes
- Files are stored in **Vercel Blob**; `/api/files/:id` redirects to the stored URL.
- Auth is stubbed (`/api/me`). If you want login, add NextAuth and tie records to users.
