# Boy-Scouts-of-the-Philippines---Paranaque-City-Council

```
boy-scout-task-manager/
│
├── backend/
│   ├── node_modules
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Supabase client setup
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js               # Check if user is logged in
│   │   │   └── errorHandler.js       # Handle errors
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, register, logout
│   │   │   ├── adminController.js
│   │   │   ├── userController.js     # Get users, update profile
│   │   │   ├── taskController.js     # Create, update, delete tasks, drag-drop status
│   │   │   ├── analyticsController.js # Get task statistics for dashboard
│   │   │   ├── archiveController.js  # Get archived tasks, handle deletion
│   │   │   ├── historyController.js
│   │   │   └── logsController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/login, /register
│   │   │   ├── adminRoutes.js
│   │   │   ├── userRoutes.js         # /api/users
│   │   │   ├── taskRoutes.js         # /api/tasks (CRUD + update status)
│   │   │   ├── analyticsRoutes.js    # /api/analytics (dashboard stats)
│   │   │   ├── archiveRoutes.js      # /api/archive (archived tasks)
│   │   │   ├── historyRoutes.js
│   │   │   └── logsRoutes.js
│   │   │
│   │   ├── jobs/
│   │   │   └── taskCleanup.js        # Cron job: move DONE→archive (30d), delete archive (90d)
│   │   │
│   │   └── app.js                    # Express app setup
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                     # Start server here
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   ├── index.html
│   │   └── images/
│   │       ├── logo.png              # Boy Scout logo
│   │       └── icons/
│   │           └── task-icon.png
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   │   └── background.jpg
│   │   │   └── icons/
│   │   │       └── Logo.png
│   │   │
│   │   ├── components/
│   │   │   ├── NavBar.jsx            # Top navigation bar
│   │   │   ├── KanbanBoard.jsx       # Drag-drop board (ONGOING/DONE/CANCELLED)
│   │   │   ├── TaskCard.jsx          # Single task card
│   │   │   ├── TaskForm.jsx          # Create/edit task modal
│   │   │   ├── AnalyticsChart.jsx    # Charts for dashboard
│   │   │   └── ArchiveList.jsx       # List of archived tasks
│   │   │   └── UserForm.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── AdminManagement.jsx
│   │   │   ├── RoleSection.jsx       # Admin or scout
│   │   │   ├── Register.jsx          # Sign up page
│   │   │   ├── Dashboard.jsx         # Analytics overview (charts, stats)
│   │   │   ├── Workspace.jsx         # Kanban board (main workspace)
│   │   │   └── Archive.jsx           # Archived tasks page
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.js                  # React entry point
│   │   └── index.css                 # main file
│   │   └── styles/
│   │       ├── reset.css
│   │       ├── auth.css
│   │       ├── layout.css
│   │       ├── kanban.css
│   │       ├── modal.css
│   │       ├── dashboard.css
│   │       ├── archive.css
│   │       ├── admin.css
│   │       └── responsive.css 
│   │
│   ├── .env
│   └── package-lock.json
│   └── package.json
│
├── .gitignore
└── README.md



```

```
#FIRST TIME RUNNING
cd backend 
npm install (install dependencies if not already installed)
npm start

cd frontend
npm install (install dependencies if not already installed)
npm start

#TO RUN THE PROGRAM

//terminal 1
cd backend
npm start


//terminal 2
cd frontend
npm start


```

