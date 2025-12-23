/**
 * Data item types for Terra activity data.
 * Response wrapper types have been moved to ../responses/terra-responses.ts
 */
export type ActivityDataItem = {
  active_durations_data: ActiveDurationsData;
  calories_data: CaloriesData;
  cheat_detection: number;
  data_enrichment: ActivityDataEnrichment;
  device_data: DeviceData;
  distance_data: DistanceData;
  energy_data: EnergyData;
  heart_rate_data: HeartRateData;
  lap_data: LapData;
  MET_data: METData;
  metadata: ActivityMetadata;
  movement_data: MovementData;
  oxygen_data: OxygenData;
  polyline_map_data: PolylineMapData;
  position_data: PositionData;
  power_data: PowerData;
  strain_data: StrainData;
  TSS_data: TSSData;
  work_data: WorkData;
};

/* ---------- Active Durations ---------- */

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

/* ---------- Calories ---------- */

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

/* ---------- Enrichment ---------- */

type ActivityDataEnrichment = {
  stress_score: number;
};

/* ---------- Device ---------- */

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

/* ---------- Distance ---------- */

type DistanceData = {
  detailed: DetailedDistance;
  summary: DistanceSummary;
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

type DistanceSummary = {
  distance_meters: number;
  elevation: Elevation;
  floors_climbed: number;
  steps: number;
  swimming: Swimming;
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

/* ---------- Energy ---------- */

type EnergyData = {
  energy_kilojoules: number;
  energy_planned_kilojoules: number;
};

/* ---------- Heart Rate ---------- */

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

/* ---------- Laps ---------- */

type LapData = {
  laps: Lap[];
};

type Lap = {
  calories: number;
  avg_hr_bpm: number;
  start_time: string; // ISO datetime
  avg_speed_meters_per_second: number;
  distance_meters: number;
  total_strokes: number;
  end_time: string; // ISO datetime
  stroke_type: string;
};

/* ---------- MET ---------- */

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

/* ---------- Metadata ---------- */

type ActivityMetadata = {
  city: string;
  country: string;
  end_time: string; // ISO datetime
  name: string;
  start_time: string; // ISO datetime
  state: string;
  summary_id: string;
  timestamp_localization: number;
  type: number;
  upload_type: number;
};

/* ---------- Movement ---------- */

type MovementData = {
  adjusted_max_speed_meters_per_second: number;
  avg_cadence_rpm: number;
  avg_pace_minutes_per_kilometer: number;
  avg_speed_meters_per_second: number;
  avg_torque_newton_meters: number;
  avg_velocity_meters_per_second: number;
  cadence_samples: CadenceSample[];
  max_cadence_rpm: number;
  max_pace_minutes_per_kilometer: number;
  max_speed_meters_per_second: number;
  max_torque_newton_meters: number;
  max_velocity_meters_per_second: number;
  normalized_speed_meters_per_second: number;
  speed_samples: SpeedSample[];
  torque_samples: TorqueSample[];
};

type CadenceSample = {
  timestamp: string; // ISO datetime
  cadence_rpm: number;
  timer_duration_seconds: number;
};

type SpeedSample = {
  timestamp: string; // ISO datetime
  speed_meters_per_second: number;
  timer_duration_seconds: number;
};

type TorqueSample = {
  timestamp: string; // ISO datetime
  timer_duration_seconds: number;
  torque_newton_meters: number;
};

/* ---------- Oxygen ---------- */

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

/* ---------- Map / Position ---------- */

type PolylineMapData = {
  summary_polyline: string;
};

type PositionData = {
  center_pos_lat_lng_deg: LatLngTuple;
  end_pos_lat_lng_deg: LatLngTuple;
  position_samples: PositionSample[];
  start_pos_lat_lng_deg: LatLngTuple;
};

type LatLngTuple = [number, number];

type PositionSample = {
  timestamp: string; // ISO datetime
  coords_lat_lng_deg: LatLngTuple;
  timer_duration_seconds: number;
};

/* ---------- Power ---------- */

type PowerData = {
  avg_watts: number;
  max_watts: number;
  power_samples: PowerSample[];
};

type PowerSample = {
  timestamp: string; // ISO datetime
  watts: number;
  timer_duration_seconds: number;
};

/* ---------- Strain / TSS / Work ---------- */

type StrainData = {
  strain_level: number;
};

type TSSData = {
  TSS_samples: TSSSample[];
};

type TSSSample = {
  planned: number;
  actual: number;
  method: string;
  intensity_factor_planned: number;
  intensity_factor_actual: number;
  normalized_power_watts: number;
};

type WorkData = {
  work_kilojoules: number;
};
