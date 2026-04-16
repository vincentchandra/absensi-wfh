import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

// Custom decorator to set required roles on an endpoint.
// Similar to Spring's @RolesAllowed or @PreAuthorize("hasRole('ADMIN')")
// Usage: @Roles(UserRole.ADMIN)

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
