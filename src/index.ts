import * as dayjs from 'dayjs';

function rnd(num: number) {
  return Math.round(num * 100) / 100;
}

interface Installment {
  period: number;
  date: string;
  capital: number;
  interest: number;
  installment: number;
  remain: number;
  interestSum: number;
}

enum AdditionalFeesDenominator {
  amount = 'amount',
  capital = 'capital',
  interest = 'interest',
  sum = 'sum',
  remain = 'remain',
}

function DeductExpenseCalc(
  expense: AdditionalFees[],
  params: {
    amount: number;
    capital: number;
    interest: number;
    sum: number;
    remain: number;
  },
) {
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

interface CostFactor {
  // 数字或百分比
  fees: number | string;
  denominator?:
    | keyof typeof AdditionalFeesDenominator
    | AdditionalFeesDenominator;
}

// 附加费
interface AdditionalFees extends CostFactor {
  name: string;
  amount?: number;
}

interface RepaymentItem {
  // 还款日期
  date: Date | string;
  // 还款金额
  amount: number;
  // 是否提前还款
  prepayment?: boolean;
  prepaymentServiceCharge?: CostFactor;
}

interface RateCalcParams {
  // 开始日期
  firstRepaymentDate?: Date | string;
  // 分期付款支付日期,默认等于第一次还款日的上一页
  repayments?: RepaymentItem[];
  // 如不相同则会按天计算第一期的费用
  paymentDate?: Date | string;
  // 支付时一次性扣除的费用
  paymentExpensesOnce?: AdditionalFees[];
  paymentMonthlyExpense?: AdditionalFees[];
  // 计息周期，日|月
  interestPeriod?: 'd' | 'm';
  // 年计息天数，默认360
  yearInterestDays?: number;
  // 实际分期次数
  realInstallmentsNumber?: number;
  // 最后归还本金 principal 本金最后 后还
  laterCapital?: boolean;
  // 本金递减
  capitalDiminishing?: boolean;
  // 利息递减
  interestDiminishing?: boolean;
}

const defaultParams: RateCalcParams = {
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
  // 分期还款
  static installmentRepayment(repayment: RepaymentItem[]) {
    //
  }

  /**
   * Create Loan Object with all installments and sum of interest
   *
   * @param {number} amount                   full amount of Loan
   * @param {number} installmentsNumber       how many installments will be
   * @param {number} interestRate             interest rate in percent (3.5) equal/annuity (false)
   * @param {boolean} diminishing             if installments will be diminishing (true) or not
   *
   * @return {object}
   */
  static installment(
    // 贷款总额
    amount: number,
    // 分期付款将有多少（几个月后）
    installmentsNumber: number,
    // 分期付款年利率 百分比（前3.5）
    interestRate: number,
    params: RateCalcParams = {},
  ) {
    /** Checking params */
    if (
      !amount ||
      amount <= 0 ||
      !installmentsNumber ||
      installmentsNumber <= 0 ||
      !interestRate ||
      interestRate <= 0
    ) {
      throw new Error(
        `wrong parameters: ${amount} ${installmentsNumber} ${interestRate}`,
      );
    }
    const dateFormat = 'YYYY-MM-DD';
    params = { ...defaultParams, ...params };
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
    // 计算一次性费用 AdditionalFees
    const { paymentExpensesOnce } = params;
    const additionalExpense = DeductExpenseCalc(paymentExpensesOnce, {
      amount,
      capital: amount,
      interest: 0,
      sum: amount,
      remain: amount,
    });
    const installments: Installment[] = [];
    let interestSum = 0;
    let capitalSum = 0;
    let sum = 0;
    const d = firstRepaymentDate.diff(paymentDate, 'month');
    const days = firstRepaymentDate.diff(paymentDate, 'days');
    const repayment = params.repayments.reduce(
      (sum, repaymentItem) => sum + repaymentItem.amount,
      0,
    );
    console.log('d', d, days, repayment, true);
    for (let i = 0; i < installmentsNumber; i++) {
      let capital;
      let interest;
      let installment;
      let irmPow;
      const repaymentDate = firstRepaymentDate.add(i, 'month');
      const interestRateMonth = interestRate / 1200;
      if (params.capitalDiminishing) {
        // 等额本金 本金递减,等额本金
        capital = params.laterCapital ? 0 : rnd(amount / installmentsNumber);
        interest = rnd((amount - capitalSum) * interestRateMonth);
        installment = capital + interest;
      } else if (params.interestDiminishing) {
        // 等额本息 利息递减
        irmPow = Math.pow(1 + interestRateMonth, installmentsNumber);
        installment = rnd(
          amount * ((interestRateMonth * irmPow) / (irmPow - 1)),
        );
        interest = rnd((amount - capitalSum) * interestRateMonth);
        capital = params.laterCapital ? 0 : rnd(installment - interest);
      } else {
        // 等本等息
        capital = params.laterCapital ? 0 : rnd(amount / installmentsNumber);
        interest = rnd((amount * interestRate) / 100 / installmentsNumber);
        installment = capital + interest;
      }
      const inst: Installment = {
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
      /** adding lost sum on rounding */
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

