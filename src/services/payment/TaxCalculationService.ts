import type { TaxCalculation } from '@/types/payment';
import { JAPAN_TAX_RATES } from '@/types/payment';
import { logger } from '@/lib/logger';

export class TaxCalculationService {
  /**
   * Calculate tax for a given amount and region
   */
  calculateTax(
    amount: number,
    taxRegion: string = 'JP',
    organizationSettings?: any
  ): TaxCalculation {
    try {
      switch (taxRegion.toLowerCase()) {
        case 'jp':
        case 'japan':
          return this.calculateJapanTax(amount, organizationSettings);
        
        case 'us':
        case 'usa':
          // Future implementation for US tax
          return this.calculateUSTax(amount, organizationSettings);
        
        default:
          logger.warn('Unsupported tax region, applying Japan tax', { taxRegion });
          return this.calculateJapanTax(amount, organizationSettings);
      }
    } catch (error) {
      logger.error('Tax calculation failed', {
        error: error.message,
        amount,
        taxRegion,
      });
      
      // Return default calculation
      return {
        taxableAmount: amount,
        taxAmount: 0,
        taxRate: 0,
        taxRegion,
      };
    }
  }

  /**
   * Calculate Japanese consumption tax
   */
  private calculateJapanTax(
    amount: number,
    organizationSettings?: any
  ): TaxCalculation {
    // Check if organization has tax-exempt status
    const isExempt = organizationSettings?.tax?.exempt || false;
    const useReducedRate = organizationSettings?.tax?.useReducedRate || false;
    
    if (isExempt) {
      return {
        taxableAmount: amount,
        taxAmount: 0,
        taxRate: 0,
        exemptAmount: amount,
        taxRegion: 'JP',
      };
    }

    // Determine tax rate
    const taxRate = useReducedRate 
      ? JAPAN_TAX_RATES.REDUCED_TAX 
      : JAPAN_TAX_RATES.CONSUMPTION_TAX;

    // Calculate tax amount
    const taxAmount = Math.round(amount * taxRate);

    return {
      taxableAmount: amount,
      taxAmount,
      taxRate,
      taxRegion: 'JP',
    };
  }

  /**
   * Calculate US tax (placeholder for future implementation)
   */
  private calculateUSTax(
    amount: number,
    organizationSettings?: any
  ): TaxCalculation {
    // This would need to integrate with a US tax calculation service
    // considering state, local, and federal taxes
    
    return {
      taxableAmount: amount,
      taxAmount: 0,
      taxRate: 0,
      taxRegion: 'US',
    };
  }

  /**
   * Calculate tax for invoice line items
   */
  calculateInvoiceTax(
    lineItems: Array<{
      amount: number;
      taxable?: boolean;
      taxCategory?: 'standard' | 'reduced' | 'exempt';
    }>,
    taxRegion: string = 'JP',
    organizationSettings?: any
  ) {
    try {
      let totalTaxableAmount = 0;
      let totalExemptAmount = 0;
      let totalTaxAmount = 0;
      const itemTaxDetails: Array<{
        amount: number;
        taxableAmount: number;
        taxAmount: number;
        taxRate: number;
        category: string;
      }> = [];

      for (const item of lineItems) {
        const isTaxable = item.taxable !== false; // Default to taxable
        const category = item.taxCategory || 'standard';

        if (!isTaxable || category === 'exempt') {
          totalExemptAmount += item.amount;
          itemTaxDetails.push({
            amount: item.amount,
            taxableAmount: 0,
            taxAmount: 0,
            taxRate: 0,
            category: 'exempt',
          });
          continue;
        }

        let taxRate: number;
        
        switch (taxRegion.toLowerCase()) {
          case 'jp':
          case 'japan':
            taxRate = category === 'reduced' 
              ? JAPAN_TAX_RATES.REDUCED_TAX 
              : JAPAN_TAX_RATES.CONSUMPTION_TAX;
            break;
          default:
            taxRate = 0;
        }

        const itemTaxAmount = Math.round(item.amount * taxRate);
        
        totalTaxableAmount += item.amount;
        totalTaxAmount += itemTaxAmount;

        itemTaxDetails.push({
          amount: item.amount,
          taxableAmount: item.amount,
          taxAmount: itemTaxAmount,
          taxRate,
          category,
        });
      }

      return {
        totalTaxableAmount,
        totalExemptAmount,
        totalTaxAmount,
        itemDetails: itemTaxDetails,
        taxRegion,
        effectiveTaxRate: totalTaxableAmount > 0 
          ? totalTaxAmount / totalTaxableAmount 
          : 0,
      };
    } catch (error) {
      logger.error('Invoice tax calculation failed', {
        error: error.message,
        lineItems,
        taxRegion,
      });
      throw error;
    }
  }

  /**
   * Get tax rates for a region
   */
  getTaxRates(taxRegion: string = 'JP') {
    switch (taxRegion.toLowerCase()) {
      case 'jp':
      case 'japan':
        return {
          standard: JAPAN_TAX_RATES.CONSUMPTION_TAX,
          reduced: JAPAN_TAX_RATES.REDUCED_TAX,
          exempt: 0,
          region: 'JP',
          description: {
            standard: '消費税 (Consumption Tax) - Applied to most goods and services',
            reduced: '軽減税率 (Reduced Rate) - Applied to food, newspapers, etc.',
            exempt: '非課税 (Tax Exempt) - Applied to certain educational services',
          },
        };
      
      default:
        return {
          standard: 0,
          reduced: 0,
          exempt: 0,
          region: taxRegion,
          description: {
            standard: 'Standard tax rate not defined for this region',
            reduced: 'Reduced tax rate not defined for this region',
            exempt: 'Tax exempt',
          },
        };
    }
  }

  /**
   * Validate tax calculation
   */
  validateTaxCalculation(calculation: TaxCalculation): boolean {
    try {
      // Basic validation
      if (calculation.taxableAmount < 0) return false;
      if (calculation.taxAmount < 0) return false;
      if (calculation.taxRate < 0 || calculation.taxRate > 1) return false;
      
      // Check if tax amount is reasonable given the rate
      const expectedTaxAmount = Math.round(calculation.taxableAmount * calculation.taxRate);
      if (Math.abs(calculation.taxAmount - expectedTaxAmount) > 1) {
        logger.warn('Tax calculation discrepancy detected', {
          calculated: calculation.taxAmount,
          expected: expectedTaxAmount,
          difference: Math.abs(calculation.taxAmount - expectedTaxAmount),
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Tax calculation validation failed', {
        error: error.message,
        calculation,
      });
      return false;
    }
  }

  /**
   * Format tax amount for display (in yen)
   */
  formatTaxAmount(amount: number, currency: string = 'JPY'): string {
    switch (currency.toLowerCase()) {
      case 'jpy':
        return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
      case 'usd':
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'eur':
        return `€${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      default:
        return `${amount.toLocaleString()} ${currency}`;
    }
  }

  /**
   * Get tax breakdown for display
   */
  getTaxBreakdown(
    subtotal: number,
    taxCalculation: TaxCalculation,
    currency: string = 'JPY'
  ) {
    return {
      subtotal: {
        amount: subtotal,
        formatted: this.formatTaxAmount(subtotal, currency),
      },
      taxAmount: {
        amount: taxCalculation.taxAmount,
        formatted: this.formatTaxAmount(taxCalculation.taxAmount, currency),
        rate: `${(taxCalculation.taxRate * 100).toFixed(1)}%`,
      },
      total: {
        amount: subtotal + taxCalculation.taxAmount,
        formatted: this.formatTaxAmount(subtotal + taxCalculation.taxAmount, currency),
      },
      exemptAmount: taxCalculation.exemptAmount ? {
        amount: taxCalculation.exemptAmount,
        formatted: this.formatTaxAmount(taxCalculation.exemptAmount, currency),
      } : undefined,
    };
  }
}