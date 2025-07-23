# Smart Form Builder (Fullstack)

This repository contains both the frontend (React) and backend (Node.js/Express/MongoDB) for the Smart Form Builder project.

## Project Structure
- `client/` — React frontend
- `server/` — Express backend
- `smart-form-builder-plugin.php` — WordPress plugin for embedding

## Setup Instructions

### 1. Backend (server)
#### Prerequisites
- Node.js (v16+ recommended)
- MongoDB

#### Installation
```bash
cd server
npm install
```

#### Environment Variables
Create a `.env` file in the `server` folder:
```
MONGO_URL=mongodb://localhost:27017/smart-form-builder
JWT_SECRET=your_jwt_secret
```

#### Start the Server
```bash
npm run dev
```

### 2. Frontend (client)
See `client/README.md` for full instructions.

### 3. WordPress Plugin
- See `smart-form-builder-plugin.php` for usage.
- Upload the plugin to your WordPress site and use the shortcode `[smart_form_builder role="admin"]` or `[smart_form_builder role="user"]`.

## Features
- Drag-and-drop form builder
- Admin/user role separation
- CSV export
- Email-based filtering
- WordPress integration

## License
MIT
