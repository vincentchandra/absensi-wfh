import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MfaService } from './mfa.service';
import * as speakeasy from 'speakeasy';

describe('MfaService', () => {
  let service: MfaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MFA_ENCRYPTION_KEY') {
                return '12345678901234567890123456789012';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSecret', () => {
    it('should generate a secret with base32 encoding', () => {
      const result = service.generateSecret();
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('otpauthUrl');
      expect(typeof result.secret).toBe('string');
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.otpauthUrl).toContain('otpauth://');
    });
  });

  describe('generateQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const otpauthUrl = 'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP';
      const qrCode = await service.generateQRCode(otpauthUrl);
      expect(qrCode).toContain('data:image/png;base64');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid TOTP token', () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
      });
      const isValid = service.verifyToken(secret.base32, token);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid TOTP token', () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      const isValid = service.verifyToken(secret.base32, '000000');
      expect(isValid).toBe(false);
    });
  });

  describe('encryptSecret and decryptSecret', () => {
    it('should encrypt and decrypt a secret correctly', () => {
      const originalSecret = 'JBSWY3DPEHPK3PXP';
      const encrypted = service.encryptSecret(originalSecret);
      expect(encrypted).not.toBe(originalSecret);
      expect(encrypted).toContain(':');

      const decrypted = service.decryptSecret(encrypted);
      expect(decrypted).toBe(originalSecret);
    });

    it('should produce different encrypted values for the same input', () => {
      const originalSecret = 'JBSWY3DPEHPK3PXP';
      const encrypted1 = service.encryptSecret(originalSecret);
      const encrypted2 = service.encryptSecret(originalSecret);
      expect(encrypted1).not.toBe(encrypted2);

      const decrypted1 = service.decryptSecret(encrypted1);
      const decrypted2 = service.decryptSecret(encrypted2);
      expect(decrypted1).toBe(originalSecret);
      expect(decrypted2).toBe(originalSecret);
    });
  });

  describe('constructor validation', () => {
    it('should throw an error if MFA_ENCRYPTION_KEY is not 32 characters', () => {
      expect(() => {
        const mockConfigService = {
          get: jest.fn(() => 'short-key'),
        };
        new MfaService(mockConfigService as any);
      }).toThrow('MFA_ENCRYPTION_KEY must be exactly 32 characters long');
    });
  });
});
