export const STATE_CODES: Record<string, string> = {
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '07': 'Delhi',
  '29': 'Karnataka',
  '09': 'Uttar Pradesh',
  '19': 'West Bengal',
  '33': 'Tamil Nadu',
  '08': 'Rajasthan',
  '23': 'Madhya Pradesh',
  '06': 'Haryana',
  '03': 'Punjab',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

export const DEFAULT_STATE_CODE = '24'; // Gujarat

export const isIntraState = (buyerStateCode: string, sellerStateCode: string = DEFAULT_STATE_CODE): boolean => {
  return buyerStateCode.trim() === sellerStateCode.trim();
};

export const calculateItemGst = (
  qty: number,
  rate: number,
  gstRate: number,
  buyerStateCode: string,
  sellerStateCode: string = DEFAULT_STATE_CODE
) => {
  const taxableValue = Math.round(qty * rate * 100) / 100;
  const intra = isIntraState(buyerStateCode, sellerStateCode);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (intra) {
    const halfRate = gstRate / 2;
    cgstAmount = Math.round(((taxableValue * halfRate) / 100) * 100) / 100;
    sgstAmount = Math.round(((taxableValue * halfRate) / 100) * 100) / 100;
  } else {
    igstAmount = Math.round(((taxableValue * gstRate) / 100) * 100) / 100;
  }

  const totalAmount = taxableValue + cgstAmount + sgstAmount + igstAmount;

  return {
    taxableValue,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};
