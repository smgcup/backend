import { Request } from 'express';
import { Account } from '../account/entities/account.entity';

export interface RequestWithAccount extends Request {
  account?: Account;
}
