import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

@InputType()
export class CreateHealthFactorInput {
  @Field(() => String, { description: 'Name of the health factor' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => [ID], { description: 'Array of health factor property IDs', nullable: false })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(7, { each: true })
  healthFactorPropertyIds!: string[];
}
