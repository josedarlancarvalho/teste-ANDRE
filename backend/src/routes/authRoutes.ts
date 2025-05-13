import { Router, Request, Response, NextFunction } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Wrapper para tratar erros assíncronos
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router; 