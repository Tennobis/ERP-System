import { Request, Response, NextFunction } from 'express';
import { ROLE_PERMISSIONS, UserRole } from '../utils/constants';

export const checkRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(403).json({ error: 'No role assigned' });
        return;
      }

      if (userRole === 'admin') {
        next();
        return;
      }

      if (userRole !== requiredRole) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkAnyRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(403).json({ error: 'No role assigned' });
        return;
      }

      if (allowedRoles.includes(userRole as UserRole)) {
        next();
        return;
      }

      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    } catch (error) {
      next(error);
    }
  };
};

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role as UserRole;

      if (!userRole) {
        res.status(403).json({ error: 'No role assigned' });
        return;
      }

      const permissions = ROLE_PERMISSIONS[userRole];

      if (permissions.includes('*') || permissions.includes(requiredPermission)) {
        next();
        return;
      }

      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    } catch (error) {
      next(error);
    }
  };
}; 