export default function isRefundEligible(purchaseDate) {
    const refundWindowDays = 7;
    const purchaseTime = new Date(purchaseDate).getTime();
    const currentTime = new Date().getTime();
    console.log((currentTime - purchaseTime) / (1000 * 3600 * 24), 'time');

    return (currentTime - purchaseTime) / (1000 * 3600 * 24) <= refundWindowDays;
};