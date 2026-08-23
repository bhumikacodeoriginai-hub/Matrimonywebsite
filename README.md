# 🕉️ Advaita Matrimony - Complete Platform

## India's Most Inclusive Matrimonial Platform

Advaita Matrimony is a dedicated, inclusive matrimonial platform supporting:
- **General Public** (Standard Matrimony)
- **Physically Challenged / Divyangjan** (Locomotor Impairment)
- **Hearing & Speech Impaired** (Deaf & Mute)
- **Vitiligo / Skin Condition** Specific Profiles

---

## 📁 Project Structure

```
Matrimonywebsite/
├── advaita-matrimony-web/          # Laravel Backend + Web Frontend + Admin Panel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/                # Mobile App REST API Controllers
│   │   │   ├── Admin/             # Admin Panel Controllers
│   │   │   └── Web/               # Website Controllers
│   │   ├── Models/                # Eloquent Models (User, Profile, etc.)
│   │   ├── Services/             # Business Logic (OTP, Payment, Photo, Match)
│   │   └── Helpers/
│   ├── database/migrations/       # All DB Migrations
│   ├── resources/views/           # Blade Templates
│   │   ├── layouts/              # Master layouts
│   │   ├── pages/                # Public pages (Home, About, etc.)
│   │   ├── admin/                # Admin Panel views
│   │   ├── auth/                 # Login/Register pages
│   │   └── partials/             # Navbar, Footer
│   ├── routes/
│   │   ├── api.php               # REST API routes (for mobile app)
│   │   └── web.php               # Website + Admin routes
│   └── config/
│
├── advaita-matrimony-flutter/      # Flutter Mobile App (Android + iOS)
│   ├── lib/
│   │   ├── main.dart             # App entry point
│   │   ├── screens/              # All UI screens
│   │   │   ├── splash/           # Animated splash screen
│   │   │   ├── auth/             # Login, Register, OTP
│   │   │   ├── home/             # Main home with recommendations
│   │   │   ├── search/           # Advanced multi-criteria search
│   │   │   ├── matches/          # Interests, mutual matches
│   │   │   ├── chat/             # Real-time messaging
│   │   │   ├── profile/          # View/Edit profile
│   │   │   ├── subscription/     # Plans & payment
│   │   │   └── settings/         # App settings
│   │   ├── providers/            # State management (Provider)
│   │   ├── services/             # API service layer
│   │   ├── theme/                # App theme, colors, styles
│   │   ├── utils/                # Security, helpers
│   │   └── widgets/              # Reusable UI components
│   ├── assets/
│   └── pubspec.yaml
│
└── README.md                      # This file
```

---

## 🚀 Tech Stack

### Backend (Website + API)
| Component | Technology |
|-----------|-----------|
| Framework | Laravel 11 (PHP 8.2+) |
| Database | MySQL 8.0 |
| Cache | Redis |
| Auth | Laravel Sanctum (Token-based) |
| Payments | Razorpay + PhonePe |
| OTP | Fast2SMS + MSG91 + WhatsApp |
| Storage | Local / AWS S3 |
| Queue | Redis + Laravel Queue |
| Real-time | Pusher / WebSocket |
| Frontend | Blade + Tailwind CSS + AOS Animations |

### Mobile App
| Component | Technology |
|-----------|-----------|
| Framework | Flutter 3.x (Dart) |
| State | Provider |
| HTTP | Dio |
| Auth Storage | flutter_secure_storage |
| Payments | razorpay_flutter |
| Push | Firebase Cloud Messaging |
| Security | flutter_windowmanager (Screenshot Prevention) |
| Images | cached_network_image + image_cropper |

---

## ✨ Key Features

### Custom Categorization & Search Filters
- 4 distinct profile categories with specialized fields
- Multi-criteria search: age, location, community, disability type, etc.
- AI-powered match scoring (compatibility percentage)

### Profile Fields & Attributes
- Disability type dropdown (Locomotor, Cerebral Palsy, Muscular Dystrophy, etc.)
- Disability percentage (0-100%)
- UDID verification status tracking
- Hearing condition, speech condition, sign language knowledge
- Vitiligo coverage level, affected areas, stability status
- Full personal, educational, family, and lifestyle details

### Privacy & Security Controls
- **Photo Privacy**: Blur for non-members, watermarking with "Advaita Matrimony"
- **Request Access**: Users must request to view full photos
- **Contact Masking**: Phone/email hidden for free users
- **Screenshot Prevention**: FLAG_SECURE on Android for profile photos
- **Manual Profile Approval**: Admin reviews every profile before activation
- **UDID Certificate Verification**: Admin verifies disability certificates

### Payment Gateway
- Razorpay integration (UPI, Cards, Net Banking, Wallets)
- PhonePe integration
- Multiple subscription tiers (Silver, Gold, Platinum)
- Admin can enable 100% FREE mode

### Admin Panel Features
- Real-time dashboard with KPIs
- Profile approval/rejection workflow
- Photo approval queue
- UDID verification management
- Subscription package management
- Banner & content management
- Legal pages editor (Terms, Privacy, Refund)
- Revenue analytics
- Member search & management
- Reports management
- Free mode toggle

---

## 🔧 Setup Instructions

### Backend (Laravel)
```bash
cd advaita-matrimony-web
composer install
cp .env.example .env
php artisan key:generate
# Configure .env with your database, payment, and SMS credentials
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Flutter App
```bash
cd advaita-matrimony-flutter
flutter pub get
# Update lib/services/api_service.dart with your API URL
flutter run
# For release build:
flutter build apk --release
flutter build appbundle --release
```

---

## 📱 API Endpoints Summary

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP & Login
- `POST /api/v1/auth/register` - Complete Registration
- `POST /api/v1/auth/login` - Email/Phone + Password Login

### Profile
- `GET /api/v1/profile/me` - Get My Profile
- `PUT /api/v1/profile/update` - Update Profile
- `POST /api/v1/profile/photo/upload` - Upload Photo
- `GET /api/v1/profiles/{id}` - View Another Profile

### Search & Discovery
- `GET /api/v1/matches/recommended` - AI Recommendations
- `GET /api/v1/search` - Advanced Search with Filters
- `GET /api/v1/filter-options` - Get Dropdown Options

### Interests & Matching
- `POST /api/v1/interests/send/{id}` - Send Interest
- `PUT /api/v1/interests/{id}/respond` - Accept/Reject
- `GET /api/v1/interests/mutual` - Mutual Matches

### Chat
- `GET /api/v1/chat/conversations` - Conversations List
- `GET /api/v1/chat/conversations/{id}/messages` - Messages
- `POST /api/v1/chat/conversations/{id}/send` - Send Message

### Payments
- `GET /api/v1/packages` - Available Plans
- `POST /api/v1/payments/razorpay/create-order` - Initiate Payment
- `POST /api/v1/payments/razorpay/verify` - Verify Payment

---

## 🎨 Design Highlights

- **Modern gradient UI** with glass-morphism effects
- **Animated splash screen** with elastic spring animations
- **AOS scroll animations** on website
- **Responsive design** - works on mobile, tablet, desktop
- **Dark mode support** in Flutter app
- **Accessibility-first** design approach
- **Custom category color coding** for easy identification

---

## 📋 Deployment Checklist

- [ ] Set up VPS/Cloud server (AWS/Hostinger)
- [ ] Configure SSL certificate
- [ ] Set up MySQL database
- [ ] Configure Redis
- [ ] Update .env with all API keys
- [ ] Run migrations & seeders
- [ ] Configure Razorpay webhooks
- [ ] Set up Fast2SMS/MSG91 account
- [ ] Upload APK/AAB to Play Console
- [ ] Configure Firebase project
- [ ] Set up cron for queue worker
- [ ] Configure email (SMTP)
- [ ] Add legal pages content
- [ ] Brand assets (Logo, Icons, Colors)

---

## 📞 Support & Warranty

- 3 months post-launch bug fixing (App)
- 30-60 days post-launch support (Website)
- Handover training included

---

*Built with ❤️ for Advaita Matrimony - Where Every Heart Finds Its Match*
