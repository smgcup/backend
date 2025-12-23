import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcuteSymptomRule } from './entities/acute-symptom-rule.entity';
import { AcuteSymptomRuleset } from './entities/acute-symptom-ruleset.entity';
import { ComparisonOperator } from './enums/comparison-operator.enum';
import { ParameterDeviations } from '../metrics-deviation/entities/parameter-deviations.entity';

@Injectable()
export class AcuteSymptomRuleService {
  constructor(
    @InjectRepository(AcuteSymptomRuleset)
    private readonly rulesetRepository: Repository<AcuteSymptomRuleset>,
    @InjectRepository(ParameterDeviations)
    private readonly parameterDeviationsRepository: Repository<ParameterDeviations>,
  ) {}

  /**
   * Checks if a single acute symptom rule matches the current value, mean, and sigma1
   * @param rule - The acute symptom rule to check
   * @param currentValue - The current value of the parameter
   * @param mean - The mean of the parameter
   * @param sigma1 - The standard deviation of the parameter
   * @returns True if the rule matches, false otherwise
   */
  private checkAcuteSymptomRule(rule: AcuteSymptomRule, currentValue: number, mean: number, sigma1: number): boolean {
    const standardDeviations = parseFloat(rule.value);

    if (isNaN(standardDeviations)) {
      return false;
    }

    switch (rule.operator) {
      case ComparisonOperator.EQUAL:
        // For EQUAL, check if value is within a small tolerance of the mean
        // This is a bit unusual for statistical comparison, but keeping for compatibility
        return Math.abs(currentValue - mean) < 0.01;
      case ComparisonOperator.GREATER_THAN:
        // Check if current value is greater than mean + (sigma1 * standardDeviations)
        return currentValue > mean + sigma1 * standardDeviations;
      case ComparisonOperator.LESS_THAN:
        // Check if current value is less than mean - (sigma1 * standardDeviations)
        return currentValue < mean - sigma1 * standardDeviations;
    }
  }

  /**
   *
   * @param currentValue - The current value of the parameter
   * @param mean - The mean of the parameter
   * @param sigma1 - The standard deviation of the parameter
   * @returns The number of standard deviations away from the mean
   */
  private calculateStandartDeviationsAwayFromThreshold(currentValue: number, mean: number, sigma1: number): number {
    return (currentValue - mean) / sigma1;
  }

  /**
   * Checks all acute symptom rulesets and returns symptom IDs that have all their rules matching
   * @param values Map of parameterId to current value for rule evaluation
   * @param athleteId The athlete ID to fetch parameter deviations for
   * @returns Array of symptoms that are triggered (all rules match)
   */
  async checkAcuteSymptomRules(
    values: Record<string, number>,
    athleteId: string,
  ): Promise<{ symptomId: string; severityScore: number }[]> {
    // Fetch all rulesets with their rules from the database
    const rulesets = await this.rulesetRepository.find({
      relations: ['rule'],
    });

    // Fetch parameter deviations for this athlete
    const parameterDeviations = await this.parameterDeviationsRepository.find({
      where: { athleteId },
      relations: ['parameter'],
    });
    // Create a map for quick lookup of parameter deviations by parameterId
    const deviationsByParameterId = new Map<string, ParameterDeviations>();
    for (const deviation of parameterDeviations) {
      deviationsByParameterId.set(deviation.parameter.id, deviation);
    }

    // Group rulesets by symptomId
    const rulesetsBySymptom = new Map<string, AcuteSymptomRule[]>();
    for (const ruleset of rulesets) {
      if (!rulesetsBySymptom.has(ruleset.symptomId)) {
        rulesetsBySymptom.set(ruleset.symptomId, []);
      }
      rulesetsBySymptom.get(ruleset.symptomId)!.push(ruleset.rule);
    }

    // Check each symptom's rules
    const triggeredSymptoms: { symptomId: string; severityScore: number }[] = [];
    for (const [symptomId, rules] of rulesetsBySymptom.entries()) {
      // Check if all rules for this symptom match
      const allRulesMatch = rules.every((rule) => {
        const currentValue = values[rule.parameterId];
        if (currentValue === undefined) {
          return false; // Parameter value not provided
        }

        const deviation = deviationsByParameterId.get(rule.parameterId);
        if (!deviation) {
          return false; // No deviation data available for this parameter
        }

        return this.checkAcuteSymptomRule(rule, currentValue, deviation.mean, deviation.sigma1);
      });

      if (allRulesMatch) {
        // Calculate severity score as sum of standard deviations across all parameters
        let severityScore = 0;

        for (const rule of rules) {
          const currentValue = values[rule.parameterId];
          const deviation = deviationsByParameterId.get(rule.parameterId);

          if (currentValue !== undefined && deviation) {
            severityScore += this.calculateStandartDeviationsAwayFromThreshold(
              currentValue,
              deviation.mean,
              deviation.sigma1,
            );
          }
        }

        triggeredSymptoms.push({ symptomId, severityScore });
      }
    }

    return triggeredSymptoms;
  }
}
