# Smart Form Builder Frontend

This is the frontend (React) application for the Smart Form Builder project. It allows users to create, submit, and manage forms with a modern UI, drag-and-drop field builder, and CSV export. Designed to be embedded in WordPress or used standalone.

## Features
- Modern, mobile-friendly UI with React Bootstrap
- Drag-and-drop form builder (dnd-kit)
- Dynamic form fields (text, number, email, date, select, radio, checkbox, file, etc.)
- Admin and user views
- CSV export of submissions
- Email-based filtering
- WordPress plugin integration (via iframe)
- Role-based access (admin/user)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
The build output will be in the `dist` folder.

### Environment Variables
Create a `.env` file in the `client` folder:
```
VITE_API_URL=http://localhost:5000/api
```

### WordPress Integration
- Use the provided WordPress plugin to embed the React app via iframe.
- Pass the `role` parameter in the URL for admin/user views.

## Folder Structure
- `src/components/` — React components
- `src/api/` — API calls
- `public/` — Static assets

## Dependencies
- React, React Router DOM
- React Bootstrap, Bootstrap
- dnd-kit

## License
MIT
