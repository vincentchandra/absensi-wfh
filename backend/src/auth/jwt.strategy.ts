import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// This is similar to Spring Security's JwtAuthenticationFilter.
// It intercepts requests, extracts the JWT from the Authorization header,
// validates it, and attaches the decoded payload to the request object.

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  // The return value of validate() gets attached to request.user
  // Similar to Spring's SecurityContextHolder.getContext().getAuthentication()
  async validate(payload: {
    sub: number;
    username: string;
    role: string;
    employeeId: number | null;
  }) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      employeeId: payload.employeeId,
    };
  }
}
