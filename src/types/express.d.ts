import { Account } from '../account/entities/account.entity';

declare global {
  namespace Express {
    interface Request {
      account?: Account;
    }
  }
}

// This ensures the file is treated as a module
export {};
