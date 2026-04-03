exports.formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₱${num.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

exports.toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
};