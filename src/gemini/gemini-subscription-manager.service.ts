import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiSubscriptionManagerService {
  // Static reference for use in GraphQL subscription filters (which are static functions)
  private static instance: GeminiSubscriptionManagerService | null = null;

  private readonly activeSubscriptions = new Set<string>();

  constructor() {
    // Set static reference when service is instantiated
    GeminiSubscriptionManagerService.instance = this;
  }

  static getInstance(): GeminiSubscriptionManagerService | null {
    return GeminiSubscriptionManagerService.instance;
  }

  add(subscriptionId: string): void {
    this.activeSubscriptions.add(subscriptionId);
  }

  remove(subscriptionId: string): void {
    this.activeSubscriptions.delete(subscriptionId);
  }

  has(subscriptionId: string): boolean {
    return this.activeSubscriptions.has(subscriptionId);
  }
}
