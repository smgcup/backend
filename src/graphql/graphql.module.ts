import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Request, Response } from 'express';
import { DateScalar } from './scalars/date.scalar';
import { DateSimpleScalar } from './scalars/date-simple.scalar';

export type GraphqlContext = {
  req: Request;
  res: Response;
};

@Module({
  providers: [DateScalar, DateSimpleScalar],
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          context: ({ req, res }): GraphqlContext => ({
            req: req as Request,
            res: res as Response,
          }),
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          path: '/graphql',
          playground: false,
          introspection: process.env.NAMESPACE !== 'production',
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          persistedQueries: false,
          fieldResolverEnhancers: ['interceptors', 'guards'],
          subscriptions: {
            'graphql-ws': {
              path: '/graphql',
            },
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}
