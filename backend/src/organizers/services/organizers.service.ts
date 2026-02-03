import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizer } from '../entities/organizer.entity';
import { CreateOrganizerDto } from '../dto/create-organizer.dto';
import { UpdateOrganizerDto } from '../dto/update-organizer.dto';
import { User } from '../../users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { ApiAcceptedResponse } from '@nestjs/swagger';

@Injectable()
export class OrganizersService {
  constructor(
    @InjectRepository(Organizer)
    private readonly organizerRepository: Repository<Organizer>,
    private usersService: UsersService,
  ) { }

  async create(user: User, createOrganizerDto: CreateOrganizerDto): Promise<Organizer> {

    const [existing, existingProfile] = await Promise.all([
      this.organizerRepository.findOne({ where: { name: createOrganizerDto.name } }),
      this.organizerRepository.findOne({ where: { user: { id: user.id } } }),
    ]);

    if (existing) throw new ConflictException('Organization name already exists');
    if (existingProfile) throw new ConflictException('User is already an organizer');

    const organizer = this.organizerRepository.create({
      ...createOrganizerDto,
      user,
      isVerified: false,
    });

    return await this.organizerRepository.save(organizer);
  }

  async findAll(): Promise<Organizer[]> {
    return await this.organizerRepository.find({
      where: { isVerified: true },
      relations: ['user', 'events']
    });
  }

  async findOne(id: string): Promise<Organizer> {
    const organizer = await this.organizerRepository.findOne({
      where: { id },
      relations: ['events'], // On charge les événements du club
    });
    if (!organizer) throw new NotFoundException(`Organizer #${id} not found`);
    return organizer;
  }

  async findOneByUserId(userId: string): Promise<Organizer> {
    const organizer = await this.organizerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['events'],
    });
    if (!organizer) throw new NotFoundException('Organizer profile not found for this user');
    return organizer;
  }

  async update(id: string, updateOrganizerDto: UpdateOrganizerDto): Promise<Organizer> {
    const organizer = await this.organizerRepository.preload({
      id: id,
      ...updateOrganizerDto,
    });

    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${id} not found`);
    }
    return await this.organizerRepository.save(organizer);
  }


  // --- ADMIN LOGIC ---

  async findMostActiveOrganizers(limit: number = 4) {
    return await this.organizerRepository
      .createQueryBuilder('organizer')
      .leftJoin('organizer.events', 'event')
      .select('organizer.id', 'id')
      .addSelect('organizer.name', 'name')
      .addSelect('COUNT(event.id)', 'eventCount')
      .groupBy('organizer.id')
      .addGroupBy('organizer.name')
      .orderBy('COUNT(event.id)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getPendingOrganizers(): Promise<Organizer[]> {

    return await this.organizerRepository.find({
      where: { isVerified: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveOrganizer(id: string): Promise<Organizer> {
    const organizer = await this.findOne(id);
    organizer.isVerified = true;
    return await this.organizerRepository.save(organizer);
  }

  async rejectOrganizer(id: string): Promise<void> {
    const organizer = await this.organizerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!organizer) throw new NotFoundException(`Organizer #${id} not found`);

    if (organizer.user?.id) {
      await this.usersService.remove(organizer.user.id); // l'effet cascade supprimera l'organisateur
      return;
    }

    await this.organizerRepository.delete(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.organizerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Organizer with ID ${id} not found`);
    }
  }

}