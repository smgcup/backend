import { Test, TestingModule } from '@nestjs/testing';
import { TerraSyncResolver } from './terra-sync.resolver';
import { TerraSyncService } from './terra-sync.service';

describe('TerraSyncResolver', () => {
  let resolver: TerraSyncResolver;

  const mockTerraSyncService = {
    syncSingleAthlete: jest.fn(),
    syncAllAthletes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerraSyncResolver,
        {
          provide: TerraSyncService,
          useValue: mockTerraSyncService,
        },
      ],
    }).compile();

    resolver = module.get<TerraSyncResolver>(TerraSyncResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncAthlete', () => {
    it('should call syncSingleAthlete with correct parameters and return true', () => {
      // Arrange
      const athleteId = 'test-athlete-id';
      const expectedStartDate = new Date('2025-10-15');
      const expectedEndDate = new Date('2025-11-07');
      mockTerraSyncService.syncSingleAthlete.mockResolvedValue(undefined);

      // Act
      const result = resolver.syncAthlete(athleteId);

      // Assert
      expect(result).toBe(true);
      expect(mockTerraSyncService.syncSingleAthlete).toHaveBeenCalledWith(
        athleteId,
        expectedStartDate,
        expectedEndDate,
      );
      expect(mockTerraSyncService.syncSingleAthlete).toHaveBeenCalledTimes(1);
    });

    it('should return true immediately without waiting for sync to complete', async () => {
      // Arrange
      const athleteId = 'test-athlete-id';
      let resolvePromise: () => void;
      const delayedPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockTerraSyncService.syncSingleAthlete.mockReturnValue(delayedPromise);

      // Act
      const result = resolver.syncAthlete(athleteId);

      // Assert - should return immediately
      expect(result).toBe(true);
      expect(mockTerraSyncService.syncSingleAthlete).toHaveBeenCalled();

      // Resolve the promise after the assertion
      resolvePromise!();
      await delayedPromise;
    });

    it('should handle errors gracefully when syncSingleAthlete fails', async () => {
      // Arrange
      const athleteId = 'test-athlete-id';
      const error = new Error('Sync failed');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockTerraSyncService.syncSingleAthlete.mockRejectedValue(error);

      // Act
      const result = resolver.syncAthlete(athleteId);

      // Assert
      expect(result).toBe(true);
      expect(mockTerraSyncService.syncSingleAthlete).toHaveBeenCalled();

      // Wait for the promise to reject
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Error in syncAthlete for ${athleteId}:`, error);

      consoleErrorSpy.mockRestore();
    });

    it('should use the correct date range for sync', () => {
      // Arrange
      const athleteId = 'test-athlete-id';
      const expectedStartDate = new Date('2025-10-15');
      const expectedEndDate = new Date('2025-11-07');
      mockTerraSyncService.syncSingleAthlete.mockResolvedValue(undefined);

      // Act
      resolver.syncAthlete(athleteId);

      // Assert
      const callArgs = mockTerraSyncService.syncSingleAthlete.mock.calls[0] as [string, Date, Date];
      expect(callArgs[0]).toBe(athleteId);
      expect(callArgs[1]).toEqual(expectedStartDate);
      expect(callArgs[2]).toEqual(expectedEndDate);
    });
  });

  describe('syncAllAthletes', () => {
    it('should call syncAllAthletes with correct parameters and return true', () => {
      // Arrange
      const expectedStartDate = new Date('2025-10-30');
      const expectedEndDate = new Date('2025-10-31');
      mockTerraSyncService.syncAllAthletes.mockResolvedValue(undefined);

      // Act
      const result = resolver.syncAllAthletes();

      // Assert
      expect(result).toBe(true);
      expect(mockTerraSyncService.syncAllAthletes).toHaveBeenCalledWith(expectedStartDate, expectedEndDate);
      expect(mockTerraSyncService.syncAllAthletes).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully when syncAllAthletes fails', async () => {
      // Arrange
      const error = new Error('Sync all failed');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockTerraSyncService.syncAllAthletes.mockRejectedValue(error);

      // Act
      const result = resolver.syncAllAthletes();

      // Assert
      expect(result).toBe(true);
      expect(mockTerraSyncService.syncAllAthletes).toHaveBeenCalled();

      // Wait for the promise to reject
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in syncAllAthletes:', error);

      consoleErrorSpy.mockRestore();
    });
  });
});
