# 💼 DevLink – Developer Portfolio & Networking Platform

DevLink is a fullstack web application where developers can showcase their work, build personal portfolios, and connect with other developers — like GitHub meets LinkedIn for coders.

---
## 🌟 Features

### User Profiles

- **Customizable Profiles**: Create and edit your professional profile with bio, skills, and contact information
- **Portfolio Showcase**: Display your projects with descriptions, images, and links
- **Skill Tagging**: Tag your profile with relevant skills and technologies
- **Social Links**: Connect your GitHub, LinkedIn, Twitter, and other social profiles


### Project Showcase

- **Project Gallery**: Create and showcase your development projects
- **Rich Media Support**: Add images, descriptions, and links to live demos and repositories
- **Technology Tags**: Tag projects with relevant technologies and frameworks
- **Analytics**: Track views, unique visitors, and engagement metrics for your projects
- **Endorsements**: Allow other developers to endorse your projects


### Social Networking

- **Developer Discovery**: Find and connect with other developers
- **Follow System**: Follow developers to stay updated with their work
- **Project Comments**: Engage with other developers through project comments
- **Project Sharing**: Share interesting projects across social platforms


### Search & Discovery

- **Advanced Search**: Find developers and projects by skills, location, and more
- **Trending Projects**: Discover popular and trending projects
- **Related Developers**: Find developers with similar skill sets
- **Skill-based Matching**: Connect with developers who share your technical interests


### Admin Features

- **User Management**: Comprehensive tools for managing user accounts
- **Content Moderation**: Review and moderate projects and comments
- **Skills Management**: Manage the platform's skill taxonomy
- **Analytics Dashboard**: Track platform usage and engagement
---

### 🚀 Features

- 🔐 User authentication (Supabase Auth)
- 🧑‍💻 Developer profiles with tech stack and bio
- 🗂️ Project showcase with GitHub/live links
- 🌟 Project endorsements (like GitHub stars)
- 🧭 Explore and follow other devs
- 🎨 Dark/light theme toggle

---

### 🛠 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js App Router, Server Components, Server Actions
- **Database:** PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **Analytics**: Custom analytics system with PostgreSQL

---

### 📸 Screenshots

_Add screenshots here after uploading them to your repo or image host._

---

### 🧑‍🔧 Getting Started
**Installation:**
-Clone the repository:
```bash
git clone https://github.com/yourusername/devlink.git
cd devlink
```
-Install dependencies:
```bash
npm install
```
-Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (provided by Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# JWT
SUPABASE_JWT_SECRET=your_jwt_secret
```
-Run the development server:
```bash
npm run dev
# Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
```
---

### 🏗️ Database Setup
The project uses Supabase for database management. To set up the database:

- **Create a new project in Supabase** 
- **Run the migration scripts located in the `supabase/migrations` directory**
- **Set up the Row Level Security policies as defined in the migrations**
---

### 📊 Database Schema
The application uses the following main tables:
- **profiles:** User profiles with personal and professional information
- **projects:** Developer projects with descriptions and links
- **skills**: Technical skills and technologies
- **user_skills**: Many-to-many relationship between users and skills
- **project_technologies**: Many-to-many relationship between projects and skills
- **follows**: User following relationships
- **project_comments**: Comments on projects
- **project_endorsements**: Endorsements for projects
- **project_views**: Analytics for project views
- **social_links**: User social media links

---
### 🔐 Authentication System
DevLink uses Supabase Authentication with:
- Email/password authentication
- Social login (optional)
- Password reset functionality
- Protected routes for authenticated users
- Role-based access control (admin vs. regular users)

---
### 📁 Project Structure
```bash
devlink/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # User dashboard
│   ├── explore/            # Discovery pages
│   ├── profile/            # Profile pages
│   ├── projects/           # Project pages
│   ├── search/             # Search functionality
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── dashboard/          # Dashboard components
│   ├── explore/            # Exploration components
│   ├── profile/            # Profile components
│   ├── projects/           # Project components
│   ├── search/             # Search components
│   └── ui/                 # UI components (shadcn/ui)
├── lib/                    # Utility functions
│   ├── database.types.ts   # Supabase database types
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
└── supabase/               # Supabase configuration
    └── migrations/         # Database migrations
```
---
### 🔄 Key Features Implementation
### View Tracking System
The platform includes a sophisticated view tracking system for projects:
- Tracks total views and unique viewers
- Prevents duplicate counts from the same user/IP within a time period
- Provides analytics on view trends over time
- Implemented with PostgreSQL functions and triggers

---
### Real-time Analytics
Project owners can access detailed analytics:
- View counts over time
- Unique visitor metrics
- Engagement rates (comments, endorsements)
- Conversion metrics

---
### Social Connections
The platform facilitates developer networking through:
- Follow/unfollow functionality
- Activity feeds
- Skill-based developer recommendations
- Project sharing capabilities

---
### 🌐 Deployment
Deploying to Vercel
- Push your code to a GitHub repository
- Connect your repository to Vercel
- Configure the environment variables in Vercel
- Deploy the application

---
### 🔮 Future Enhancements
- **Messaging System**: Direct messaging between developers
- **Job Board Integration**: Connect developers with job opportunities
- **Advanced Analytics**: More detailed project and profile analytics
- **Content Creation**: Blog/article publishing for developers
- **Events and Webinars**: Virtual events and knowledge sharing

---
### 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
### 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
- Fork the repository
- Create your feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add some amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

---
### 📞 Contact
### Olisemeka Okpaleke - [@Linkedin](https://www.linkedin.com/in/olisemeka-okpaleke-9087a82b3/) - [olisemekaokpaleke08@gmail.com](mailto:olisemekaokpaleke08@gmail.com)

---
Built by **Olisemeka Okpaleke**
  






