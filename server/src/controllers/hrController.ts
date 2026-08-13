import { Request, Response } from 'express';
import { prismaHRService } from '../services/prismaHRService';
import { prismaNotificationService } from '../services/prismaNotificationService';

export const hrController = {
  async createEmployee(req: Request, res: Response) {
    try {
      const employee = await prismaHRService.createEmployee(req.body);
      // Employee created successfully - no notification needed since Employee model doesn't have userId
      res.status(201).json(employee);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },
  async listEmployees(req: Request, res: Response) {
    try {
      const employees = await prismaHRService.getEmployees();
      res.json(employees);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },
  async getEmployee(req: Request, res: Response) {
    try {
      const employee = await prismaHRService.getEmployeeById(req.params.id);
      if (!employee) return res.status(404).json({ error: 'Not found' });
      res.json(employee);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },
  async updateEmployee(req: Request, res: Response) {
    try {
      const employee = await prismaHRService.updateEmployee(req.params.id, req.body);
      res.json(employee);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },
  async deleteEmployee(req: Request, res: Response) {
    try {
      await prismaHRService.deleteEmployee(req.params.id);
      // Employee deleted successfully - no notification needed since Employee model doesn't have userId
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  }
}; 