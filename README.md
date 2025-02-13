# Social Media Backend

A NestJS-based backend for a social media application.

## Tech Stack

NestJS | TypeORM | PostgreSQL | JWT | bcrypt | class-validator | class-transformer | Morgan | ESLint | Prettier | Git | GitHub | Postman | Laragon

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Postman (for API testing)

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd social-media-backend

# Install dependencies
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=social_media_db

# Security Configuration
SALT_ROUNDS=10
JWT_SECRET=your_secure_jwt_secret_here
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server will be available at `http://localhost:3001/api`

## Database Structure

### Users

- `id`: number (Primary Key)
- `name`: string
- `email`: string
- `password`: string
- `friendList`: User[]
- `comments`: Comment[]
- `posts`: Post[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Posts

- `id`: number (Primary Key)
- `content`: string
- `owner`: User
- `visibility`: boolean
- `likes`: User[]
- `comments`: Comment[]
- `shares`: User[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Comments

- `id`: number (Primary Key)
- `content`: string
- `post`: Post
- `owner`: User
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Relations

- `id`: number (Primary Key)
- `sender`: User
- `receiver`: User
- `status`: 'pending' | 'accepted'
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Database Relationships

- Users can have many friends (self-referencing Many-to-Many)
- Users can create many posts (One-to-Many)
- Users can write many comments (One-to-Many)
- Posts can have many comments (One-to-Many)
- Users can like many posts (Many-to-Many)
- Users can share many posts (Many-to-Many)
- Users can send/receive friend requests (Many-to-One through Relations)

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Posts

- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `GET /posts/feed` - Get personalized feed of posts from friends and visible
- `POST /posts` - Create new post
- `PATCH /posts/:id/like` - Toggle like on a post
- `PATCH /posts/:id/comment` - Add comment to post
- `PATCH /posts/:id/share` - Share a post to your profile

### friends
- `POST /friends/request` - send friend request
- `PATCH /friends/accept` - Accept pending friend request
- `DELETE /friends/delete/:id` - Remove friend or cancel request


### Online API Documentation
View the complete API documentation online:
[Social Media Nestjs app API Documentation](https://documenter.getpostman.com/view/28731276/2sAYXCkyc2)

## Features

- JWT-based authentication
- Request logging with Morgan
- CORS enabled
- API route prefix
- TypeScript implementation
- ESLint + Prettier configuration

