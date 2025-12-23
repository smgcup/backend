import { registerEnumType } from '@nestjs/graphql';

export enum WearableProviderEnum {
  WHOOP = 'whoop',
  OURA = 'oura',
  GARMIN = 'garmin',
  POLAR = 'polar',
  APPLE = 'apple',
}

registerEnumType(WearableProviderEnum, {
  name: 'WearableProviderEnum',
  description: 'Wearable provider options',
});
