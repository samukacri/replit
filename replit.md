# Project Management Application

## Overview

This is a full-stack project management application built with React, Express, and PostgreSQL. The application provides a Kanban-style interface for managing projects, tasks, and team collaboration with real-time updates via WebSockets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket connections for live updates
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming

## Key Components

### Frontend Architecture
- **Client Directory**: Contains all React application code
- **Component Structure**: Organized into UI components, pages, and feature-specific components
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Drag & Drop**: Custom implementation for Kanban board interactions

### Backend Architecture
- **Server Directory**: Express.js application with TypeScript
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **API Routes**: RESTful endpoints with WebSocket support
- **File Uploads**: Multer for handling attachments
- **Real-time**: WebSocket server for live collaboration

### Database Schema
The schema supports a comprehensive project management system:
- **Users**: Basic user information and authentication
- **Projects**: Project metadata with progress tracking
- **Columns**: Kanban board columns with customizable colors
- **Cards**: Individual tasks with priority, deadlines, and progress
- **Tags & Entities**: Categorization and relationship management
- **Comments & Attachments**: Rich task details and file support
- **Activity Log**: Audit trail for all changes

## Data Flow

1. **Client Requests**: React components use React Query to fetch data from Express API endpoints
2. **Server Processing**: Express routes handle business logic and database operations via Drizzle ORM
3. **Real-time Updates**: WebSocket connections broadcast changes to all connected clients
4. **State Synchronization**: React Query automatically updates UI when server state changes

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Cloud-hosted database with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations

### UI Components
- **Radix UI**: Comprehensive set of accessible, unstyled components
- **Shadcn/ui**: Pre-styled components built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework with custom theming

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development Mode**: Vite dev server with Express API proxy
- **Production Build**: Static files served by Express with API routes
- **Database**: Environment variable configuration for DATABASE_URL
- **File Storage**: Local file system for attachments (upgradeable to cloud storage)

### Build Process
1. Client code builds to `dist/public` directory
2. Server code bundles to `dist/index.js` using esbuild
3. Production server serves static files and API endpoints from single process

### Environment Configuration
- Development: Uses Vite dev server with middleware mode
- Production: Express serves built static files
- Database: Automatic connection to provisioned PostgreSQL instance