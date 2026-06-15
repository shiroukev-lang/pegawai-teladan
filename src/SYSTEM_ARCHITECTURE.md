# 🏗️ System Architecture - Admin Leveling

## 📐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Access /admin                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              AdminPasswordDialog Component                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Check sessionStorage:                                    │  │
│  │  - admin_authenticated = 'true'?                         │  │
│  │  - admin_level = 'super_admin' | 'admin'?               │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│         ┌───────────────┴────────────────┐                     │
│         ▼ YES                             ▼ NO                  │
│  ┌──────────────┐              ┌─────────────────────┐         │
│  │ Auto Login   │              │ Show Password Form  │         │
│  │ Skip Dialog  │              │                     │         │
│  └──────┬───────┘              └──────────┬──────────┘         │
│         │                                  │                    │
│         │                      ┌───────────▼──────────┐        │
│         │                      │ User Enters Password │        │
│         │                      └───────────┬──────────┘        │
│         │                                  │                    │
│         │              ┌───────────────────┴────────────────┐  │
│         │              │   Password Validation:              │  │
│         │              │   - 'tlhpteladan123' → Super Admin  │  │
│         │              │   - 'adminteladan123' → Admin       │  │
│         │              │   - Other → Error                   │  │
│         │              └───────────┬────────────────────────┘  │
│         │                          │                            │
│         └──────────────────────────┘                            │
│                         │                                        │
│                         ▼                                        │
│         ┌───────────────────────────────────┐                  │
│         │ Save to sessionStorage:           │                  │
│         │ - admin_authenticated = 'true'    │                  │
│         │ - admin_level = selected level    │                  │
│         └───────────────┬───────────────────┘                  │
│                         │                                        │
│                         ▼                                        │
│         ┌───────────────────────────────────┐                  │
│         │ onAuthenticated(level) callback   │                  │
│         └───────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AdminDashboard Component                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Set State:                                               │  │
│  │  - isAuthenticated = true                                │  │
│  │  - adminLevel = 'super_admin' | 'admin'                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│                  Render Dashboard with:                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Header: Badge showing admin level                 │        │
│  │  - 🛡️ Super Admin (Blue) or 👤 Admin (Gray)      │        │
│  └────────────────────────────────────────────────────┘        │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │  Conditional Tab Rendering:                        │        │
│  │                                                     │        │
│  │  IF adminLevel === 'super_admin':                 │        │
│  │    Show: 6 tabs (All features)                    │        │
│  │    - Overview ✅                                   │        │
│  │    - Pegawai ✅                                    │        │
│  │    - Kandidat ✅                                   │        │
│  │    - Hasil Tahap 1 ✅                             │        │
│  │    - Hasil Tahap 2 ✅                             │        │
│  │    - Settings ✅                                   │        │
│  │                                                     │        │
│  │  ELSE IF adminLevel === 'admin':                  │        │
│  │    Show: 3 tabs (Read-only)                       │        │
│  │    - Overview ✅                                   │        │
│  │    - Hasil Tahap 1 ✅ (View only)                │        │
│  │    - Hasil Tahap 2 ✅ (View only)                │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Structure

```
/components/
│
├── AdminPasswordDialog.tsx
│   ├── Constants:
│   │   ├── SUPER_ADMIN_PASSWORD = 'tlhpteladan123'
│   │   ├── ADMIN_PASSWORD = 'adminteladan123'
│   │   ├── SESSION_KEY = 'admin_authenticated'
│   │   └── ADMIN_LEVEL_KEY = 'admin_level'
│   │
│   ├── Exports:
│   │   ├── type AdminLevel = 'super_admin' | 'admin'
│   │   ├── AdminPasswordDialog component
│   │   ├── logoutAdmin() function
│   │   ├── getAdminLevel() function
│   │   └── isSuperAdmin() function
│   │
│   └── Features:
│       ├── Password validation
│       ├── Session management
│       ├── Auto-login on refresh
│       └── Error handling
│
└── AdminDashboard.tsx
    ├── Imports:
    │   └── AdminLevel type from AdminPasswordDialog
    │
    ├── State:
    │   ├── isAuthenticated: boolean
    │   ├── adminLevel: AdminLevel
    │   └── ... (other states)
    │
    ├── UI Elements:
    │   ├── Admin Level Badge
    │   ├── Logout Button
    │   ├── Conditional TabsList
    │   └── Conditional TabsContent
    │
    └── Logic:
        ├── Handle authentication callback
        ├── Render tabs based on level
        └── Show/hide features per level
```

---

## 🔒 Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                        Security Layers                      │
└─────────────────────────────────────────────────────────────┘

Layer 1: Authentication
├── Password-based verification
├── No credentials in database
├── Session-based (not persistent)
└── Auto-logout on browser close

Layer 2: Authorization
├── AdminLevel type enforcement
├── Conditional component rendering
├── Tab visibility control
└── Feature access control

Layer 3: Session Management
├── sessionStorage for temporary storage
├── Two keys: auth status + admin level
├── Clear on logout
└── Validate on each render

Layer 4: UI/UX Protection
├── Restricted tabs not rendered at all
├── Visual indicators (badges)
├── Error messages for invalid access
└── Graceful degradation
```

---

## 📊 Data Flow

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Password Verification   │
│  - Match super_admin?    │
│  - Match admin?          │
│  - No match → Error      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Determine AdminLevel    │
│  - super_admin           │
│  - admin                 │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Save to sessionStorage  │
│  - admin_authenticated   │
│  - admin_level           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Update Dashboard State  │
│  - isAuthenticated=true  │
│  - adminLevel=level      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Render Based on Level               │
├──────────────────────────────────────┤
│  Super Admin:                        │
│  └─> All tabs + All features         │
│                                       │
│  Admin:                              │
│  └─> Limited tabs + Read-only        │
└──────────────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
AdminDashboard
│
├── {!isAuthenticated}
│   └── AdminPasswordDialog
│       ├── Password Input
│       ├── Login Button
│       ├── Error Alert
│       └── Access Info
│
└── {isAuthenticated}
    ├── Header
    │   ├── Admin Level Badge
    │   │   ├── 🛡️ Super Admin (if super_admin)
    │   │   └── 👤 Admin (if admin)
    │   └── Logout Button
    │
    ├── Logo Section
    │   ├── Logo Pengayoman
    │   └── Logo Inspektorat Jenderal
    │
    └── Tabs Component
        ├── TabsList (conditional layout)
        │   │
        │   ├── {All Levels}
        │   │   ├── Overview Tab
        │   │   ├── Hasil Tahap 1 Tab
        │   │   └── Hasil Tahap 2 Tab
        │   │
        │   └── {Super Admin Only}
        │       ├── Pegawai Tab
        │       ├── Kandidat Tab
        │       └── Settings Tab
        │
        └── TabsContent
            ├── Overview (All)
            ├── {Super Admin} Pegawai
            ├── {Super Admin} Kandidat
            ├── Hasil Tahap 1 (All)
            ├── Hasil Tahap 2 (All)
            └── {Super Admin} Settings
```

---

## 🔄 Session Lifecycle

```
[Browser Open] 
       │
       ▼
[Navigate to /admin]
       │
       ▼
[Check sessionStorage]
       │
       ├─> Found? ──> [Auto Login] ──> [Show Dashboard]
       │
       └─> Not Found? ──> [Show Password Dialog]
                                 │
                                 ▼
                          [User Enters Password]
                                 │
                                 ▼
                          [Validate & Save]
                                 │
                                 ▼
                          [Show Dashboard]
                                 │
                                 ▼
                      [User Clicks Logout]
                                 │
                                 ▼
                      [Clear sessionStorage]
                                 │
                                 ▼
                         [Reload Page]
                                 │
                                 ▼
                   [Back to Password Dialog]

[Browser Close] ──> [sessionStorage Cleared Automatically]
```

---

## 💾 Storage Structure

```javascript
// sessionStorage keys and values
{
  "admin_authenticated": "true",           // boolean as string
  "admin_level": "super_admin" | "admin"   // AdminLevel type
}
```

---

## 🚦 Permission Matrix

```
Feature                    Super Admin    Admin
─────────────────────────────────────────────────
View Overview              ✅             ✅
View Statistics            ✅             ✅
View Results Phase 1       ✅             ✅
View Results Phase 2       ✅             ✅
Export Reports             ✅             ✅
Add Pegawai                ✅             ❌
Edit Pegawai               ✅             ❌
Delete Pegawai             ✅             ❌
Generate Voting Link       ✅             ❌
Add Kandidat               ✅             ❌
Edit Kandidat              ✅             ❌
Delete Kandidat            ✅             ❌
Change Voting Phase        ✅             ❌
Reset Phase 1 Votes        ✅             ❌
Reset Phase 2 Votes        ✅             ❌
Reset All Data             ✅             ❌
```

---

**Last Updated:** December 2024  
**Architecture Version:** 2.0  
**Status:** ✅ Implemented & Tested
