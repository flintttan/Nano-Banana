# Frontend Setup Instructions

**Generated**: 2025-12-10T14:42:00.000Z
**Task**: IMPL-003 - Set up new frontend/ package from template
**Status**: ✓ Template copied, dependencies installation required

---

## Setup Status

✅ **Template Copied**: 167 files copied from fe_template/boilerplate-shadcn-pro-main/
✅ **Directory Structure**: All 12 directories preserved
✅ **Configuration Files**: package.json, components.json, next.config.js, tailwind.config.ts

---

## Next Steps: Install Dependencies

### Option 1: Standard Installation
```bash
cd frontend
npm install
```

### Option 2: With shadcn/ui Initialization (Recommended)
```bash
cd frontend
npm run init
# This runs: npm install && npx shadcn@latest add --all
```

---

## Configuration Overview

### Framework
- **Next.js** with App Router
- **React** 18+
- **TypeScript** support

### UI Library
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Radix UI** primitives

### Key Dependencies (from package.json)
- `next`: Next.js framework
- `react`, `react-dom`: React library
- `@radix-ui/*`: UI primitives
- `tailwindcss`: Utility-first CSS
- `typescript`: TypeScript support
- `@aws-sdk/client-s3`: S3 integration (for image storage)

---

## Directory Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── auth/              # Authentication routes
│   ├── api/               # API routes (if needed)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── contexts/              # React Context providers
├── types/                 # TypeScript type definitions
├── styles/                # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── components.json        # shadcn/ui configuration
├── next.config.js         # Next.js configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

---

## Available Scripts

After installing dependencies, you can use:

```bash
# Development server (port 3000 by default)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

---

## Integration with Backend

### API Base URL
The backend Express server runs on **port 3010**. You'll need to configure the frontend to make API calls to:
- Development: `http://localhost:3010/api`
- Production: Configure via environment variables

### Environment Variables
Create `.env.local` file in frontend/ directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3010/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Next Implementation Steps

After installing dependencies:
1. **IMPL-004**: Design HCI-based page structure and routing
2. **IMPL-005**: Implement authentication pages (login/register)
3. **IMPL-006**: Implement dashboard and image generation workspace
4. **IMPL-007**: Implement gallery and image history
5. **IMPL-008**: Implement user profile and API key management
6. **IMPL-009**: Implement admin panel
7. **IMPL-010**: Update server.js to serve new frontend
8. **IMPL-011**: Test and validate all integrations

---

## Notes

- The template includes Supabase integration scripts, which can be removed if not needed
- Stripe integration is included for payment processing (can be removed if not needed)
- The template uses TypeScript - all new files should use `.tsx` or `.ts` extensions
- shadcn/ui components are highly customizable via Tailwind CSS

---

## Troubleshooting

### If npm install fails:
1. Check Node.js version (requires Node 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and package-lock.json, then retry

### If shadcn/ui initialization fails:
1. Install dependencies first: `npm install`
2. Run shadcn init separately: `npx shadcn@latest init`
3. Add components manually: `npx shadcn@latest add button card input`

---

**Status**: Ready for dependency installation ✓
