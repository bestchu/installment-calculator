interface Installment {
    period: number;
    date: string;
    capital: number;
    interest: number;
    installment: number;
    remain: number;
    interestSum: number;
}
declare enum AdditionalFeesDenominator {
    amount = "amount",
    capital = "capital",
    interest = "interest",
    sum = "sum",
    remain = "remain"
}
interface CostFactor {
    fees: number | string;
    denominator?: keyof typeof AdditionalFeesDenominator | AdditionalFeesDenominator;
}
interface AdditionalFees extends CostFactor {
    name: string;
    amount?: number;
}
interface RepaymentItem {
    date: Date | string;
    amount: number;
    prepayment?: boolean;
    prepaymentServiceCharge?: CostFactor;
}
interface RateCalcParams {
    firstRepaymentDate?: Date | string;
    repayments?: RepaymentItem[];
    paymentDate?: Date | string;
    paymentExpensesOnce?: AdditionalFees[];
    paymentMonthlyExpense?: AdditionalFees[];
    interestPeriod?: 'd' | 'm';
    yearInterestDays?: number;
    realInstallmentsNumber?: number;
    laterCapital?: boolean;
    capitalDiminishing?: boolean;
    interestDiminishing?: boolean;
}
declare class InstallmentCalculator {
    static installmentRepayment(repayment: RepaymentItem[]): void;
    static installment(amount: number, installmentsNumber: number, interestRate: number, params?: RateCalcParams): {
        installments: Installment[];
        amount: number;
        paymentExpensesOnce: AdditionalFees[];
        interestSum: number;
        capitalSum: number;
        additionalExpense: number;
        capitalDeductSum: number;
        sum: number;
    };
}
export default InstallmentCalculator;
