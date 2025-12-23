/**
 * Data item types for Terra daily data.
 * Response wrapper types have been moved to ../responses/terra-responses.ts
 */
export type TerraDailyDataItem = {
  active_durations_data: ActiveDurationsData;
  calories_data: CaloriesData;
  data_enrichment: DataEnrichment;
  device_data: DeviceData;
  distance_data: DistanceData;
  heart_rate_data: HeartRateData;
  MET_data: METData;
  metadata: Metadata;
  oxygen_data: OxygenData;
  scores: Scores;
  strain_data: StrainData;
  stress_data: StressData;
  tag_data: TagData;
};

type ActiveDurationsData = {
  activity_levels_samples: ActivityLevelSample[];
  activity_seconds: number;
  inactivity_seconds: number;
  low_intensity_seconds: number;
  moderate_intensity_seconds: number;
  num_continuous_inactive_periods: number;
  rest_seconds: number;
  vigorous_intensity_seconds: number;
  standing_hours_count: number;
  standing_seconds: number;
};

type ActivityLevelSample = {
  timestamp: string; // ISO datetime
  level: number;
};

type CaloriesData = {
  BMR_calories: number;
  calorie_samples: CalorieSample[];
  net_activity_calories: number;
  net_intake_calories: number;
  total_burned_calories: number;
};

type CalorieSample = {
  timestamp: string; // ISO datetime
  calories: number;
  timer_duration_seconds: number;
};

type DataEnrichment = {
  cardiovascular_contributors: Contributor[];
  cardiovascular_score: number;
  immune_contributors: Contributor[];
  immune_index: number;
  readiness_contributors: Contributor[];
  readiness_score: number;
  respiratory_contributors: Contributor[];
  respiratory_score: number;
  start_time: string;
  stress_contributors: Contributor[];
  total_stress_score: number;
};

type Contributor = {
  contributor_name: string;
  contributor_score: number;
};

type DeviceData = {
  activation_timestamp: string; // ISO datetime
  data_provided: string[];
  hardware_version: string;
  last_upload_date: string;
  manufacturer: string;
  name: string;
  other_devices: OtherDevice[];
  sensor_state: string;
  serial_number: string;
  software_version: string;
};

type OtherDevice = {
  manufacturer: string;
  hardware_version: string;
  serial_number: string;
  name: string;
  software_version: string;
  activation_timestamp: string;
  data_provided: string[];
  last_upload_date: string;
};

type DistanceData = {
  detailed: DetailedDistance;
  distance_meters: number;
  elevation: Elevation;
  floors_climbed: number;
  steps: number;
  swimming: Swimming;
};

type DetailedDistance = {
  distance_samples: DistanceSample[];
  elevation_samples: ElevationSample[];
  floors_climbed_samples: FloorsClimbedSample[];
  step_samples: StepSample[];
};

type DistanceSample = {
  timestamp: string; // ISO datetime
  distance_meters: number;
  timer_duration_seconds: number;
};

type ElevationSample = {
  timestamp: string; // ISO datetime
  elev_meters: number;
  timer_duration_seconds: number;
};

type FloorsClimbedSample = {
  timestamp: string; // ISO datetime
  floors_climbed: number;
  timer_duration_seconds: number;
};

type StepSample = {
  timestamp: string; // ISO datetime
  steps: number;
  timer_duration_seconds: number;
};

type Elevation = {
  avg_meters: number;
  gain_actual_meters: number;
  gain_planned_meters: number;
  loss_actual_meters: number;
  max_meters: number;
  min_meters: number;
};

type Swimming = {
  num_laps: number;
  num_strokes: number;
  pool_length_meters: number;
};

type HeartRateData = {
  detailed: HeartRateDetailed;
  summary: HeartRateSummary;
};

type HeartRateDetailed = {
  hr_samples: HRSample[];
  hrv_samples_rmssd: HRVRmssdSample[];
  hrv_samples_sdnn: HRVSdnnSample[];
};

type HRSample = {
  timestamp: string; // ISO datetime
  bpm: number;
  timer_duration_seconds: number;
  context: number;
};

type HRVRmssdSample = {
  timestamp: string; // ISO datetime
  hrv_rmssd: number;
};

type HRVSdnnSample = {
  timestamp: string; // ISO datetime
  hrv_sdnn: number;
};

type HeartRateSummary = {
  avg_hr_bpm: number;
  avg_hrv_rmssd: number;
  avg_hrv_sdnn: number;
  hr_zone_data: HRZone[];
  max_hr_bpm: number;
  min_hr_bpm: number;
  resting_hr_bpm: number;
  user_max_hr_bpm: number;
};

type HRZone = {
  zone: number;
  start_percentage: number;
  end_percentage: number;
  name: string;
  duration_seconds: number;
};

type METData = {
  MET_samples: METSample[];
  avg_level: number;
  num_high_intensity_minutes: number;
  num_inactive_minutes: number;
  num_low_intensity_minutes: number;
  num_moderate_intensity_minutes: number;
};

type METSample = {
  timestamp: string; // ISO datetime
  level: number;
};

type Metadata = {
  end_time: string; // ISO datetime
  start_time: string; // ISO datetime
  timestamp_localization: number;
  upload_type: number;
};

type OxygenData = {
  avg_saturation_percentage: number;
  saturation_samples: SaturationSample[];
  vo2_samples: VO2Sample[];
  vo2max_ml_per_min_per_kg: number;
};

type SaturationSample = {
  timestamp: string; // ISO datetime
  percentage: number;
  type: number;
};

type VO2Sample = {
  timestamp: string; // ISO datetime
  vo2max_ml_per_min_per_kg: number;
};

type Scores = {
  activity: number;
  recovery: number;
  sleep: number;
};

type StrainData = {
  strain_level: number;
};

type StressData = {
  avg_stress_level: number;
  activity_stress_duration_seconds: number;
  low_stress_duration_seconds: number;
  max_stress_level: number;
  medium_stress_duration_seconds: number;
  samples: StressSample[];
  rest_stress_duration_seconds: number;
  high_stress_duration_seconds: number;
  stress_duration_seconds: number;
  stress_rating: number;
  body_battery_samples: BodyBatterySample[];
};

type StressSample = {
  timestamp: string; // ISO datetime
  level: number;
};

type BodyBatterySample = {
  timestamp: string; // ISO datetime
  level: number;
};

type TagData = {
  tags: Tag[];
};

type Tag = {
  timestamp: string; // ISO datetime
  tag_name: string;
  notes: string;
};
