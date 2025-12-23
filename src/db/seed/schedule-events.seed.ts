import { DataSource } from 'typeorm';
import { ScheduleEventType } from '../../schedule-events/entities/schedule-event-type.entity';
import { ScheduleEventField } from '../../schedule-events/entities/schedule-event-field.entity';
import { ScheduleEventTypeField } from '../../schedule-events/entities/schedule-event-type-field.entity';
import { ScheduleEventFieldDataType } from '../../schedule-events/enums/schedule-event-field-data-type.enum';
import { generateUuidv7 } from '../../shared/utils/generateUuidV7';
import * as path from 'path';

async function seed() {
  // Create a new DataSource with the same configuration as the app
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'aws-1-eu-central-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres.syaspxqmzugybgoftbhg',
    password: process.env.DB_PASSWORD || 'Amatr@123!',
    database: process.env.DB_DATABASE || 'postgres',
    // Use glob pattern to load all entities automatically
    entities: [path.join(process.cwd(), 'src/**/*.entity{.ts,.js}')],
    synchronize: false,
    logging: process.env.DB_LOG === 'true',
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Get repositories
    const eventTypeRepository = dataSource.getRepository(ScheduleEventType);
    const eventFieldRepository = dataSource.getRepository(ScheduleEventField);
    const typeFieldRepository = dataSource.getRepository(ScheduleEventTypeField);

    // Check if data already exists
    const existingTypes = await eventTypeRepository.count();
    if (existingTypes > 0) {
      console.log('Schedule event types already exist, skipping seed');
      return;
    }

    // Create Schedule Event Fields (reusable across types)
    const eventFields = [
      {
        key: 'start_time',
        defaultLabel: 'Start Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'end_time',
        defaultLabel: 'End Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'opponent_name',
        defaultLabel: 'Opponent',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'opponent_logo_url',
        defaultLabel: 'Opponent Logo URL',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'venue_name',
        defaultLabel: 'Venue',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'venue_address',
        defaultLabel: 'Venue Address',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'match_type',
        defaultLabel: 'Match Type',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'competition_name',
        defaultLabel: 'Competition',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'training_focus',
        defaultLabel: 'Training Focus',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'training_intensity',
        defaultLabel: 'Training Intensity',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'coach_name',
        defaultLabel: 'Coach',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'departure_time',
        defaultLabel: 'Departure Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'arrival_time',
        defaultLabel: 'Arrival Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'transport_type',
        defaultLabel: 'Transport Type',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'transport_company',
        defaultLabel: 'Transport Company',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'flight_number',
        defaultLabel: 'Flight Number',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'hotel_name',
        defaultLabel: 'Hotel Name',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'hotel_address',
        defaultLabel: 'Hotel Address',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'check_in_time',
        defaultLabel: 'Check-in Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'check_out_time',
        defaultLabel: 'Check-out Time',
        dataType: ScheduleEventFieldDataType.DATETIME,
      },
      {
        key: 'room_number',
        defaultLabel: 'Room Number',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'meeting_room',
        defaultLabel: 'Meeting Room',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'meeting_agenda',
        defaultLabel: 'Meeting Agenda',
        dataType: ScheduleEventFieldDataType.STRING,
      },
      {
        key: 'is_home_match',
        defaultLabel: 'Home Match',
        dataType: ScheduleEventFieldDataType.BOOLEAN,
      },
      {
        key: 'attendance_required',
        defaultLabel: 'Attendance Required',
        dataType: ScheduleEventFieldDataType.BOOLEAN,
      },
    ];

    const createdFields: ScheduleEventField[] = [];
    for (const fieldData of eventFields) {
      const field = eventFieldRepository.create({
        id: generateUuidv7(),
        key: fieldData.key,
        defaultLabel: fieldData.defaultLabel,
        dataType: fieldData.dataType,
      });
      const savedField = await eventFieldRepository.save(field);
      createdFields.push(savedField);
      console.log(`Created schedule event field: ${fieldData.defaultLabel}`);
    }

    // Helper function to find field by key
    const findField = (key: string): ScheduleEventField => {
      const field = createdFields.find((f) => f.key === key);
      if (!field) {
        throw new Error(`Field with key "${key}" not found`);
      }
      return field;
    };

    // Create Schedule Event Types
    const eventTypes = [
      {
        key: 'MATCH',
        name: 'Match',
        description: 'Competitive match or game',
        isSystem: true,
        fields: [
          { fieldKey: 'start_time', label: 'Kick-off Time', required: true, sortOrder: 1 },
          { fieldKey: 'end_time', label: 'End Time', required: false, sortOrder: 2 },
          { fieldKey: 'opponent_name', label: 'Opponent', required: true, sortOrder: 3 },
          { fieldKey: 'opponent_logo_url', label: 'Opponent Logo', required: false, sortOrder: 4 },
          { fieldKey: 'venue_name', label: 'Venue', required: true, sortOrder: 5 },
          { fieldKey: 'venue_address', label: 'Venue Address', required: false, sortOrder: 6 },
          { fieldKey: 'match_type', label: 'Match Type', required: false, sortOrder: 7 },
          { fieldKey: 'competition_name', label: 'Competition', required: false, sortOrder: 8 },
          { fieldKey: 'is_home_match', label: 'Home Match', required: false, sortOrder: 9 },
        ],
      },
      {
        key: 'TRAINING',
        name: 'Training',
        description: 'Training session or practice',
        isSystem: true,
        fields: [
          { fieldKey: 'start_time', label: 'Start Time', required: true, sortOrder: 1 },
          { fieldKey: 'end_time', label: 'End Time', required: true, sortOrder: 2 },
          { fieldKey: 'venue_name', label: 'Training Venue', required: false, sortOrder: 3 },
          { fieldKey: 'venue_address', label: 'Venue Address', required: false, sortOrder: 4 },
          { fieldKey: 'training_focus', label: 'Training Focus', required: false, sortOrder: 5 },
          { fieldKey: 'training_intensity', label: 'Training Intensity', required: false, sortOrder: 6 },
          { fieldKey: 'coach_name', label: 'Coach', required: false, sortOrder: 7 },
          { fieldKey: 'attendance_required', label: 'Attendance Required', required: false, sortOrder: 8 },
        ],
      },
      {
        key: 'TRAVEL',
        name: 'Travel',
        description: 'Travel to or from a location',
        isSystem: true,
        fields: [
          { fieldKey: 'departure_time', label: 'Departure Time', required: true, sortOrder: 1 },
          { fieldKey: 'arrival_time', label: 'Arrival Time', required: true, sortOrder: 2 },
          { fieldKey: 'transport_type', label: 'Transport Type', required: true, sortOrder: 3 },
          { fieldKey: 'transport_company', label: 'Transport Company', required: false, sortOrder: 4 },
          { fieldKey: 'flight_number', label: 'Flight Number', required: false, sortOrder: 5 },
          { fieldKey: 'venue_address', label: 'Destination', required: false, sortOrder: 6 },
        ],
      },
      {
        key: 'HOTEL',
        name: 'Hotel',
        description: 'Hotel stay or accommodation',
        isSystem: true,
        fields: [
          { fieldKey: 'check_in_time', label: 'Check-in Time', required: true, sortOrder: 1 },
          { fieldKey: 'check_out_time', label: 'Check-out Time', required: true, sortOrder: 2 },
          { fieldKey: 'hotel_name', label: 'Hotel Name', required: true, sortOrder: 3 },
          { fieldKey: 'hotel_address', label: 'Hotel Address', required: false, sortOrder: 4 },
          { fieldKey: 'room_number', label: 'Room Number', required: false, sortOrder: 5 },
        ],
      },
      {
        key: 'MEETING',
        name: 'Meeting',
        description: 'Team meeting or briefing',
        isSystem: true,
        fields: [
          { fieldKey: 'start_time', label: 'Start Time', required: true, sortOrder: 1 },
          { fieldKey: 'end_time', label: 'End Time', required: true, sortOrder: 2 },
          { fieldKey: 'venue_name', label: 'Meeting Location', required: false, sortOrder: 3 },
          { fieldKey: 'meeting_room', label: 'Meeting Room', required: false, sortOrder: 4 },
          { fieldKey: 'meeting_agenda', label: 'Meeting Agenda', required: false, sortOrder: 5 },
          { fieldKey: 'attendance_required', label: 'Attendance Required', required: false, sortOrder: 6 },
        ],
      },
    ];

    for (const typeData of eventTypes) {
      const eventType = eventTypeRepository.create({
        id: generateUuidv7(),
        key: typeData.key,
        name: typeData.name,
        description: typeData.description,
        teamId: null, // System-wide types
        isSystem: typeData.isSystem,
      });
      const savedEventType = await eventTypeRepository.save(eventType);
      console.log(`Created schedule event type: ${typeData.name}`);

      // Create relationships between event type and fields
      for (const typeFieldData of typeData.fields) {
        const field = findField(typeFieldData.fieldKey);
        const typeField = typeFieldRepository.create({
          id: generateUuidv7(),
          typeId: savedEventType.id,
          fieldId: field.id,
          label: typeFieldData.label,
          required: typeFieldData.required,
          sortOrder: typeFieldData.sortOrder,
        });
        await typeFieldRepository.save(typeField);
        console.log(`  - Linked field: ${typeFieldData.label}`);
      }
    }

    console.log('Schedule events seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
