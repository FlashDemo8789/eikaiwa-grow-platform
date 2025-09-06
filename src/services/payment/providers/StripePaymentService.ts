import { PrismaClient } from '@/lib/prisma-stub';
import Stripe from 'stripe';
import type { 
  CreatePaymentRequest, 
  PaymentMethodRequest,
  StripeConnectAccount 
} from '@/types/payment';
import { logger } from '@/lib/logger';

export class StripePaymentService {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
    this.prisma = prisma;
  }

  /**
   * Create or retrieve Stripe customer
   */
  async createStripeCustomer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.stripeCustomerId) {
      return customer.stripeCustomerId;
    }

    // Create Stripe customer
    const stripeCustomer = await this.stripe.customers.create({
      email: customer.email,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      address: customer.address as any,
      metadata: {
        eikaiwaGrowCustomerId: customerId,
        organizationId: customer.organizationId,
      },
    });

    // Update customer record
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { stripeCustomerId: stripeCustomer.id },
    });

    return stripeCustomer.id;
  }

  /**
   * Process Stripe payment
   */
  async processPayment(paymentId: string, request: CreatePaymentRequest) {
    try {
      const stripeCustomerId = await this.createStripeCustomer(request.customerId);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency || 'jpy',
        customer: stripeCustomerId,
        payment_method: request.paymentMethodId,
        confirm: !!request.paymentMethodId, // Auto-confirm if payment method provided
        description: request.description,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          eikaiwaGrowPaymentId: paymentId,
          customerId: request.customerId,
          ...request.metadata,
        },
      });

      return {
        externalId: paymentIntent.id,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          nextAction: paymentIntent.next_action,
        },
      };
    } catch (error) {
      logger.error('Stripe payment processing failed', {
        error: error.message,
        paymentId,
        request,
      });

      return {
        externalId: null,
        status: 'FAILED' as const,
        metadata: {
          error: error.message,
          errorCode: error.code,
        },
      };
    }
  }

  /**
   * Process Stripe Connect marketplace payment
   */
  async processMarketplacePayment(
    paymentId: string, 
    request: CreatePaymentRequest, 
    connectedAccountId: string,
    applicationFeeAmount?: number
  ) {
    try {
      const stripeCustomerId = await this.createStripeCustomer(request.customerId);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100),
        currency: request.currency || 'jpy',
        customer: stripeCustomerId,
        payment_method: request.paymentMethodId,
        confirm: !!request.paymentMethodId,
        description: request.description,
        application_fee_amount: applicationFeeAmount ? Math.round(applicationFeeAmount * 100) : undefined,
        transfer_data: {
          destination: connectedAccountId,
        },
        metadata: {
          eikaiwaGrowPaymentId: paymentId,
          customerId: request.customerId,
          connectedAccountId,
          ...request.metadata,
        },
      });

      return {
        externalId: paymentIntent.id,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          connectedAccountId,
          applicationFeeAmount,
        },
      };
    } catch (error) {
      logger.error('Stripe marketplace payment failed', {
        error: error.message,
        paymentId,
        connectedAccountId,
      });
      throw error;
    }
  }

  /**
   * Add payment method to customer
   */
  async addPaymentMethod(customer: any, request: PaymentMethodRequest) {
    try {
      const stripeCustomerId = await this.createStripeCustomer(customer.id);

      let paymentMethod;
      
      if (request.token) {
        // Attach existing payment method
        paymentMethod = await this.stripe.paymentMethods.attach(request.token, {
          customer: stripeCustomerId,
        });
      } else {
        throw new Error('Payment method token is required for Stripe');
      }

      return {
        externalId: paymentMethod.id,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        metadata: {
          stripePaymentMethodId: paymentMethod.id,
          fingerprint: paymentMethod.card?.fingerprint,
        },
      };
    } catch (error) {
      logger.error('Failed to add Stripe payment method', {
        error: error.message,
        customerId: customer.id,
      });
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(payment: any, amount: number, reason?: string) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.externalId,
        amount: Math.round(amount * 100),
        reason: reason as any,
        metadata: {
          eikaiwaGrowPaymentId: payment.id,
          reason: reason || 'requested_by_customer',
        },
      });

      return {
        externalId: refund.id,
        status: this.mapStripeRefundStatusToRefundStatus(refund.status),
        processedAt: new Date(),
      };
    } catch (error) {
      logger.error('Stripe refund failed', {
        error: error.message,
        paymentId: payment.id,
        amount,
      });
      throw error;
    }
  }

  /**
   * Create Stripe Connect account for marketplace
   */
  async createConnectAccount(organizationId: string, email: string, country: string = 'JP') {
    try {
      const account = await this.stripe.accounts.create({
        type: 'standard',
        country,
        email,
        metadata: {
          organizationId,
        },
      });

      // Create account link for onboarding
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.APP_URL}/dashboard/payments/connect/refresh`,
        return_url: `${process.env.APP_URL}/dashboard/payments/connect/return`,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        account,
      };
    } catch (error) {
      logger.error('Failed to create Stripe Connect account', {
        error: error.message,
        organizationId,
        email,
      });
      throw error;
    }
  }

  /**
   * Get Connect account status
   */
  async getConnectAccountStatus(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      
      return {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requiresAction: !account.details_submitted || 
                       account.requirements?.currently_due?.length > 0 ||
                       account.requirements?.eventually_due?.length > 0,
        requirements: account.requirements,
      };
    } catch (error) {
      logger.error('Failed to get Stripe Connect account status', {
        error: error.message,
        accountId,
      });
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string,
    trialPeriodDays?: number,
    connectedAccountId?: string
  ) {
    try {
      const stripeCustomerId = await this.createStripeCustomer(customerId);

      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        default_payment_method: paymentMethodId,
        trial_period_days: trialPeriodDays,
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          eikaiwaGrowCustomerId: customerId,
        },
        application_fee_percent: connectedAccountId ? 10 : undefined, // 10% platform fee
        transfer_data: connectedAccountId ? {
          destination: connectedAccountId,
        } : undefined,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create Stripe subscription', {
        error: error.message,
        customerId,
        priceId,
      });
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(payload: string, signature: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      logger.info('Stripe webhook received', {
        type: event.type,
        id: event.id,
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        default:
          logger.info('Unhandled Stripe webhook event', { type: event.type });
      }

      return { received: true };
    } catch (error) {
      logger.error('Stripe webhook processing failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Map Stripe status to internal payment status
   */
  private mapStripeStatusToPaymentStatus(stripeStatus: string) {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'PENDING' as const;
      case 'processing':
        return 'PROCESSING' as const;
      case 'succeeded':
        return 'SUCCEEDED' as const;
      case 'canceled':
        return 'CANCELED' as const;
      default:
        return 'FAILED' as const;
    }
  }

  /**
   * Map Stripe refund status to internal refund status
   */
  private mapStripeRefundStatusToRefundStatus(stripeStatus: string) {
    switch (stripeStatus) {
      case 'pending':
        return 'PROCESSING' as const;
      case 'succeeded':
        return 'SUCCEEDED' as const;
      case 'failed':
        return 'FAILED' as const;
      case 'canceled':
        return 'CANCELED' as const;
      default:
        return 'PENDING' as const;
    }
  }

  /**
   * Handle successful payment webhook
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const paymentId = paymentIntent.metadata?.eikaiwaGrowPaymentId;
    if (!paymentId) return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        processedAt: new Date(),
        stripeFee: paymentIntent.charges?.data[0]?.balance_transaction ? 
          new Decimal((paymentIntent.charges.data[0].balance_transaction as any).fee / 100) : undefined,
        netAmount: paymentIntent.charges?.data[0]?.balance_transaction ?
          new Decimal((paymentIntent.charges.data[0].balance_transaction as any).net / 100) : undefined,
      },
    });
  }

  /**
   * Handle failed payment webhook
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const paymentId = paymentIntent.metadata?.eikaiwaGrowPaymentId;
    if (!paymentId) return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'FAILED',
        processedAt: new Date(),
      },
    });
  }

  /**
   * Handle invoice payment succeeded webhook
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle subscription billing
    if (invoice.subscription) {
      // Update billing subscription status
      await this.prisma.billingSubscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: { status: 'ACTIVE' },
      });
    }
  }

  /**
   * Handle subscription updated webhook
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await this.prisma.billingSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: this.mapStripeSubscriptionStatusToBillingStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    });
  }

  /**
   * Handle account updated webhook
   */
  private async handleAccountUpdated(account: Stripe.Account) {
    // Update connect account status in your database if needed
    logger.info('Stripe Connect account updated', {
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  }

  private mapStripeSubscriptionStatusToBillingStatus(stripeStatus: Stripe.Subscription.Status) {
    switch (stripeStatus) {
      case 'active':
        return 'ACTIVE' as const;
      case 'past_due':
        return 'PAST_DUE' as const;
      case 'canceled':
        return 'CANCELED' as const;
      case 'incomplete':
        return 'INCOMPLETE' as const;
      case 'incomplete_expired':
        return 'INCOMPLETE_EXPIRED' as const;
      case 'trialing':
        return 'TRIALING' as const;
      case 'unpaid':
        return 'UNPAID' as const;
      default:
        return 'INCOMPLETE' as const;
    }
  }
}

import { Decimal } from '@prisma/client/runtime/library';