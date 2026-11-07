/**
 * Converts a number to Indian Currency Words format
 * e.g., 4436758 -> "FORTY FOUR LAKH THIRTY SIX THOUSAND SEVEN HUNDRED FIFTY EIGHT RS. ONLY"
 */

const units = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertLessThanThousand(n: number): string {
  let result = '';
  if (n >= 100) {
    result += units[Math.floor(n / 100)] + ' HUNDRED ';
    n %= 100;
  }
  if (n >= 20) {
    result += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    result += units[n] + ' ';
  }
  return result.trim();
}

export function numberToIndianCurrencyWords(num: number): string {
  if (num === 0) return 'ZERO RS. ONLY';
  if (!num || isNaN(num)) return '';

  const rounded = Math.round(Math.abs(num));
  let n = rounded;
  let words = '';

  // Crores (1,00,00,000)
  const crores = Math.floor(n / 10000000);
  if (crores > 0) {
    words += convertLessThanThousand(crores) + ' CRORE ';
    n %= 10000000;
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(n / 100000);
  if (lakhs > 0) {
    words += convertLessThanThousand(lakhs) + ' LAKH ';
    n %= 100000;
  }

  // Thousands (1,000)
  const thousands = Math.floor(n / 1000);
  if (thousands > 0) {
    words += convertLessThanThousand(thousands) + ' THOUSAND ';
    n %= 1000;
  }

  // Remaining hundreds, tens, units
  if (n > 0) {
    words += convertLessThanThousand(n) + ' ';
  }

  const cleanWords = words.trim().replace(/\s+/g, ' ');
  return `RS:- ${cleanWords} RS. ONLY`;
}

export function formatIndianNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatIndianInteger(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-IN');
}
