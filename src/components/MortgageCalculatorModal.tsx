import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  PieChart, 
  IndianRupee, 
  DollarSign, 
  HelpCircle, 
  TrendingUp 
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { formatPrice, formatExactPrice, calculateEMI, convertToINR, convertFromINR, CURRENCY_CONFIGS } from '../utils/currency';

interface MortgageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  initialPriceINR?: number;
}

export const MortgageCalculatorModal: React.FC<MortgageCalculatorModalProps> = ({
  isOpen,
  onClose,
  currency,
  initialPriceINR = 30000000, // ₹3.0 Cr default
}) => {
  if (!isOpen) return null;

  const [propertyPriceINR, setPropertyPriceINR] = useState(initialPriceINR);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  // Math
  const downPaymentINR = (propertyPriceINR * downPaymentPct) / 100;
  const loanPrincipalINR = propertyPriceINR - downPaymentINR;
  const monthlyEMIINR = calculateEMI(loanPrincipalINR, interestRatePct, tenureYears);
  const totalPaymentINR = monthlyEMIINR * tenureYears * 12;
  const totalInterestINR = Math.max(0, totalPaymentINR - loanPrincipalINR);
  const interestPercentage = Math.round((totalInterestINR / (totalPaymentINR || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FCFAF7] border border-[#E5E1DA] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl text-[#1A1A1A] p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E1DA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E5E1DA] flex items-center justify-center text-[#8C7A65]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold text-[#8C7A65]">Financial Modeling</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">Mortgage & EMI Estimator</h3>
              <p className="text-xs font-sans text-[#736B63]">
                Amortization calculation for Indian and foreign international real estate
              </p>
            </div>
          </div>

          <button
            id="btn-close-mortgage-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-[#F4F0EA] border border-[#E5E1DA] text-[#736B63] hover:text-[#1A1A1A] transition shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Result Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs text-center space-y-2">
          <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#8C7A65]">
            Estimated Monthly Installment (EMI)
          </span>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
            {formatPrice(monthlyEMIINR, currency)}
            <span className="text-xs font-sans font-normal text-[#736B63]"> / month</span>
          </div>
          <p className="text-xs font-sans text-[#736B63]">
            Principal: {formatPrice(loanPrincipalINR, currency)} • Down Payment ({downPaymentPct}%): {formatPrice(downPaymentINR, currency)}
          </p>
        </div>

        {/* Sliders and Controls */}
        <div className="space-y-5">
          
          {/* Property Price Input / Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans font-semibold">
              <span className="text-[#1A1A1A]">Acquisition Valuation</span>
              <span className="font-serif font-bold text-[#1A1A1A] text-sm">{formatPrice(propertyPriceINR, currency)}</span>
            </div>
            <input
              type="range"
              min="2000000"
              max="500000000"
              step="1000000"
              value={propertyPriceINR}
              onChange={(e) => setPropertyPriceINR(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E5E1DA] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
            />
            <div className="flex justify-between text-[10px] font-sans text-[#736B63]">
              <span>₹20 Lakh ($23K)</span>
              <span>₹25 Cr ($2.9M)</span>
              <span>₹50 Cr ($5.8M)</span>
            </div>
          </div>

          {/* Down Payment % */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans font-semibold">
              <span className="text-[#1A1A1A]">Initial Equity / Down Payment ({downPaymentPct}%)</span>
              <span className="font-serif font-bold text-[#8C7A65] text-sm">{formatPrice(downPaymentINR, currency)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E5E1DA] rounded-lg appearance-none cursor-pointer accent-[#8C7A65]"
            />
            <div className="flex justify-between text-[10px] font-sans text-[#736B63]">
              <span>10% (Min)</span>
              <span>20% (Standard)</span>
              <span>80% (Max)</span>
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans font-semibold">
                <span className="text-[#1A1A1A]">Interest Rate (% p.a.)</span>
                <span className="font-serif font-bold text-[#1A1A1A] text-sm">{interestRatePct}%</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="14.0"
                step="0.1"
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E5E1DA] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
              />
              <div className="flex justify-between text-[10px] font-sans text-[#736B63]">
                <span>4.0% (Overseas)</span>
                <span>8.5% (India Avg)</span>
                <span>14.0%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans font-semibold">
                <span className="text-[#1A1A1A]">Amortization Tenure ({tenureYears} Years)</span>
                <span className="font-serif font-bold text-[#1A1A1A] text-sm">{tenureYears * 12} Months</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E5E1DA] rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
              />
              <div className="flex justify-between text-[10px] font-sans text-[#736B63]">
                <span>5 Years</span>
                <span>20 Years</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>

        </div>

        {/* Financial Breakdown Table */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-[#E5E1DA] text-center text-xs font-sans">
          <div>
            <span className="text-[#736B63] block mb-0.5">Loan Principal</span>
            <strong className="text-[#1A1A1A] font-serif font-bold">{formatPrice(loanPrincipalINR, currency)}</strong>
          </div>
          <div>
            <span className="text-[#736B63] block mb-0.5">Total Interest</span>
            <strong className="text-[#8C7A65] font-serif font-bold">{formatPrice(totalInterestINR, currency)}</strong>
          </div>
          <div>
            <span className="text-[#736B63] block mb-0.5">Total Outlay</span>
            <strong className="text-[#1A1A1A] font-serif font-bold">{formatPrice(totalPaymentINR, currency)}</strong>
          </div>
        </div>

        {/* Progress Bar of Principal vs Interest */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-sans text-[#736B63]">
            <span>Principal: {100 - interestPercentage}%</span>
            <span>Interest: {interestPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#E5E1DA] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${100 - interestPercentage}%` }}
              className="bg-[#1A1A1A] transition-all duration-300"
              title="Principal Amount"
            />
            <div
              style={{ width: `${interestPercentage}%` }}
              className="bg-[#C4A484] transition-all duration-300"
              title="Interest Amount"
            />
          </div>
        </div>

        {/* Close CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-sans font-bold uppercase tracking-wider shadow transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
