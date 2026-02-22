# Reddit Custom Feed Manager

A powerful Next.js 14 web application for managing Reddit custom feeds (multireddits) with bulk subreddit management capabilities.

## Features

### Core Functionality
- **Reddit OAuth2 Authentication**: Secure login using Reddit's OAuth2 with PKCE flow
- **Custom Feed Management**: Create, edit, delete, and organize your Reddit custom feeds
- **Bulk Subreddit Operations**: Select and manage multiple subreddits at once
- **Real-time Search & Filtering**: Quickly find subreddits with live search and category filters
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Rate Limiting**: Respects Reddit API rate limits (60 requests/minute)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### User Interface
- Modern, clean design using Tailwind CSS
- Loading states and skeleton screens for better UX
- Toast notifications for success/error feedback
- Confirmation modals for destructive actions
- Intuitive checkbox selection for bulk operations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand & TanStack Query (React Query)
- **Authentication**: Reddit OAuth2 with PKCE
- **API Integration**: Reddit API
- **UI Components**: Custom components with Lucide icons
- **Theme**: next-themes for dark/light mode

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Reddit account
- Reddit application credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kylesnav/reddit-custom-feed-manager.git
cd reddit-custom-feed-manager
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Create Reddit Application

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in the form:
   - **Name**: Custom Feed Manager (cannot contain 'Reddit')
   - **App Type**: Select "web app"
   - **Description**: (optional) A tool for managing Reddit custom feeds
   - **About URL**: (optional) Your website or GitHub repo
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (for development)
   - **Permissions**: Leave blank
4. Click "Create app"
5. Note down your:
   - **Client ID**: Found under "web app" (the string under your app name)
   - **Client Secret**: Click "edit" to view

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Reddit credentials:
```env
# Reddit OAuth Configuration
NEXT_PUBLIC_REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Reddit Custom Feed Manager
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here

# Reddit User Agent
REDDIT_USER_AGENT=web:custom-feed-manager:v1.0.0 (by /u/your_username)
```

3. Generate a random secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Initial Setup
1. Click "Login with Reddit" on the homepage
2. Authorize the application to access your Reddit account
3. You'll be redirected to the dashboard

### Managing Custom Feeds

#### Creating a Feed
1. Click the "+" button in the Custom Feeds section
2. Enter a name and optional description
3. Choose visibility (Private/Public/Hidden)
4. Select NSFW if applicable
5. Optionally add selected subreddits immediately

#### Editing a Feed
1. Click the edit icon on any feed card
2. Modify name, description, visibility, or NSFW settings
3. Click "Update Feed" to save changes

#### Deleting a Feed
1. Click the trash icon on any feed card
2. Confirm the deletion in the modal

### Bulk Subreddit Management

#### Adding Subreddits to a Feed
1. Select subreddits using checkboxes in the left panel
2. Click on a feed in the right panel to select it
3. Click "Add X to [Feed Name]" button
4. Subreddits will be added to the selected feed

#### Removing Subreddits from a Feed
1. Select subreddits that are in the feed
2. Select the target feed
3. Click "Remove X from [Feed Name]" button

#### Search and Filter
- Use the search bar to find subreddits by name or description
- Filter by SFW/NSFW using the category buttons
- Use "Select All" to quickly select all visible subreddits

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── dashboard/        # Dashboard page
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Library code
│   ├── api/              # Reddit API integration
│   ├── auth/             # Authentication logic
│   └── context7/         # Context7 MCP client
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── styles/               # Global styles
tests/
├── e2e/                   # Playwright E2E tests
scripts/
└── context7-server.ts     # Context7 MCP server
```

## API Rate Limiting

The application implements automatic rate limiting to comply with Reddit's API restrictions:
- Maximum 60 requests per minute
- Requests are queued and processed sequentially
- Automatic retry with exponential backoff
- Visual feedback during rate limit waits

## Security Features

- **PKCE OAuth Flow**: Enhanced security for public clients
- **Secure Token Storage**: Tokens stored in httpOnly cookies
- **Automatic Token Refresh**: Seamless token renewal
- **CSRF Protection**: State parameter validation
- **Input Validation**: Client and server-side validation
- **Pre-commit Secret Scanning**: Automatic detection of hardcoded credentials
- **Environment Variable Protection**: Sensitive data kept in `.env.local`

### Security Setup for Contributors

1. **Never commit real credentials** - Always use environment variables
2. **Generate your own secrets**:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```
3. **Pre-commit hooks** are installed automatically to scan for secrets
4. **Use `.env.example`** as a template - never edit `.env.local` directly in IDE
5. **Rotate credentials regularly** if exposed

## Testing & Development Tools

### Playwright E2E Testing
The project includes comprehensive end-to-end testing:

```bash
# Run all tests
npm test

# Interactive UI mode
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### Context7 MCP Integration
AI-powered code understanding and navigation:

```bash
# Start Context7 server
npm run context7

# Development mode
npm run context7:dev
```

Features:
- Semantic code search
- Code complexity analysis
- Context-aware navigation
- Test coverage insights
- AI-assisted development

See [TESTING.md](./TESTING.md) for detailed documentation.

## Troubleshooting

### Common Issues

**Authentication Fails**
- Verify Reddit app credentials are correct
- Check redirect URI matches exactly
- Ensure cookies are enabled in browser

**Rate Limiting Errors**
- The app handles rate limiting automatically
- If persistent, check API quota hasn't been exceeded

**Subreddits Not Loading**
- Verify you're subscribed to subreddits
- Check browser console for errors
- Try refreshing the page

**Dark Mode Not Working**
- Clear browser cache
- Check system theme preferences
- Toggle manually using the theme button

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Reddit API for providing the platform
- Next.js team for the amazing framework
- All contributors and users of this project

## Support

For issues, questions, or suggestions, open an issue on GitHub.