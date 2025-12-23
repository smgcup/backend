/**
 * Data item types for Terra sleep data.
 * Response wrapper types have been moved to ../responses/terra-responses.ts
 */
export type SleepDataItem = {
  data_enrichment: SleepDataEnrichment;
  device_data: DeviceData;
  heart_rate_data: HeartRateData;
  metadata: SleepMetadata;
  readiness_data: ReadinessData;
  respiration_data: RespirationData;
  scores: SleepScores;
  sleep_durations_data: SleepDurationsData;
  temperature_data: TemperatureData;
};

/* ---------- Enrichment ---------- */

type SleepDataEnrichment = {
  sleep_contributors: Contributor[];
  sleep_score: number;
};

type Contributor = {
  contributor_name: string;
  contributor_score: number;
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

/* ---------- Metadata ---------- */

type SleepMetadata = {
  end_time: string; // ISO datetime
  is_nap: boolean;
  start_time: string; // ISO datetime
  summary_id: string;
  timestamp_localization: number;
  upload_type: number;
};

/* ---------- Readiness ---------- */

type ReadinessData = {
  readiness: number;
  recovery_level: number;
};

/* ---------- Respiration ---------- */

type RespirationData = {
  breaths_data: BreathsData;
  oxygen_saturation_data: OxygenSaturationData;
  snoring_data: SnoringData;
};

type BreathsData = {
  avg_breaths_per_min: number;
  max_breaths_per_min: number;
  min_breaths_per_min: number;
  on_demand_reading: boolean;
  samples: BreathsSample[];
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
};

type BreathsSample = {
  timestamp: string; // ISO datetime
  breaths_per_min: number;
};

type OxygenSaturationData = {
  avg_saturation_percentage: number;
  end_time: string; // ISO datetime
  samples: OxygenSaturationSample[];
  start_time: string; // ISO datetime
};

type OxygenSaturationSample = {
  timestamp: string; // ISO datetime
  percentage: number;
  type: number; // enum-ish (e.g., 0)
};

type SnoringData = {
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  num_snoring_events: number;
  samples: SnoringSample[];
  total_snoring_duration_seconds: number;
};

type SnoringSample = {
  timestamp: string; // ISO datetime
  duration_seconds: number;
};

/* ---------- Scores ---------- */

type SleepScores = {
  sleep_score: number;
};

/* ---------- Sleep Durations ---------- */

type SleepDurationsData = {
  asleep: SleepAsleep;
  awake: SleepAwake;
  hypnogram_samples: HypnogramSample[];
  other: SleepOther;
  sleep_efficiency: number; // %
};

type SleepAsleep = {
  duration_asleep_state_seconds: number;
  duration_deep_sleep_state_seconds: number;
  duration_light_sleep_state_seconds: number;
  duration_REM_sleep_state_seconds: number;
  num_REM_events: number;
};

type SleepAwake = {
  duration_awake_state_seconds: number;
  duration_long_interruption_seconds: number;
  duration_short_interruption_seconds: number;
  num_out_of_bed_events: number;
  num_wakeup_events: number;
  sleep_latency_seconds: number;
  wake_up_latency_seconds: number;
};

type HypnogramSample = {
  timestamp: string; // ISO datetime
  level: number; // stage enum-ish from source (e.g., 1-4)
};

type SleepOther = {
  duration_in_bed_seconds: number;
  duration_unmeasurable_sleep_seconds: number;
};

/* ---------- Temperature ---------- */

type TemperatureData = {
  delta: number; // relative change
};
