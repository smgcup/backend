import { registerEnumType } from '@nestjs/graphql';

export enum TriggeredAcuteSymptomStatus {
  UNACTIONED = 'UNACTIONED',
  DISMISSED = 'DISMISSED',
  RESOLVED = 'RESOLVED',
}

registerEnumType(TriggeredAcuteSymptomStatus, {
  name: 'TriggeredAcuteSymptomStatus',
});
