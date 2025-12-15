# 🏥 Healthcare Portal

A comprehensive healthcare management system built with Next.js and Supabase, designed for patients, doctors, and pharmacists.

## ✨ Features

### For Patients
- 📅 **Appointment Booking** - Schedule appointments with available doctors
- 💊 **Prescription Management** - View prescription history and status
- 👤 **Profile Management** - Update personal and medical information
- 📱 **Responsive Dashboard** - Mobile-friendly interface

### For Doctors
- 🗓️ **Appointment Management** - View and manage patient appointments
- 👥 **Patient Records** - Access patient history and information
- 💉 **Digital Prescriptions** - Create and manage prescriptions
- 📊 **Dashboard Analytics** - Overview of daily activities

### For Pharmacists
- 💊 **Prescription Processing** - View and fill prescriptions
- ✅ **Status Management** - Mark prescriptions as filled/pending
- 📋 **Inventory Tracking** - Monitor prescription fulfillment

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with RLS
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Supabase account
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthCarePortal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

4. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles** - User profiles with role-based access
- **patient_profiles** - Patient-specific information
- **doctor_profiles** - Doctor credentials and specializations
- **pharmacist_profiles** - Pharmacist license and pharmacy details
- **appointments** - Appointment scheduling and management
- **prescriptions** - Digital prescription management

## 🔐 Authentication & Security

- **Row Level Security (RLS)** - Database-level security policies
- **Role-based Access Control** - Different permissions for each user type
- **Secure Authentication** - Supabase Auth with email/password
- **Data Privacy** - Users can only access their own data

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional healthcare interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Interactive Components** - Hover effects, transitions, loading states
- **Status Indicators** - Color-coded badges for appointments and prescriptions
- **Form Validation** - Client-side validation with error handling

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page
- `/login` - Authentication

### Patient Routes
- `/patient` - Dashboard
- `/patient/appointments` - Appointment list
- `/patient/appointments/book` - Book new appointment
- `/patient/prescriptions` - Prescription history
- `/patient/profile` - Profile management

### Doctor Routes
- `/doctor` - Dashboard
- `/doctor/appointments` - Appointment management
- `/doctor/patients` - Patient records
- `/doctor/prescriptions` - Prescription management
- `/doctor/prescriptions/new` - Create prescription
- `/doctor/profile` - Profile management

### Pharmacist Routes
- `/pharmacist` - Dashboard
- `/pharmacist/prescriptions` - Prescription processing
- `/pharmacist/profile` - Profile management

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables**
   - Add your Supabase URL and key in Vercel dashboard
   - Deploy: `vercel --prod`

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Structure

```
HealthCarePortal/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication pages
│   ├── patient/           # Patient portal pages
│   ├── doctor/            # Doctor portal pages
│   ├── pharmacist/        # Pharmacist portal pages
│   ├── components/        # Shared UI components
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client configuration
├── middleware.ts          # Next.js middleware for auth
└── supabase-schema.sql    # Database schema
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Supabase docs for database-related questions

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Video consultations
- [ ] Medical record attachments
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Appointment reminders (SMS/Email)

---

Built with ❤️ for better healthcare management