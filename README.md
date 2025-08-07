# QuestForge - Tabletop Companion App

QuestForge is a comprehensive web application designed to enhance your tabletop gaming experience. Built with modern web technologies, it provides tools for campaign management, character sheets, real-time chat, dice rolling, and AI-powered assistance for Game Masters.

## 🚀 Features

### Core Features
- **User Authentication & Profiles**: Secure registration/login with customizable user profiles
- **Campaign Management**: Create and manage tabletop campaigns with public/private settings
- **Character Sheets**: Full-featured character sheets with automatic calculations
- **Real-time Chat**: WebSocket-powered chat system with multiple room support
- **Dice Roller**: Advanced dice rolling with standard notation support (2d6+3, advantage/disadvantage)
- **AI Assistance**: AI-powered plot suggestions and story help for Game Masters

### Advanced Features
- **Multi-room Chat**: Separate channels for different types of communication (IC, OOC, GM-only)
- **Campaign Invites**: Invite players via invite codes or direct invitations
- **Character Management**: Upload, edit, and share character sheets within campaigns
- **Session Logging**: Track game sessions and campaign statistics
- **Real-time Notifications**: Get notified of campaign updates and messages

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **Socket.IO** for real-time communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend (Coming Soon)
- **React.js** for user interface
- **Socket.IO Client** for real-time features
- Modern CSS/SCSS for styling

### Security & Performance
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **CORS** configuration
- **Input validation** with express-validator

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd questforge
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/questforge
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5.0
   ```

5. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup (Coming Soon)

The frontend React application will be available in the `frontend` directory.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Campaign Endpoints

- `GET /api/campaigns` - Get user's campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Character Endpoints

- `GET /api/characters` - Get user's characters
- `POST /api/characters` - Create new character
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character

### Real-time Events (Socket.IO)

#### Chat Events
- `join-campaign-chat` - Join a campaign chat room
- `send-message` - Send a message
- `new-message` - Receive new message
- `typing-start/stop` - Typing indicators

#### Campaign Events
- `join-campaign` - Join campaign updates
- `campaign-updated` - Campaign changes
- `character-updated` - Character changes

## 🎲 Dice Rolling

QuestForge supports standard tabletop dice notation:

- `1d20` - Single twenty-sided die
- `2d6+3` - Two six-sided dice plus 3
- `1d8-1` - Single eight-sided die minus 1
- `4d6` - Four six-sided dice

Special features:
- Advantage/Disadvantage for d20 rolls
- Automatic calculation and logging
- Integration with chat system

## 🗄️ Database Schema

### User Model
- Authentication fields (username, email, password)
- Profile information (display name, avatar, bio)
- Campaign associations and settings
- User preferences and settings

### Campaign Model
- Basic info (name, description, system)
- GM and player management
- Settings (public/private, level ranges, allowed classes)
- Chat room configurations
- Session tracking

### Character Model
- Complete character sheet
- Ability scores with automatic modifier calculation
- Skills, features, equipment, spellcasting
- Currency, description, and notes
- Campaign association

### Message Model
- Chat messages with rich content support
- Dice roll integration
- Reactions and threading
- Message editing and deletion

## 🔧 Development

### Project Structure
```
questforge/
├── backend/
│   ├── config/          # Database and app configuration
│   ├── models/          # MongoDB models
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Custom middleware
│   ├── socket/          # Socket.IO event handlers
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/            # React frontend (coming soon)
├── docs/                # Documentation
└── README.md
```

### Environment Variables

Required environment variables:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

### Development Commands

```bash
# Start development server with auto-restart
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## 🚢 Deployment

### Render.com Deployment

The application is configured for deployment on Render.com:

1. Connect your GitHub repository to Render
2. Set up environment variables in Render dashboard
3. Deploy backend service
4. Configure MongoDB Atlas for production database

### Production Environment

- Use MongoDB Atlas for database hosting
- Set strong JWT secrets and environment variables
- Enable rate limiting and security middleware
- Configure proper CORS settings

## 🤖 AI Integration

QuestForge is designed to integrate with AI services for:

- Plot and story suggestions for Game Masters
- Character creation assistance
- Campaign idea generation
- Rule clarifications and help

The AI integration endpoints are ready for connection to your preferred AI service.

## 🛣️ Roadmap

### Phase 1 (Current)
- [x] Backend API architecture
- [x] Authentication system
- [x] Database models
- [x] Socket.IO real-time features
- [x] Dice rolling system

### Phase 2 (In Progress)
- [ ] React frontend development
- [ ] Character sheet UI
- [ ] Campaign management interface
- [ ] Chat system UI

### Phase 3 (Planned)
- [ ] AI integration implementation
- [ ] Mobile responsiveness
- [ ] Advanced character features
- [ ] Session recording and playback
- [ ] Map and image sharing

## 🤝 Contributing

We welcome contributions to QuestForge! Please feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Getting Started with Tabletop Gaming

New to tabletop gaming? QuestForge is designed to be beginner-friendly while providing advanced features for experienced players. Check out our documentation for guides on:

- Creating your first character
- Joining a campaign
- Basic dice rolling
- Chat etiquette

## 📞 Support

For support, questions, or feature requests:

- Create an issue on GitHub
- Join our Discord community (coming soon)
- Check the documentation in the `docs/` folder

---

**Happy Gaming! 🎲**

*QuestForge - Where epic adventures begin.*
