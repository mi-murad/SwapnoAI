import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { UserRecord, WorkspaceDataPayload, WorkspaceRecord, WorkspaceRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? ''
    : 'swapno_dev_secret_key_change_in_production_2026'
);
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set outside development.');
}
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  fullName: string;
}

export class AuthService {
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  public generateToken(user: UserRecord): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      return null;
    }
  }

  public async register(
    email: string,
    password: string,
    fullName: string,
    businessName: string,
    initialSetup?: Partial<WorkspaceDataPayload['businessSetup']>
  ): Promise<{ user: UserRecord; workspace: WorkspaceRecord; token: string }> {
    const existing = db.getUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await this.hashPassword(password);
    const user = db.createUser(email, passwordHash, fullName);
    
    // Create their first isolated workspace
    const { workspace } = db.createWorkspace(businessName || `${fullName}'s Brand`, user.id, initialSetup);
    const token = this.generateToken(user);

    return { user, workspace, token };
  }

  public async login(
    email: string,
    password: string
  ): Promise<{ user: UserRecord; workspaces: Array<{ workspace: WorkspaceRecord; role: WorkspaceRole }>; token: string }> {
    const user = db.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = await this.comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const workspaces = db.getWorkspacesForUser(user.id);
    const token = this.generateToken(user);

    return { user, workspaces, token };
  }
}

export const authService = new AuthService();
