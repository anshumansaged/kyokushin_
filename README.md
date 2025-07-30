# Kyokushin Karate Platform 🎌

A scalable MERN-based web platform for managing an international Kyokushin Karate organization with modern frontend and traditional Japanese aesthetics.

## Features

### 🥋 Core Functionality
- **Role-based Registration**: Student and Instructor registration with approval workflows
- **Dojo Management**: Create and manage dojos worldwide
- **User Authentication**: JWT-based secure authentication
- **Traditional Japanese Design**: Red-Black-White palette with Kanji watermarks

### 🎨 Design Elements
- Japanese traditional design with modern blend
- Red-Black-White color palette (#dc3545, #212529, #f8f9fa)
- Kanji watermarks and washi paper-style backgrounds
- Responsive design with Material-UI components

### 👥 User Roles
- **Students**: Request approval from instructors
- **Instructors**: Wait for director interview approval
- **Admins**: Manage users and platform settings

## Project Structure

```
kyokushin-karate-platform/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB models (User, Dojo)
│   ├── routes/             # API routes (auth, users, dojos)
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── theme/          # Material-UI theme
│   │   └── App.tsx         # Main App component
│   └── package.json        # Frontend dependencies
└── package.json            # Root package scripts
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
npm run install-all
```

2. **Set up environment variables:**
```bash
# Copy example env file in backend/
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and other settings
```

3. **Start development servers:**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Environment Variables

Create `backend/.env` file with:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kyokushin-karate
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
EMAIL_FROM=noreply@kyokushin-platform.com
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/approve` - Approve user registration

### Dojos
- `GET /api/dojos` - Get all dojos
- `POST /api/dojos` - Create new dojo

## Registration Flow

### For Students:
1. Register with email and basic information
2. Select "Student" role
3. Receive message: "Ask your instructor to approve your request"
4. Wait for instructor approval
5. Login after approval

### For Instructors:
1. Register with email and experience details
2. Select "Instructor" role
3. Receive message: "Wait for your interview call with Director"
4. Wait for director approval via interview
5. Login after approval

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## Development Scripts

```bash
# Install all dependencies
npm run install-all

# Start both servers
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build frontend for production
npm run build

# Start production server
npm start
```

## Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production MongoDB URI
- Set secure JWT secret
- Configure email service credentials

## Future Features

- Tournament management system
- Training camp organization
- Belt ranking system
- Certificate generation
- Payment integration
- Mobile app support
- Multi-language support (Japanese/English)
- Video training modules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Cultural Note

This platform is built with respect for traditional Kyokushin Karate values while embracing modern technology. The design incorporates authentic Japanese aesthetic elements to honor the martial art's origins.

**Osu!** 🥋
# karate_kyokushin
