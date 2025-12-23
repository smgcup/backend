import { InputType, Field, ID } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { HealthFactorInputType } from '../enums/health-factor-input-type.enum';

@InputType()
export class CreateHealthFactorPropertyInput {
  @Field(() => String, { description: 'Key of the health factor property' })
  @IsNotEmpty()
  @IsString()
  key!: string;

  @Field(() => String, { description: 'Label of the health factor property' })
  @IsNotEmpty()
  @IsString()
  label!: string;

  @Field(() => HealthFactorInputType, { description: 'Input type of the health factor property' })
  @IsNotEmpty()
  @IsEnum(HealthFactorInputType)
  inputType!: HealthFactorInputType;

  @Field(() => [String], { description: 'Options of the health factor property', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @Field(() => ID, { description: 'Measurement unit ID of the health factor property' })
  @IsNotEmpty()
  @IsUUID()
  measurementUnitId!: string;
}
