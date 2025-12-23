import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEventsService } from './schedule-events.service';
import { ScheduleEventsResolver } from './schedule-events.resolver';
import { ScheduleEventTypesResolver } from './schedule-event-types.resolver';
import { ScheduleEventFieldValuesResolver } from './schedule-event-field-values.resolver';
import { ScheduleEventsTypesService } from './schedule-events-types.service';
import { ScheduleEventFieldsService } from './schedule-events-fields.service';
import { ScheduleEvent } from './entities/schedule-event.entity';
import { ScheduleEventType } from './entities/schedule-event-type.entity';
import { ScheduleEventTypeField } from './entities/schedule-event-type-field.entity';
import { ScheduleEventFieldValue } from './entities/schedule-event-field-value.entity';
import { ScheduleEventField } from './entities/schedule-event-field.entity';
import { ScheduleEventParticipant } from './entities/schedule-event-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEvent,
      ScheduleEventType,
      ScheduleEventTypeField,
      ScheduleEventFieldValue,
      ScheduleEventField,
      ScheduleEventParticipant,
    ]),
  ],
  controllers: [],
  providers: [
    ScheduleEventsService,
    ScheduleEventsResolver,
    ScheduleEventTypesResolver,
    ScheduleEventFieldValuesResolver,
    ScheduleEventsTypesService,
    ScheduleEventFieldsService,
  ],
  exports: [ScheduleEventsService, ScheduleEventsTypesService, ScheduleEventFieldsService],
})
export class ScheduleEventsModule {}
