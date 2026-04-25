# College Complaint & Grievance Redressal System

A comprehensive full-stack solution to help students and staff manage, track, and resolve complaints and grievances efficiently. The platform streamlines the grievance redressal process, ensuring transparency and timely resolutions with the help of AI-powered duplicate detection.

## 🚀 Features

- **Role-Based Access Control**: Separate dashboards and functionalities for Admin, HOD, TPO, Staff, and Students/Users.
- **Complaint Management**: Users can create, track, and view the status of their complaints securely.
- **AI-Powered Duplicate Registration**: Uses vector embeddings (Pinecone/Google GenAI/OpenAI) to detect and manage repeated/duplicate complaints effectively, grouping them into a `RepeatedComplaint` collection to avoid clutter.
- **Analytics & Dashboard**: Visual representation of complaint statistics, resolution rates, and departmental performance (using Recharts).
- **Authentication**: JWT-based secure authentication flow including forgot/reset password capabilities.
- **Modern UI**: Fully responsive, accessible, and dynamic user interface built with React, Tailwind CSS, and shadcn-ui components.

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn-ui
- **State Management**: React Query & Context API
- **Routing**: React Router DOM (v6)
- **Forms & Validation**: React Hook Form with Zod
- **Data Visualization**: Recharts

### Backend
- **Runtime Environment**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Vector Database**: Pinecone
- **AI & Embeddings**: Google GenAI / OpenAI (for duplicate complaint analysis)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Email Service**: Nodemailer (for resolution emails & password resets)

## 📁 Project Structure

```
Complaint-Grievance-Redressal-System/
├── Backend/                 # Express REST API
│   ├── config/              # Database & environment configurations
│   ├── controllers/         # Request handling logic
│   ├── middleWare/          # Custom middlewares (e.g., Auth)
│   ├── models/              # Mongoose Data Models
│   ├── routers/             # Express API routes
│   └── server.js            # Entry point for backend
│
└── frontend/                # React Vite App
    ├── src/
    │   ├── components/      # Reusable UI components (shadcn-ui)
    │   ├── hooks/           # Custom React hooks (e.g., useAuth)
    │   ├── layouts/         # Layout wrappers (e.g., DashboardLayout)
    │   ├── lib/             # Utilities and API clients
    │   └── pages/           # Application views (Auth, Dashboard, etc.)
    └── package.json         # Frontend dependencies
```

## 🛠️ Installation & Setup

To run this project locally, make sure you have Node.js and MongoDB installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Complaint-Grievance-Redressal-System.git
cd Complaint-Grievance-Redressal-System
```

### 2. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` root with your necessary keys (MongoDB URI, JWT Secret, Pinecone API Key, Gemini/OpenAI API Keys, Nodemailer config).
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Usage
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
