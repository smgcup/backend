import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Team } from '../../team/entities/team.entity';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { WindowInstance } from '../../window-instance/entities/window-instance';
import { Metrics } from '../../shared/entities/metrics.entity';
import { SleepInstance } from '../../shared/entities/sleep-instance.entity';
import { Timezone } from '../../shared/entities/timezone.entity';
import { HealthFactor, HealthFactorProperty, HealthFactorProperties } from '../../health-factor/entities';
import { HealthFactorInputType } from '../../health-factor/enums/health-factor-input-type.enum';
import { Account } from '../../account/entities/account.entity';
import { AccountRole } from '../../account/enums/role.enum';
import { generateUuidv7 } from '../../shared/utils/generateUuidV7';
async function seed() {
  // Create a new DataSource with the same configuration as the app
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'aws-1-eu-central-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres.syaspxqmzugybgoftbhg',
    password: process.env.DB_PASSWORD || 'Amatr@123!',
    database: process.env.DB_DATABASE || 'postgres',
    entities: [
      User,
      Team,
      Athlete,
      WindowInstance,
      Metrics,
      SleepInstance,
      Timezone,
      HealthFactor,
      HealthFactorProperty,
      HealthFactorProperties,
      Account,
    ],
    synchronize: false,
    logging: process.env.DB_LOG === 'true',
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Get repositories
    const accountRepository = dataSource.getRepository(Account);
    const userRepository = dataSource.getRepository(User);
    const teamRepository = dataSource.getRepository(Team);
    const healthFactorRepository = dataSource.getRepository(HealthFactor);
    const healthFactorPropertyRepository = dataSource.getRepository(HealthFactorProperty);
    const healthFactorPropertiesRepository = dataSource.getRepository(HealthFactorProperties);

    // Check if data already exists
    const existingHealthFactors = await healthFactorRepository.count();
    if (existingHealthFactors > 0) {
      console.log('Health factors already exist, skipping seed');
      return;
    }

    // Create a sample team first
    let team = await teamRepository.findOne({ where: { name: 'Sample Team' } });
    if (!team) {
      team = teamRepository.create({
        id: generateUuidv7(),
        name: 'Sample Team',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await teamRepository.save(team);
      console.log('Created sample team');
    }

    // Create a sample account
    let account = await accountRepository.findOne({ where: { email: 'admin@example.com' } });
    if (!account) {
      account = accountRepository.create({
        id: generateUuidv7(),
        email: 'admin@example.com',
        role: AccountRole.ADMIN,
        password: 'hashed_password_here', // In production, this should be properly hashed
      });
      await accountRepository.save(account);
      console.log('Created sample account');
    }

    // Create a sample user
    let user = await userRepository.findOne({
      where: { email: 'admin@example.com' },
      relations: ['account'],
    });
    if (!user) {
      user = userRepository.create({
        id: generateUuidv7(),
        account: account,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        team: team,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.save(user);
      console.log('Created sample user');
    } else {
      // Ensure user has account linked
      if (user.account) {
        account = user.account;
      } else {
        // If account doesn't exist, create it
        account = await accountRepository.findOne({ where: { email: 'admin@example.com' } });
        if (!account) {
          account = accountRepository.create({
            id: generateUuidv7(),
            email: 'admin@example.com',
            role: AccountRole.ADMIN,
            password: 'hashed_password_here',
          });
          await accountRepository.save(account);
        }
        user.account = account;
        await userRepository.save(user);
      }
    }

    // Create Health Factor Properties
    const healthFactorProperties = [
      {
        key: 'sleep_duration',
        label: 'Sleep Duration (hours)',
        inputType: HealthFactorInputType.NUMBER,
        options: null,
      },
      {
        key: 'sleep_quality',
        label: 'Sleep Quality',
        inputType: HealthFactorInputType.SELECT,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        key: 'stress_level',
        label: 'Stress Level',
        inputType: HealthFactorInputType.SLIDER,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      },
      {
        key: 'mood',
        label: 'Mood',
        inputType: HealthFactorInputType.MULTI_SELECT,
        options: ['Happy', 'Sad', 'Anxious', 'Calm', 'Energetic', 'Tired', 'Focused', 'Distracted'],
      },
      {
        key: 'exercise_duration',
        label: 'Exercise Duration (minutes)',
        inputType: HealthFactorInputType.NUMBER,
        options: null,
      },
      {
        key: 'exercise_type',
        label: 'Exercise Type',
        inputType: HealthFactorInputType.SELECT,
        options: ['Cardio', 'Strength Training', 'Yoga', 'Swimming', 'Running', 'Cycling', 'Other'],
      },
      {
        key: 'hydration_level',
        label: 'Hydration Level (glasses)',
        inputType: HealthFactorInputType.NUMBER,
        options: null,
      },
      {
        key: 'energy_level',
        label: 'Energy Level',
        inputType: HealthFactorInputType.SLIDER,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      },
      {
        key: 'pain_level',
        label: 'Pain Level',
        inputType: HealthFactorInputType.SLIDER,
        options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      },
      {
        key: 'medication_taken',
        label: 'Medication Taken',
        inputType: HealthFactorInputType.BOOLEAN,
        options: null,
      },
      {
        key: 'medication_time',
        label: 'Medication Time',
        inputType: HealthFactorInputType.TIME,
        options: null,
      },
      {
        key: 'symptoms',
        label: 'Symptoms',
        inputType: HealthFactorInputType.MULTI_SELECT,
        options: ['Headache', 'Nausea', 'Dizziness', 'Fatigue', 'Muscle Pain', 'Joint Pain', 'Fever', 'Cough', 'Other'],
      },
    ];

    const createdProperties: HealthFactorProperty[] = [];
    for (const prop of healthFactorProperties) {
      const property = healthFactorPropertyRepository.create({
        id: generateUuidv7(),
        key: prop.key,
        label: prop.label,
        inputType: prop.inputType,
        options: prop.options,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedProperty = await healthFactorPropertyRepository.save(property);
      createdProperties.push(savedProperty);
      console.log(`Created health factor property: ${prop.label}`);
    }

    // Create Health Factors
    const healthFactors = [
      {
        name: 'Sleep Quality Assessment',
        propertyKeys: ['sleep_duration', 'sleep_quality', 'stress_level'],
      },
      {
        name: 'Physical Activity Tracking',
        propertyKeys: ['exercise_duration', 'exercise_type', 'energy_level'],
      },
      {
        name: 'Daily Wellness Check',
        propertyKeys: ['mood', 'hydration_level', 'energy_level', 'pain_level'],
      },
      {
        name: 'Medication Compliance',
        propertyKeys: ['medication_taken', 'medication_time', 'symptoms'],
      },
      {
        name: 'Pain Management',
        propertyKeys: ['pain_level', 'symptoms', 'mood'],
      },
    ];

    for (const healthFactorData of healthFactors) {
      const healthFactor = healthFactorRepository.create({
        id: generateUuidv7(),
        name: healthFactorData.name,
        creator: account,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedHealthFactor = await healthFactorRepository.save(healthFactor);
      console.log(`Created health factor: ${healthFactorData.name}`);

      // Create relationships between health factor and properties
      for (const propertyKey of healthFactorData.propertyKeys) {
        const property = createdProperties.find((p) => p.key === propertyKey);
        if (property) {
          const healthFactorProperty = healthFactorPropertiesRepository.create({
            id: generateUuidv7(),
            healthFactor: savedHealthFactor,
            healthFactorProperty: property,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          await healthFactorPropertiesRepository.save(healthFactorProperty);
          console.log(`  - Linked property: ${property.label}`);
        }
      }
    }

    console.log('Seed completed successfully!');
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
