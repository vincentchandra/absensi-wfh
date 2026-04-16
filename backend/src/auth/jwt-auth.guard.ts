import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Equivalent to Spring's @PreAuthorize but for authentication check only.
// Usage: @UseGuards(JwtAuthGuard) on controller or route handler

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
