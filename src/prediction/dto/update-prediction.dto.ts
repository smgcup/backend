import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

@InputType()
export class UpdatePredictionDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  predictedScore1?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  predictedScore2?: number;
}
