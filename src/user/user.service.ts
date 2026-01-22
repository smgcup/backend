import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthResponse } from './dto/auth-response.type';
import { LoginInput } from './dto/login.input';
import { USER_TRANSLATION_CODES } from '../exception/translation-codes';
import { JwtPayload } from './strategies/jwt.strategy';
import { ConflictError, NotFoundError } from '../exception/exceptions';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from './dto/create-user.input';
import { generateUuidv7 } from '../shared/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserInput: CreateUserInput, manager?: EntityManager): Promise<AuthResponse> {
    const userRepository = manager ? manager.getRepository(User) : this.userRepository;

    // Check if account already exists
    const existingUserByEmail = await userRepository.findOne({
      where: { email: createUserInput.email },
    });

    if (existingUserByEmail) {
      throw new ConflictError(
        USER_TRANSLATION_CODES.userEmailAlreadyInUse,
        `User with email ${createUserInput.email} already exists`,
      );
    }

    const existingUserByUsername = await userRepository.findOne({
      where: { username: createUserInput.username },
    });

    if (existingUserByUsername) {
      throw new ConflictError(
        USER_TRANSLATION_CODES.userUsernameAlreadyInUse,
        `User with username ${createUserInput.username} already exists`,
      );
    }

    const user = userRepository.create({
      ...createUserInput,
      id: generateUuidv7(),
      createdAt: new Date(),
    });

    const savedUser = await userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: savedUser.id,
      email: savedUser.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: savedUser,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find account by email
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException(USER_TRANSLATION_CODES.userPasswordInvalid, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = input.password === user.password;
    // const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(USER_TRANSLATION_CODES.userPasswordInvalid, 'Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound);
    }

    return user;
  }
}
