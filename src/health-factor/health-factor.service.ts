import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateHealthFactorInput, CreateHealthFactorPropertyInput } from './dto';
import { HealthFactor, HealthFactorProperty, HealthFactorProperties } from './entities';
import { HealthFactorPropertyMeasurementUnit } from './entities/health-factor-property-measurement-unit.entity';
import { Account } from '../account/entities/account.entity';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { BadRequestError, NotFoundError } from '../exception/exceptions';
import { HEALTH_FACTOR_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class HealthFactorService {
  constructor(
    @InjectRepository(HealthFactor)
    private readonly healthFactorRepository: Repository<HealthFactor>,
    @InjectRepository(HealthFactorProperty)
    private readonly healthFactorPropertyRepository: Repository<HealthFactorProperty>,
    @InjectRepository(HealthFactorProperties)
    private readonly healthFactorPropertiesRepository: Repository<HealthFactorProperties>,
    @InjectRepository(HealthFactorPropertyMeasurementUnit)
    private readonly healthFactorPropertyMeasurementUnitRepository: Repository<HealthFactorPropertyMeasurementUnit>,
  ) {}

  /**
   * Create a health factor
   * @param createHealthFactorInput - The input for creating a health factor
   * @param account - The account creating the health factor
   * @returns The created health factor
   * @returns
   */
  async createHealthFactor(createHealthFactorInput: CreateHealthFactorInput, account: Account): Promise<HealthFactor> {
    // Create the health factor
    const healthFactor = this.healthFactorRepository.create({
      id: generateUuidv7(),
      name: createHealthFactorInput.name,
      creator: account,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedHealthFactor = await this.healthFactorRepository.save(healthFactor);

    // Associate health factor properties if provided
    if (createHealthFactorInput.healthFactorPropertyIds && createHealthFactorInput.healthFactorPropertyIds.length > 0) {
      // Verify that all health factor properties exist
      const healthFactorProperties = await this.healthFactorPropertyRepository.find({
        where: { id: In(createHealthFactorInput.healthFactorPropertyIds) },
      });

      if (healthFactorProperties.length !== createHealthFactorInput.healthFactorPropertyIds.length) {
        const foundIds = healthFactorProperties.map((hfp) => hfp.id);
        const missingIds = createHealthFactorInput.healthFactorPropertyIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundError(
          HEALTH_FACTOR_TRANSLATION_CODES.healthFactorPropertyNotFound,
          `Health factor properties with IDs ${missingIds.join(', ')} not found`,
        );
      }

      // Create the relationships
      const healthFactorPropertiesRelations = healthFactorProperties.map((healthFactorProperty) =>
        this.healthFactorPropertiesRepository.create({
          id: generateUuidv7(),
          healthFactor: savedHealthFactor,
          healthFactorProperty: healthFactorProperty,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      await this.healthFactorPropertiesRepository.save(healthFactorPropertiesRelations);
    } else {
      throw new BadRequestError(
        HEALTH_FACTOR_TRANSLATION_CODES.healthFactorPropertyIdsRequired,
        'At least one health factor property is required',
      );
    }

    return savedHealthFactor;
  }

  /**
   * Create a health factor property
   * @param createHealthFactorPropertyInput - The input for creating a health factor property
   * @param account - The account creating the health factor property
   * @returns The created health factor property
   */
  async createHealthFactorProperty(
    createHealthFactorPropertyInput: CreateHealthFactorPropertyInput,
    account: Account,
  ): Promise<HealthFactorProperty> {
    // Verify that the measurement unit exists
    const measurementUnit = await this.healthFactorPropertyMeasurementUnitRepository.findOne({
      where: { id: createHealthFactorPropertyInput.measurementUnitId },
    });

    if (!measurementUnit) {
      throw new NotFoundError(
        HEALTH_FACTOR_TRANSLATION_CODES.healthFactorPropertyMeasurementUnitNotFound,
        `Measurement unit with ID ${createHealthFactorPropertyInput.measurementUnitId} not found`,
      );
    }

    const now = new Date();
    const healthFactorProperty = this.healthFactorPropertyRepository.create({
      id: generateUuidv7(),
      key: createHealthFactorPropertyInput.key,
      label: createHealthFactorPropertyInput.label,
      creator: account,
      inputType: createHealthFactorPropertyInput.inputType,
      measurementUnit: measurementUnit,
      options: createHealthFactorPropertyInput.options || null,
      createdAt: now,
      updatedAt: now,
    });

    return await this.healthFactorPropertyRepository.save(healthFactorProperty);
  }
  /**
   * Get a health factor
   * @param id - The ID of the health factor to get
   * @returns The health factor
   */
  async getHealthFactor(id: string): Promise<HealthFactor | null> {
    return await this.healthFactorRepository.findOne({
      where: { id },
      relations: ['creator', 'healthFactorProperties', 'healthFactorProperties.healthFactorProperty'],
    });
  }

  /**
   * Get all health factors
   * @returns The health factors
   */
  async getHealthFactors(): Promise<HealthFactor[]> {
    return await this.healthFactorRepository.find({
      relations: ['creator', 'healthFactorProperties', 'healthFactorProperties.healthFactorProperty'],
    });
  }

  /**
   * Get the properties of a health factor
   * @param id - The ID of the health factor to get the properties of
   * @returns The properties of the health factor
   */
  async getHealthFactorProperties(id: string): Promise<HealthFactorProperty[]> {
    const healthFactorProperties = await this.healthFactorPropertiesRepository.find({
      where: { healthFactor: { id } },
      relations: ['healthFactorProperty'],
    });

    return healthFactorProperties.map((hfp) => hfp.healthFactorProperty);
  }

  /**
   * Add properties to a health factor
   * @param healthFactorId - The ID of the health factor to add properties to
   * @param healthFactorPropertyIds - The IDs of the health factor properties to add to the health factor
   * @returns The added properties
   */
  async addPropertiesToHealthFactor(
    healthFactorId: string,
    healthFactorPropertyIds: string[],
  ): Promise<HealthFactorProperties[]> {
    // Verify that the health factor exists
    const healthFactor = await this.healthFactorRepository.findOne({
      where: { id: healthFactorId },
    });

    if (!healthFactor) {
      throw new NotFoundError(
        HEALTH_FACTOR_TRANSLATION_CODES.healthFactorNotFound,
        `Health factor with ID ${healthFactorId} not found`,
      );
    }

    // Verify that all health factor properties exist
    const healthFactorProperties = await this.healthFactorPropertyRepository.find({
      where: { id: In(healthFactorPropertyIds) },
    });

    if (healthFactorProperties.length !== healthFactorPropertyIds.length) {
      const foundIds = healthFactorProperties.map((hfp) => hfp.id);
      const missingIds = healthFactorPropertyIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundError(
        HEALTH_FACTOR_TRANSLATION_CODES.healthFactorPropertyNotFound,
        `Health factor properties with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Create the relationships
    const healthFactorPropertiesRelations = healthFactorProperties.map((healthFactorProperty) =>
      this.healthFactorPropertiesRepository.create({
        id: generateUuidv7(),
        healthFactor: healthFactor,
        healthFactorProperty: healthFactorProperty,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    return await this.healthFactorPropertiesRepository.save(healthFactorPropertiesRelations);
  }
}
