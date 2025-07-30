<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Kyokushin Karate Platform Development Instructions

## Project Overview
This is a MERN stack application for managing an international Kyokushin Karate organization. The project emphasizes traditional Japanese design aesthetics while providing modern web functionality.

## Design Guidelines
- **Color Palette**: Use crimson red (#dc3545), deep black (#212529), and pearl white (#f8f9fa)
- **Japanese Elements**: Incorporate Kanji characters, washi paper textures, and traditional design patterns
- **Typography**: Maintain clean, readable fonts with Japanese-inspired styling
- **Components**: Use Material-UI components with custom styling for Japanese aesthetics

## Code Style
- Use TypeScript for type safety in frontend
- Follow React functional component patterns with hooks
- Implement proper error handling and validation
- Use styled-components or Material-UI's styled API for custom styling
- Maintain consistent naming conventions

## Authentication Flow
- Role-based registration (Student/Instructor)
- JWT token authentication
- Approval workflow for new users
- Status-based access control

## API Design
- RESTful API endpoints
- Proper HTTP status codes
- JSON response format with success/error structure
- Request validation using express-validator

## Database Schema
- User model with profile information and role-based fields
- Dojo model with location and instructor relationships
- Mongoose for ODM with proper validation

## Component Structure
- Separate components by feature/page
- Reusable UI components in shared directory
- Custom styled components following Japanese design principles
- Responsive design for mobile and desktop

## State Management
- Use React hooks for local state
- Context API for global state when needed
- Form handling with react-hook-form
- Error boundary components for error handling

## Development Practices
- Environment-specific configuration
- Proper error logging
- Security best practices (password hashing, JWT validation)
- Clean code principles and documentation
