"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs = require("dayjs");
function rnd(num) {
    return Math.round(num * 100) / 100;
}
var AdditionalFeesDenominator;
(function (AdditionalFeesDenominator) {
    AdditionalFeesDenominator["amount"] = "amount";
    AdditionalFeesDenominator["capital"] = "capital";
    AdditionalFeesDenominator["interest"] = "interest";
    AdditionalFeesDenominator["sum"] = "sum";
    AdditionalFeesDenominator["remain"] = "remain";
})(AdditionalFeesDenominator || (AdditionalFeesDenominator = {}));
function DeductExpenseCalc(expense, params) {
    return expense.reduce((sum, expenseItem) => {
        const { fees, denominator } = expenseItem;
        if (typeof fees === 'number') {
            expenseItem.amount = fees;
            return sum + fees;
        }
        if (fees.substr(-1) === '%' && denominator) {
            const percent = +fees.substr(0, fees.length - 1) / 100;
            expenseItem.amount = params[denominator] * percent;
            return sum + expenseItem.amount;
        }
        expenseItem.amount = 0;
        return sum;
    }, 0);
}
const defaultParams = {
    firstRepaymentDate: undefined,
    paymentDate: undefined,
    repayments: [],
    paymentExpensesOnce: [],
    paymentMonthlyExpense: [],
    interestPeriod: 'm',
    yearInterestDays: 360,
    realInstallmentsNumber: undefined,
    laterCapital: false,
    capitalDiminishing: true,
    interestDiminishing: false,
};
class InstallmentCalculator {
    static installmentRepayment(repayment) {
    }
    static installment(amount, installmentsNumber, interestRate, params = {}) {
        if (!amount ||
            amount <= 0 ||
            !installmentsNumber ||
            installmentsNumber <= 0 ||
            !interestRate ||
            interestRate <= 0) {
            throw new Error(`wrong parameters: ${amount} ${installmentsNumber} ${interestRate}`);
        }
        const dateFormat = 'YYYY-MM-DD';
        params = Object.assign(Object.assign({}, defaultParams), params);
        if (!params.paymentDate) {
            params.paymentDate = params.firstRepaymentDate
                ? dayjs(params.firstRepaymentDate)
                    .subtract(1, 'month')
                    .format(dateFormat)
                : dayjs().format(dateFormat);
        }
        if (!params.firstRepaymentDate) {
            params.firstRepaymentDate = dayjs(params.paymentDate)
                .add(1, 'month')
                .format(dateFormat);
        }
        const paymentDate = dayjs(params.paymentDate);
        const firstRepaymentDate = dayjs(params.firstRepaymentDate);
        const { paymentExpensesOnce } = params;
        const additionalExpense = DeductExpenseCalc(paymentExpensesOnce, {
            amount,
            capital: amount,
            interest: 0,
            sum: amount,
            remain: amount,
        });
        const installments = [];
        let interestSum = 0;
        let capitalSum = 0;
        let sum = 0;
        const d = firstRepaymentDate.diff(paymentDate, 'month');
        const days = firstRepaymentDate.diff(paymentDate, 'days');
        const repayment = params.repayments.reduce((sum, repaymentItem) => sum + repaymentItem.amount, 0);
        console.log('d', d, days, repayment, true);
        for (let i = 0; i < installmentsNumber; i++) {
            let capital;
            let interest;
            let installment;
            let irmPow;
            const repaymentDate = firstRepaymentDate.add(i, 'month');
            const interestRateMonth = interestRate / 1200;
            if (params.capitalDiminishing) {
                capital = params.laterCapital ? 0 : rnd(amount / installmentsNumber);
                interest = rnd((amount - capitalSum) * interestRateMonth);
                installment = capital + interest;
            }
            else if (params.interestDiminishing) {
                irmPow = Math.pow(1 + interestRateMonth, installmentsNumber);
                installment = rnd(amount * ((interestRateMonth * irmPow) / (irmPow - 1)));
                interest = rnd((amount - capitalSum) * interestRateMonth);
                capital = params.laterCapital ? 0 : rnd(installment - interest);
            }
            else {
                capital = params.laterCapital ? 0 : rnd(amount / installmentsNumber);
                interest = rnd((amount * interestRate) / 100 / installmentsNumber);
                installment = capital + interest;
            }
            const inst = {
                period: i + 1,
                date: repaymentDate.format(dateFormat),
                capital: capital,
                interest: interest,
                installment: rnd(installment),
                remain: rnd(amount - capitalSum - capital),
                interestSum: rnd(interestSum + interest),
            };
            sum += inst.installment;
            capitalSum += inst.capital;
            interestSum += inst.interest;
            if (i === installmentsNumber - 1) {
                capitalSum += inst.remain;
                sum += inst.remain;
                inst.remain = 0;
            }
            installments.push(inst);
        }
        return {
            installments: installments,
            amount: rnd(amount),
            paymentExpensesOnce,
            interestSum: rnd(interestSum),
            capitalSum: rnd(capitalSum),
            additionalExpense,
            capitalDeductSum: rnd(capitalSum) - additionalExpense,
            sum: rnd(sum),
        };
    }
}
exports.default = InstallmentCalculator;
