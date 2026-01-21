import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

// 1. Create Mock Objects
const mockRegistrationRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
};

const mockEventRepo = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

const mockUserRepo = {
  findOneBy: jest.fn(),
};

describe('RegistrationsService', () => {
  let service: RegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        // 2. Provide the Mocks instead of real Repositories
        { provide: getRepositoryToken(Registration), useValue: mockRegistrationRepo },
        { provide: getRepositoryToken(Event), useValue: mockEventRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
  });

  // Reset mocks before each test so counts don't mess up
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a WAITLIST registration when event is full', async () => {
    // A. Setup Data
    const userId = 1;
    const dto = { eventId: 100 };
    
    const mockUser = { id: 1, name: 'Ghada' };
    const mockFullEvent = { 
      id: 100, 
      title: 'Sold Out Concert', 
      maxCapacity: 50, 
      currentParticipants: 50 // <--- FULL!
    };

    // B. Teach the Mocks what to return
    mockUserRepo.findOneBy.mockResolvedValue(mockUser);
    mockEventRepo.findOneBy.mockResolvedValue(mockFullEvent);
    
    // When .create() is called, just return the inputs
    mockRegistrationRepo.create.mockImplementation((dto) => dto); 
    mockRegistrationRepo.save.mockImplementation((reg) => Promise.resolve({ id: 1, ...reg }));

    // C. Execute the Function
    const result = await service.create(dto, userId);

    // D. Assertions (The Proof)
    if (Array.isArray(result)) {
      expect(result[0].status).toEqual('waitlist'); // <--- CHECK STATUS
    } else {
      expect(result.status).toEqual('waitlist'); // <--- CHECK STATUS
    }
    expect(mockEventRepo.save).not.toHaveBeenCalled(); // We should NOT increment count
  });

  it('should create a CONFIRMED registration when capacity is available', async () => {
    // A. Setup Data
    const userId = 1;
    const dto = { eventId: 101 };
    
    const mockUser = { id: 1 };
    const mockOpenEvent = { 
      id: 101, 
      maxCapacity: 50, 
      currentParticipants: 10 // <--- OPEN!
    };

    // B. Teach Mocks
    mockUserRepo.findOneBy.mockResolvedValue(mockUser);
    mockEventRepo.findOneBy.mockResolvedValue(mockOpenEvent);
    mockRegistrationRepo.create.mockImplementation((dto) => dto);
    mockRegistrationRepo.save.mockImplementation((reg) => Promise.resolve({ id: 2, ...reg }));

    // C. Execute
    const result = await service.create(dto, userId);

    // D. Assertions
    if (Array.isArray(result)) {
      expect(result[0].status).toEqual('confirmed'); // <--- CHECK STATUS
    } else {
      expect(result.status).toEqual('confirmed'); // <--- CHECK STATUS
    }
    expect(mockEventRepo.save).toHaveBeenCalled(); // We SHOULD increment count
    expect(mockOpenEvent.currentParticipants).toBe(11); // 10 + 1
  });
  
});