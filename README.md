# DealHarbor Frontend

A student marketplace platform built with Next.js 15, React 19, and TypeScript. This is the frontend application for DealHarbor - a marketplace designed specifically for university students to buy, sell, and trade products within their campus community.

## Overview

DealHarbor enables peer-to-peer commerce between students with features typically found in production-grade marketplace applications: real-time messaging, product lifecycle management, user authentication, and a responsive mobile-first design.

The application connects to a Spring Boot backend via REST APIs and WebSocket for real-time features.

## Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Real-time**: STOMP.js over SockJS for WebSocket communication
- **UI Components**: Radix UI, Lucide icons, Framer Motion
- **Utilities**: date-fns, lodash

## Features

### Product Management

- Create, edit, and delete product listings
- Image uploads with Next.js Image optimization
- Product categorization and condition tagging (New, Like New, Good, Fair)
- Favorite/wishlist functionality
- View counts and engagement metrics

### Product Archival System

- Manual "Mark as Sold" functionality for sellers
- Automatic archival of products after 6 months of inactivity (backend cron job)
- Statistics dashboard showing total products sold, revenue earned, and expired listings
- Paginated views of sold and unsold product history
- Price comparison between listed and final sold price

### Real-Time Messaging

The messaging system implements WhatsApp-like functionality:

- Real-time message delivery via WebSocket (STOMP protocol)
- Typing indicators with animated display
- Read receipts with visual status:
  - Single gray checkmark: Message sent
  - Double gray checkmarks: Message delivered
  - Double blue checkmarks: Message read
- Online/offline presence indicators
- Auto-reconnection with exponential backoff on connection loss
- Conversation search and filtering
- Direct chat initiation from product pages ("Chat with Seller")
- Product context preserved within conversations

### User Authentication

- Session-based authentication (JSESSIONID cookie)
- Protected routes with automatic redirect to login
- Profile management with seller verification status

### UI/UX

- Glassmorphic design with backdrop blur effects
- Custom font family (College, Rabelo, Inter, Barlow Semi Condensed)
- Pink gradient color scheme (#D97E96 primary)
- Responsive layout: mobile, tablet, and desktop breakpoints
- Smooth animations and transitions via Framer Motion
- Toast notifications for user feedback
- Loading skeletons and empty state handling

## Project Structure

```
app/
├── api/                    # API route handlers
│   ├── messages/           # Messaging endpoints
│   └── products/           # Product endpoints
├── messages/               # Messaging page and components
│   └── components/
│       ├── ChatWindow.tsx
│       ├── ConversationList.tsx
│       └── SellerSearch.tsx
├── products/[id]/          # Product detail pages
│   └── components/
│       ├── ProductActions.tsx
│       └── MarkAsSoldButton.tsx
├── profile/                # User profile pages
│   └── components/
│       ├── ProfilePageComponent.tsx
│       ├── SoldProductsTab.tsx
│       └── UnsoldProductsTab.tsx
└── globals.css

components/                 # Shared UI components
├── ArchivalStatsCard.tsx
└── ui/

lib/
├── websocket.ts           # WebSocket service singleton
└── types/
    └── conversation.ts    # TypeScript interfaces

hooks/
└── useAuth.tsx            # Authentication hook
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on http://localhost:8080

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application runs on [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Backend Requirements

The frontend expects a Spring Boot backend with the following:

- REST API endpoints for products, users, and messages
- WebSocket server at `/ws` endpoint using STOMP protocol
- PostgreSQL database for persistent storage
- Session-based authentication

### Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products` | GET/POST | Product CRUD |
| `/api/products/archived/stats` | GET | Archival statistics |
| `/api/products/archived/mark-sold/{id}` | POST | Mark product as sold |
| `/api/messages` | GET/POST | Conversations and messages |
| `/api/messages/conversations/{id}/messages` | GET | Fetch conversation messages |

### WebSocket Destinations

- `/app/chat.send` - Send messages
- `/app/chat.typing/{conversationId}` - Typing indicators
- `/app/chat.read` - Read receipts
- `/user/{userId}/queue/messages` - Receive messages
- `/user/{userId}/queue/receipts` - Delivery confirmations
- `/topic/typing/{conversationId}` - Typing broadcasts

## Development Notes

### Architecture Decisions

1. **Singleton WebSocket Service**: A single WebSocket connection is maintained throughout the application lifecycle to avoid connection overhead and ensure consistent state.

2. **Optimistic UI Updates**: Messages appear immediately in the UI while the backend confirms delivery, providing a responsive feel.

3. **Backend-Driven Conversations**: All conversation state is managed by the backend. The frontend fetches and displays data rather than maintaining complex local state.

4. **Component Colocation**: Page-specific components live alongside their pages (e.g., `app/messages/components/`) while shared components are in the root `components/` directory.

### Known Limitations

- Only 1-on-1 conversations are supported (no group chats)
- Text messages only (no image/file attachments yet)
- No message editing or deletion
- Messages are not paginated with infinite scroll (loads all at once)
- No push notifications (in-app notifications only)

## License

This project is part of DealHarbor - Student Marketplace Platform.
