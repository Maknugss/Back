import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdatePinDto, UpdateUserDto } from '../dto';
import { User } from '../entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  public findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  public findById(id: string): Promise<User> {
    return this.userRepository.findOne(id);
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'No existe un usuario con este email',
      HttpStatus.NOT_FOUND,
    );
  }

  public async setImageToUser(fileRoute: string, email: string): Promise<void> {
    const userToUpdate = await this.userRepository.findOne({ email });
    const user = userToUpdate;
    user.imageRoute = fileRoute;
    const editedUser = Object.assign(userToUpdate, user);
    await this.userRepository.save(editedUser);
  }

  public async create(user: CreateUserDto): Promise<void> {
    const newUser = await this.userRepository.create(user);
    await this.userRepository.save(newUser);
  }

  public async updateOrDeactivate(user: UpdateUserDto): Promise<void> {
    const email = user.email;
    const userToUpdate = await this.userRepository.findOne({ email });
    const hashedPassword = await hash(user.password, 10);
    user.password = hashedPassword;
    const editedUser = Object.assign(userToUpdate, user);
    await this.userRepository.save(editedUser);
  }

  public async delete(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email });
    await this.userRepository.remove(user);
  }

  public async updatePin(userInformation: UpdatePinDto): Promise<void> {
    const email = userInformation.email;
    const user = await this.userRepository.findOne({ email });
    user.pin = userInformation.pin;
    await this.userRepository.save(user);
  }
}
