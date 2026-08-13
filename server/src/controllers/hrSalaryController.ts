import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const hrSalaryController = {
  // EmployeeSalary CRUD Operations
  async createEmployeeSalary(req: Request, res: Response) {
    try {
      const { employeeId, netSalary, paymentDate, remarks, earnings, deductions } = req.body;

      // Create earnings first
      const earningsRecord = await prisma.employeeSalaryEarnings.create({
        data: {
          basic: earnings.basic || 0,
          da: earnings.da || 0,
          hra: earnings.hra || 0,
          conveyance: earnings.conveyance || 0,
          allowance: earnings.allowance || 0,
          medicalAllowance: earnings.medicalAllowance || 0,
          others: earnings.others || 0,
          total: (earnings.basic || 0) + (earnings.da || 0) + (earnings.hra || 0) + 
                 (earnings.conveyance || 0) + (earnings.allowance || 0) + 
                 (earnings.medicalAllowance || 0) + (earnings.others || 0)
        }
      });

      // Create deductions
      const deductionsRecord = await prisma.employeeSalaryDeductions.create({
        data: {
          tds: deductions.tds || 0,
          esi: deductions.esi || 0,
          pf: deductions.pf || 0,
          leave: deductions.leave || 0,
          profTax: deductions.profTax || 0,
          labourWelfare: deductions.labourWelfare || 0,
          others: deductions.others || 0,
          total: (deductions.tds || 0) + (deductions.esi || 0) + (deductions.pf || 0) + 
                 (deductions.leave || 0) + (deductions.profTax || 0) + 
                 (deductions.labourWelfare || 0) + (deductions.others || 0)
        }
      });

      // Create salary record
      const salary = await prisma.employeeSalary.create({
        data: {
          employeeId,
          netSalary,
          paymentDate: paymentDate ? new Date(paymentDate) : null,
          remarks,
          earningsId: earningsRecord.id,
          deductionsId: deductionsRecord.id
        },
        include: {
          employee: true,
          earnings: true,
          deductions: true
        }
      });

      res.status(201).json(salary);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async listEmployeeSalaries(req: Request, res: Response) {
    try {
      const salaries = await prisma.employeeSalary.findMany({
        include: {
          employee: true,
          earnings: true,
          deductions: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.json(salaries);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },

  async getEmployeeSalary(req: Request, res: Response) {
    try {
      const salary = await prisma.employeeSalary.findUnique({
        where: { id: req.params.id },
        include: {
          employee: true,
          earnings: true,
          deductions: true
        }
      });
      
      if (!salary) {
        return res.status(404).json({ error: 'Salary record not found' });
      }
      
      res.json(salary);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },

  async updateEmployeeSalary(req: Request, res: Response) {
    try {
      const { netSalary, paymentDate, remarks, earnings, deductions } = req.body;
      const salaryId = req.params.id;

      // Get existing salary record
      const existingSalary = await prisma.employeeSalary.findUnique({
        where: { id: salaryId },
        include: { earnings: true, deductions: true }
      });

      if (!existingSalary) {
        return res.status(404).json({ error: 'Salary record not found' });
      }

      // Update earnings if provided
      if (earnings) {
        await prisma.employeeSalaryEarnings.update({
          where: { id: existingSalary.earningsId },
          data: {
            basic: earnings.basic || existingSalary.earnings.basic,
            da: earnings.da || existingSalary.earnings.da,
            hra: earnings.hra || existingSalary.earnings.hra,
            conveyance: earnings.conveyance || existingSalary.earnings.conveyance,
            allowance: earnings.allowance || existingSalary.earnings.allowance,
            medicalAllowance: earnings.medicalAllowance || existingSalary.earnings.medicalAllowance,
            others: earnings.others || existingSalary.earnings.others,
            total: (earnings.basic || existingSalary.earnings.basic) + 
                   (earnings.da || existingSalary.earnings.da) + 
                   (earnings.hra || existingSalary.earnings.hra) + 
                   (earnings.conveyance || existingSalary.earnings.conveyance) + 
                   (earnings.allowance || existingSalary.earnings.allowance) + 
                   (earnings.medicalAllowance || existingSalary.earnings.medicalAllowance) + 
                   (earnings.others || existingSalary.earnings.others)
          }
        });
      }

      // Update deductions if provided
      if (deductions) {
        await prisma.employeeSalaryDeductions.update({
          where: { id: existingSalary.deductionsId },
          data: {
            tds: deductions.tds || existingSalary.deductions.tds,
            esi: deductions.esi || existingSalary.deductions.esi,
            pf: deductions.pf || existingSalary.deductions.pf,
            leave: deductions.leave || existingSalary.deductions.leave,
            profTax: deductions.profTax || existingSalary.deductions.profTax,
            labourWelfare: deductions.labourWelfare || existingSalary.deductions.labourWelfare,
            others: deductions.others || existingSalary.deductions.others,
            total: (deductions.tds || existingSalary.deductions.tds) + 
                   (deductions.esi || existingSalary.deductions.esi) + 
                   (deductions.pf || existingSalary.deductions.pf) + 
                   (deductions.leave || existingSalary.deductions.leave) + 
                   (deductions.profTax || existingSalary.deductions.profTax) + 
                   (deductions.labourWelfare || existingSalary.deductions.labourWelfare) + 
                   (deductions.others || existingSalary.deductions.others)
          }
        });
      }

      // Update salary record
      const updatedSalary = await prisma.employeeSalary.update({
        where: { id: salaryId },
        data: {
          netSalary: netSalary || existingSalary.netSalary,
          paymentDate: paymentDate ? new Date(paymentDate) : existingSalary.paymentDate,
          remarks: remarks !== undefined ? remarks : existingSalary.remarks
        },
        include: {
          employee: true,
          earnings: true,
          deductions: true
        }
      });

      res.json(updatedSalary);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async deleteEmployeeSalary(req: Request, res: Response) {
    try {
      const salaryId = req.params.id;

      // Get salary record to get earnings and deductions IDs
      const salary = await prisma.employeeSalary.findUnique({
        where: { id: salaryId }
      });

      if (!salary) {
        return res.status(404).json({ error: 'Salary record not found' });
      }

      // Delete salary record (this will cascade delete earnings and deductions due to schema constraints)
      await prisma.employeeSalary.delete({
        where: { id: salaryId }
      });

      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async getEmployeeSalaries(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      
      const salaries = await prisma.employeeSalary.findMany({
        where: { employeeId },
        include: {
          earnings: true,
          deductions: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(salaries);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },

  // EmployeeSalaryEarnings CRUD Operations
  async createSalaryEarnings(req: Request, res: Response) {
    try {
      const { basic, da, hra, conveyance, allowance, medicalAllowance, others } = req.body;
      
      const earnings = await prisma.employeeSalaryEarnings.create({
        data: {
          basic: basic || 0,
          da: da || 0,
          hra: hra || 0,
          conveyance: conveyance || 0,
          allowance: allowance || 0,
          medicalAllowance: medicalAllowance || 0,
          others: others || 0,
          total: (basic || 0) + (da || 0) + (hra || 0) + (conveyance || 0) + 
                 (allowance || 0) + (medicalAllowance || 0) + (others || 0)
        }
      });

      res.status(201).json(earnings);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async getSalaryEarnings(req: Request, res: Response) {
    try {
      const earnings = await prisma.employeeSalaryEarnings.findUnique({
        where: { id: req.params.id }
      });

      if (!earnings) {
        return res.status(404).json({ error: 'Earnings record not found' });
      }

      res.json(earnings);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },

  async updateSalaryEarnings(req: Request, res: Response) {
    try {
      const { basic, da, hra, conveyance, allowance, medicalAllowance, others } = req.body;
      
      const earnings = await prisma.employeeSalaryEarnings.update({
        where: { id: req.params.id },
        data: {
          basic: basic !== undefined ? basic : undefined,
          da: da !== undefined ? da : undefined,
          hra: hra !== undefined ? hra : undefined,
          conveyance: conveyance !== undefined ? conveyance : undefined,
          allowance: allowance !== undefined ? allowance : undefined,
          medicalAllowance: medicalAllowance !== undefined ? medicalAllowance : undefined,
          others: others !== undefined ? others : undefined,
          total: (basic || 0) + (da || 0) + (hra || 0) + (conveyance || 0) + 
                 (allowance || 0) + (medicalAllowance || 0) + (others || 0)
        }
      });

      res.json(earnings);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async deleteSalaryEarnings(req: Request, res: Response) {
    try {
      await prisma.employeeSalaryEarnings.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  // EmployeeSalaryDeductions CRUD Operations
  async createSalaryDeductions(req: Request, res: Response) {
    try {
      const { tds, esi, pf, leave, profTax, labourWelfare, others } = req.body;
      
      const deductions = await prisma.employeeSalaryDeductions.create({
        data: {
          tds: tds || 0,
          esi: esi || 0,
          pf: pf || 0,
          leave: leave || 0,
          profTax: profTax || 0,
          labourWelfare: labourWelfare || 0,
          others: others || 0,
          total: (tds || 0) + (esi || 0) + (pf || 0) + (leave || 0) + 
                 (profTax || 0) + (labourWelfare || 0) + (others || 0)
        }
      });

      res.status(201).json(deductions);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async getSalaryDeductions(req: Request, res: Response) {
    try {
      const deductions = await prisma.employeeSalaryDeductions.findUnique({
        where: { id: req.params.id }
      });

      if (!deductions) {
        return res.status(404).json({ error: 'Deductions record not found' });
      }

      res.json(deductions);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unknown error' });
      }
    }
  },

  async updateSalaryDeductions(req: Request, res: Response) {
    try {
      const { tds, esi, pf, leave, profTax, labourWelfare, others } = req.body;
      
      const deductions = await prisma.employeeSalaryDeductions.update({
        where: { id: req.params.id },
        data: {
          tds: tds !== undefined ? tds : undefined,
          esi: esi !== undefined ? esi : undefined,
          pf: pf !== undefined ? pf : undefined,
          leave: leave !== undefined ? leave : undefined,
          profTax: profTax !== undefined ? profTax : undefined,
          labourWelfare: labourWelfare !== undefined ? labourWelfare : undefined,
          others: others !== undefined ? others : undefined,
          total: (tds || 0) + (esi || 0) + (pf || 0) + (leave || 0) + 
                 (profTax || 0) + (labourWelfare || 0) + (others || 0)
        }
      });

      res.json(deductions);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(400).json({ error: 'Unknown error' });
      }
    }
  },

  async deleteSalaryDeductions(req: Request, res: Response) {
    try {
      await prisma.employeeSalaryDeductions.delete({
        where: { id: req.params.id }
      });

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
