//
// console.log(
//   InstallmentCalculator.installment(2.5e4, 24, 21.24, {
//     paymentDate: '2020-08-07',
//     capitalDiminishing: false,
//     interestDiminishing: true,
//     repayments: [
//       { date: '2020-09-07', amount: 1287.59 },
//       { date: '2020-10-07', amount: 1287.59 },
//       { date: '2020-11-07', amount: 1287.59 },
//       { date: '2020-12-23', amount: 891 },
//       { date: '2020-12-25', amount: 414.83 },
//       { date: '2021-01-08', amount: 1287.59 },
//       { date: '2021-02-08', amount: 10 },
//       { date: '2021-05-21', amount: 500 },
//     ],
//   }),
// );
// console.log(
//   InstallmentCalculator.installment(4300, 12, 15.36, {
//     firstRepaymentDate: '2020-12-6',
//     capitalDiminishing: false,
//     interestDiminishing: false,
//   }),
// );
// 3e4 月还款 2836.00 156.48
// 3e4 月还款 4726.67 260.81
// console.log(
//   InstallmentCalculator.installment(3e4, 12, 13, {
//     firstRepaymentDate: '2020-10-6',
//     paymentDate: '2020-09-01',
//     paymentExpensesOnce: [
//       { name: '服务费', fees: '3%', denominator: 'capital' },
//     ],
//     paymentMonthlyExpense: [{ name: '服务费', fees: 156.48 }],
//     capitalDiminishing: false,
//     interestDiminishing: true,
//   }),
// );
// console.log(
//   InstallmentCalculator.installment(5e4, 12, 13, {
//     firstRepaymentDate: '2020-10-6',
//     paymentDate: '2020-09-01',
//     paymentExpensesOnce: [
//       { name: '服务费', fees: '3%', denominator: 'capital' },
//     ],
//     paymentMonthlyExpense: [{ name: '服务费', fees: 260.81 }],
//     capitalDiminishing: false,
//     interestDiminishing: true,
//   }),
// );
