import { Router } from 'express';
import { hrSalaryController } from '../controllers/hrSalaryController';
import { authenticateUser } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';

const router = Router();

// EmployeeSalary CRUD
router.post('/employee-salaries', authenticateUser, hrSalaryController.createEmployeeSalary);
router.get('/employee-salaries', authenticateUser, hrSalaryController.listEmployeeSalaries);
router.get('/employee-salaries/:id', authenticateUser, hrSalaryController.getEmployeeSalary);
router.put('/employee-salaries/:id', authenticateUser, hrSalaryController.updateEmployeeSalary);
router.delete('/employee-salaries/:id', authenticateUser, hrSalaryController.deleteEmployeeSalary);

// Get salaries by employee
router.get('/employees/:employeeId/salaries', authenticateUser, hrSalaryController.getEmployeeSalaries);

// EmployeeSalaryEarnings CRUD
router.post('/salary-earnings', authenticateUser, hrSalaryController.createSalaryEarnings);
router.get('/salary-earnings/:id', authenticateUser, hrSalaryController.getSalaryEarnings);
router.put('/salary-earnings/:id', authenticateUser, hrSalaryController.updateSalaryEarnings);
router.delete('/salary-earnings/:id', authenticateUser, hrSalaryController.deleteSalaryEarnings);

// EmployeeSalaryDeductions CRUD
router.post('/salary-deductions', authenticateUser, hrSalaryController.createSalaryDeductions);
router.get('/salary-deductions/:id', authenticateUser, hrSalaryController.getSalaryDeductions);
router.put('/salary-deductions/:id', authenticateUser, hrSalaryController.updateSalaryDeductions);
router.delete('/salary-deductions/:id', authenticateUser, hrSalaryController.deleteSalaryDeductions);

export default router;
