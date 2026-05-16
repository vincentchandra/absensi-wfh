# Multi-Factor Authentication (MFA) Implementation

## Overview
This document describes the Time-Based One-Time Password (TOTP) multi-factor authentication implementation for the absensi-wfh application.

## Features
- **Mandatory MFA**: All users must set up MFA on their first login
- **TOTP-based**: Uses Time-Based One-Time Password (TOTP) protocol compatible with Google Authenticator and similar apps
- **AES-256 Encryption**: MFA secrets are encrypted in the database using AES-256-CBC
- **Two-step login**: Separates username/password authentication from TOTP verification

## Architecture

### Backend Components

#### 1. MFA Service (`src/auth/mfa.service.ts`)
Handles all MFA-related operations:
- `generateSecret()`: Generates a new TOTP secret
- `generateQRCode()`: Creates QR code for authenticator apps
- `verifyToken()`: Validates TOTP codes
- `encryptSecret()`: Encrypts secrets using AES-256
- `decryptSecret()`: Decrypts stored secrets

#### 2. Auth Service Updates (`src/auth/auth.service.ts`)
Modified login flow:
- `login()`: First step - validates credentials and returns temporary token
  - If MFA not enabled: generates QR code for setup
  - If MFA enabled: prompts for TOTP code
- `verifyTotp()`: Second step - validates TOTP and returns JWT access token

#### 3. Database Schema (`src/users/entities/user.entity.ts`)
New fields added to User entity:
- `mfaSecret`: Encrypted TOTP secret (nullable text)
- `mfaEnabled`: Boolean flag indicating if MFA is active

#### 4. API Endpoints (`src/auth/auth.controller.ts`)
- `POST /auth/login`: Step 1 - Username/password authentication
- `POST /auth/verify-totp`: Step 2 - TOTP verification

### Frontend Components

#### Login Page Updates (`frontend/src/pages/LoginPage.jsx`)
Two-step authentication flow:
1. **Step 1**: Username and password entry
2. **Step 2**: TOTP verification
   - Shows QR code for first-time setup
   - Shows input field for TOTP code entry

## Configuration

### Environment Variables
Add to `.env` file:
```bash
MFA_ENCRYPTION_KEY=your_32_character_encryption_key_here_use_random_string
```

**Important**: The encryption key must be exactly 32 characters long for AES-256.

### Database Migration
Run the migration script:
```sql
ALTER TABLE users 
ADD COLUMN mfa_secret TEXT NULL,
ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_users_mfa_enabled ON users(mfa_enabled);
```

## Installation

### Backend Dependencies
```bash
cd backend
npm install speakeasy qrcode @types/speakeasy @types/qrcode
```

## Usage Flow

### First-Time Login
1. User enters username and password
2. System generates QR code and temporary token
3. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
4. User enters 6-digit TOTP code from app
5. System validates code and issues JWT access token
6. MFA is now enabled for the user

### Subsequent Logins
1. User enters username and password
2. System returns temporary token
3. User enters 6-digit TOTP code from authenticator app
4. System validates code and issues JWT access token

## Security Features

### Encryption
- TOTP secrets are encrypted using AES-256-CBC before storage
- Each encryption uses a random initialization vector (IV)
- Encryption key is stored securely in environment variables

### Token Security
- Temporary tokens expire after 5 minutes
- Temporary tokens are marked with `type: 'temp'` to prevent misuse
- TOTP verification window allows ±2 time steps for clock drift

### Password Security
- Password validation occurs before MFA setup
- Invalid passwords are rejected before any MFA information is revealed

## Testing

### Unit Tests
All MFA functionality is covered by unit tests:

```bash
cd backend

# Test MFA service
npm test -- mfa.service.spec.ts

# Test auth service with MFA
npm test -- auth.service.spec.ts
```

### Test Coverage
- Secret generation and encryption/decryption
- TOTP token verification
- Two-step login flow
- Error handling for invalid tokens
- QR code generation

## API Reference

### POST /auth/login
Login with username and password (Step 1)

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (First-time user):**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requireMfaSetup": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "message": "Silakan scan QR code dengan aplikasi authenticator Anda"
}
```

**Response (Returning user):**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requireMfaSetup": false,
  "message": "Silakan masukkan kode TOTP dari aplikasi authenticator Anda"
}
```

### POST /auth/verify-totp
Verify TOTP code (Step 2)

**Request Body:**
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "totpCode": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "EMPLOYEE",
    "needResetPassword": false,
    "employee": {
      "id": 1,
      "name": "John Doe",
      "nip": "EMP001"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### "MFA_ENCRYPTION_KEY must be exactly 32 characters long"
Ensure your `.env` file has a 32-character encryption key:
```bash
MFA_ENCRYPTION_KEY=12345678901234567890123456789012
```

#### "Kode TOTP tidak valid"
- Check if the device time is synchronized correctly
- TOTP codes are time-sensitive
- Code expires every 30 seconds

#### QR Code Not Displaying
- Check if the `qrcode` package is installed
- Verify the response includes the `qrCode` field

## Recommended Authenticator Apps
- Google Authenticator (iOS/Android)
- Microsoft Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- 1Password (with TOTP support)
- Bitwarden (with TOTP support)

## Future Enhancements
- Backup codes for account recovery
- Multiple MFA methods (SMS, email)
- MFA reset functionality for administrators
- Remember device option
- Push notifications for authentication
