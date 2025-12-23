import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { HealthFactorService } from './health-factor.service';
import { HealthFactor, HealthFactorProperty, HealthFactorProperties } from './entities';
import { CreateHealthFactorInput, CreateHealthFactorPropertyInput } from './dto';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';

@UseGuards(JwtAuthGuard)
@Resolver(() => HealthFactor)
export class HealthFactorResolver {
  constructor(private readonly healthFactorService: HealthFactorService) {}

  /**
   * Create a health factor
   * @param createHealthFactorInput - The input for creating a health factor
   * @returns The created health factor
   */
  @Mutation(() => HealthFactor, { name: 'createHealthFactor' })
  async createHealthFactor(
    @Args('createHealthFactorInput') createHealthFactorInput: CreateHealthFactorInput,
    @AccountSession() account: Account,
  ): Promise<HealthFactor> {
    return await this.healthFactorService.createHealthFactor(createHealthFactorInput, account);
  }

  @Mutation(() => HealthFactorProperty, { name: 'createHealthFactorProperty' })
  async createHealthFactorProperty(
    @Args('createHealthFactorPropertyInput') createHealthFactorPropertyInput: CreateHealthFactorPropertyInput,
    @AccountSession() account: Account,
  ): Promise<HealthFactorProperty> {
    return await this.healthFactorService.createHealthFactorProperty(createHealthFactorPropertyInput, account);
  }

  @Query(() => HealthFactor, { name: 'healthFactor', nullable: true })
  async getHealthFactor(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string): Promise<HealthFactor | null> {
    return await this.healthFactorService.getHealthFactor(id);
  }

  @Query(() => [HealthFactor], { name: 'healthFactors' })
  async getHealthFactors(): Promise<HealthFactor[]> {
    return await this.healthFactorService.getHealthFactors();
  }

  /**
   * Add properties to a health factor
   * @param healthFactorId - The ID of the health factor to add properties to
   * @param healthFactorPropertyIds - The IDs of the health factor properties to add to the health factor
   * @returns The added properties
   */
  @Mutation(() => [HealthFactorProperties], { name: 'addPropertiesToHealthFactor' })
  async addPropertiesToHealthFactor(
    @Args('healthFactorId', { type: () => ID }, UUIDValidationPipe) healthFactorId: string,
    @Args('healthFactorPropertyIds', { type: () => [ID] }, UUIDValidationPipe) healthFactorPropertyIds: string[],
  ): Promise<HealthFactorProperties[]> {
    return await this.healthFactorService.addPropertiesToHealthFactor(healthFactorId, healthFactorPropertyIds);
  }

  @ResolveField(() => [HealthFactorProperty], { name: 'healthFactorProperties', nullable: true })
  async healthFactorProperties(@Parent() parent: HealthFactor): Promise<HealthFactorProperty[]> {
    const properties = await this.healthFactorService.getHealthFactorProperties(parent.id);
    // Ensure options is always an array, never null
    return properties.map((property) => ({
      ...property,
      options: property.options || [],
    }));
  }
}
