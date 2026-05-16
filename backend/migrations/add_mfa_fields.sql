-- Migration: Add MFA fields to users table
-- Date: 2026-05-16
-- Description: Adds mfa_secret and mfa_enabled columns to support multi-factor authentication

ALTER TABLE users 
ADD COLUMN mfa_secret TEXT NULL,
ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX idx_users_mfa_enabled ON users(mfa_enabled);
