import { DCCRecord } from '../types';
import { calculateEnglishTotals, calculateGujaratiTotals, getNextDayDateString } from './defaultData';
import { numberToIndianCurrencyWords, formatIndianInteger, formatIndianNumber } from './numberToWords';
import { GSRTC_LOGO_BASE64 } from './logoBase64';

export type PrintMode = 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination' | 'all';

export function generatePrintableHtml(record: DCCRecord, mode: PrintMode): string {
  const engTotals = calculateEnglishTotals(record);
  const gujTotals = calculateGujaratiTotals(record);
  const holidayDrmAmount = Number(record.drmSlip?.drm) || 0;
  const g12Amt = Number(record.g12Amount) || 0;
  const todayCash = Number(record.ruralIncome) || 0;
  const ccDepAmt = Number(record.drmSlip?.ccDeposit ?? record.ccAmount) || 0;
  const diwaliExtAmt = Number(record.drmSlip?.diwaliExt ?? record.diwaliExtra) || 0;
  const ccRefAmt = Number(record.drmSlip?.ccRefund) || 0;
  const drmTotalAmount = todayCash + holidayDrmAmount + (record.urbanIncome || 0) + g12Amt + ccDepAmt + diwaliExtAmt - ccRefAmt;
  const words = numberToIndianCurrencyWords(drmTotalAmount || record.drmSlip.total || record.ruralIncome);

  const sharedStyles = `
    @page {
      size: A4 portrait;
      margin: 4mm 8mm 4mm 4mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Noto Sans Gujarati', 'Shruti', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      color: #000000;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.25;
    }
    .page {
      width: 100%;
      max-width: 196mm;
      min-height: 288mm;
      margin: 0 auto;
      border: 1.5px solid #000000;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border: 1.25px solid #000000;
      padding: 5px 6px;
      word-wrap: break-word;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-amber-50 { background-color: #fef3c7 !important; }
    .print-controls {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-family: sans-serif;
    }
    @media print {
      .print-controls { display: none !important; }
      html, body {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .page {
        border: 2px solid #000000 !important;
        margin: 0 2mm 0 0 !important;
        width: calc(100% - 2mm) !important;
        max-width: calc(100% - 2mm) !important;
        min-height: 98vh !important;
        height: 98vh !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .page.drm-page-clean {
        border: none !important;
      }
    }
  `;

  // 1. English DCC Sheet
  const englishHtml = `
    <div class="page ${mode === 'all' ? 'page-break' : ''}">
      <div style="border-bottom: 2px solid #000; padding: 12px 14px; text-align: center; background: #fff;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
          <img src="${GSRTC_LOGO_BASE64}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: contain; border: 2px solid #000; padding: 2px; background: #fff; flex-shrink: 0;" alt="GSRTC Logo" />
          <div>
            <h2 style="margin: 0; font-size: 21px; font-weight: 900; text-transform: uppercase;">Gujarat State Road Transport Corporation</h2>
            <div style="display: flex; justify-content: space-around; font-size: 13.5px; font-weight: 800; margin-top: 5px; border-top: 1.5px solid #000; padding-top: 4px; text-transform: uppercase;">
              <span>${record.division}</span>
              <span>${record.depot}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="border-bottom: 2px solid #000; background: #e5e7eb; padding: 6px; text-align: center; font-weight: 900; font-size: 14.5px; text-transform: uppercase;">
        DAILY CASH COLLECTION SUMMARY
      </div>
      <div style="border-bottom: 2px solid #000; display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; font-weight: bold; font-size: 13px;">
        <span>Collection For the Date : <span class="font-mono" style="font-size: 15.5px; font-weight: 900; text-decoration: underline;">${record.date}</span></span>
        <span>Report Generated Time : ${record.reportGeneratedTime || '11/07/2026 01:44:42 am'}</span>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000; flex: 1;">
        <div style="min-width: 0; border-right: 2px solid #000; display: flex;">
          <table style="height: 100%;">
            <thead>
              <tr class="bg-gray-200" style="height: 30px;">
                <th class="text-left" style="width: 70%;">REVENUE</th>
                <th class="text-right">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${record.revenueItems.map((item, i) => `
                <tr>
                  <td>${i + 1}. ${item.titleEn}</td>
                  <td class="text-right font-mono font-bold">${formatIndianNumber(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="min-width: 0; display: flex;">
          <table style="height: 100%;">
            <thead>
              <tr class="bg-gray-200" style="height: 30px;">
                <th class="text-left" style="width: 70%;">DEDUCTIONS</th>
                <th class="text-right" style="padding-right: 10px;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${record.deductionItems.map((item, i) => `
                <tr>
                  <td>${i + 1}. ${item.titleEn}</td>
                  <td class="text-right font-mono font-bold" style="padding-right: 10px;">${formatIndianNumber(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000; font-weight: bold;">
        <div style="min-width: 0; border-right: 2px solid #000;">
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #000; background: #f3f4f6;">
            <span>Total Revenue</span>
            <span class="font-mono">${formatIndianNumber(engTotals.totalRevenue)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #000;">
            <span>Total Deduction</span>
            <span class="font-mono">${formatIndianNumber(engTotals.totalDeductions)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 8px; background: #fef3c7;">
            <span>Total Cash To Be Deposited</span>
            <span class="font-mono font-bold" style="color: #991b1b; font-size: 13px;">${formatIndianNumber(engTotals.totalCashDeposited)}</span>
          </div>
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; justify-content: space-between; padding: 4px 10px 4px 8px; border-bottom: 1px solid #000; background: #f3f4f6;">
            <span>Total Deduction</span>
            <span class="font-mono">${formatIndianNumber(engTotals.totalDeductions)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 5px 10px 5px 8px;">
            <span>Advance Booking Amount</span>
            <span class="font-mono">${formatIndianNumber(record.advanceBookingAmount || 0)}</span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000;">
        <div style="min-width: 0; border-right: 2px solid #000;">
          <div class="bg-gray-200 font-bold text-center" style="padding: 3px; border-bottom: 1px solid #000;">
            STATE WISE INCOME SUMMARY
          </div>
          <table>
            ${record.stateWiseIncomes.map(item => `
              <tr>
                <td>${item.state}</td>
                <td class="text-right font-mono font-bold">${formatIndianNumber(item.amount)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="min-width: 0;">
          <div class="bg-gray-200 font-bold text-center" style="padding: 3px; border-bottom: 1px solid #000;">
            GST DETAILS
          </div>
          <table>
            <tr><td>1) Collected Cash GST</td><td class="text-right font-mono font-bold" style="padding-right: 10px;">${formatIndianNumber(record.gstDetails.collectedCash)}</td></tr>
            <tr><td>2) Uncollected Cash GST</td><td class="text-right font-mono font-bold" style="padding-right: 10px;">${formatIndianNumber(record.gstDetails.uncollectedCash)}</td></tr>
            <tr><td>3) Collected Digital GST</td><td class="text-right font-mono font-bold" style="padding-right: 10px;">${formatIndianNumber(record.gstDetails.collectedDigital)}</td></tr>
            <tr><td>4) Uncollected Digital GST</td><td class="text-right font-mono font-bold" style="padding-right: 10px;">${formatIndianNumber(record.gstDetails.uncollectedDigital)}</td></tr>
          </table>
        </div>
      </div>

      <div style="padding: 16px 12px 6px 12px; display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-weight: bold;">
        <div>
          <div style="height: 25px;"></div>
          <div style="border-top: 1px dashed #000; padding-top: 3px;">
            <p style="margin: 0;">ટ્રાફિક સુપરવાઈઝર</p>
            <p style="margin: 0; font-size: 10px; color: #475569;">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
        <div>
          <div style="height: 25px;"></div>
          <div style="border-top: 1px dashed #000; padding-top: 3px;">
            <p style="margin: 0;">સિનિ. ડેપો મેનેજર 'એ'</p>
            <p style="margin: 0; font-size: 10px; color: #475569;">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>
      <div style="padding: 3px 8px; font-size: 9px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0;">
        <span>Gujarat State Road Transport Corporation</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;

  // 2. Gujarati Traditional Sheet
  const gujaratiHtml = `
    <div class="page ${mode === 'all' ? 'page-break' : ''}">
      <div style="border-bottom: 2px solid #000; padding: 10px 14px; text-align: center; background: #fff;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
          <img src="${GSRTC_LOGO_BASE64}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: contain; border: 2px solid #000; padding: 2px; background: #fff; flex-shrink: 0;" alt="GSRTC Logo" />
          <div style="flex: 1; max-width: 670px;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #000;">
              ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ
            </h2>
            <h3 style="margin: 3px 0 0 0; font-size: 16.5px; font-weight: 800; color: #000;">
              ડી.સી.સી. સમરી સુરત સીટી
            </h3>
            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 13.5px; margin-top: 6px; padding: 0 4px;">
              <span>સુરત વિભાગ • સુરત સીટી ડેપો-૨</span>
              <span>તારીખ: <span class="font-mono" style="font-size: 16px; font-weight: 900; text-decoration: underline;">${record.date}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000; flex: 1;">
        <div style="min-width: 0; border-right: 2px solid #000; display: flex; flex-direction: column; justify-content: space-between;">
          <table style="flex: 1; height: 100%;">
            <thead>
              <tr class="bg-gray-200" style="font-size: 12px; height: 28px;">
                <th style="width: 26px; padding: 5px 2px;">ક્રમ</th>
                <th style="width: 54px; padding: 5px 2px;">હેડ નં.</th>
                <th style="padding: 5px 5px;">વિગત</th>
                <th style="width: 82px; padding: 5px 6px;" class="text-right">રકમ રૂ.</th>
              </tr>
            </thead>
            <tbody>
              ${record.gujaratiIncomes.map((item, i) => `
                <tr>
                  <td class="text-center font-mono" style="font-size: 12px; padding: 5px 2px;">${i + 1}</td>
                  <td class="text-center font-mono font-bold" style="font-size: 12.5px; padding: 5px 2px;">${item.headNo || '-'}</td>
                  <td style="font-size: 12.5px; font-weight: 600; padding: 5px 5px;">${item.titleGu}</td>
                  <td class="text-right font-mono font-bold" style="font-size: 13px; padding: 5px 6px;">${item.amount > 0 ? formatIndianInteger(item.amount) : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display: flex; justify-content: space-between; padding: 7px 10px; background: #e5e7eb; border-top: 2px solid #000; font-weight: 900; font-size: 13.5px;">
            <span>અ. કુલ આવક (અ)</span>
            <span class="font-mono" style="font-size: 15px;">${formatIndianInteger(gujTotals.totalA)}</span>
          </div>
        </div>

        <div style="min-width: 0; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <table>
                <thead>
                  <tr class="bg-gray-200" style="font-size: 12px; height: 28px;">
                    <th style="width: 26px; padding: 5px 2px;">ક્રમ</th>
                    <th style="width: 54px; padding: 5px 2px;">હેડ નં.</th>
                    <th style="padding: 5px 5px;">વિગત</th>
                    <th style="width: 82px; padding: 5px 10px 5px 5px;" class="text-right">રકમ રૂ.</th>
                  </tr>
                </thead>
                <tbody>
                  ${record.gujaratiDeductions.map((item, i) => `
                    <tr style="height: 33px;">
                      <td class="text-center font-mono" style="font-size: 12px; padding: 5.5px 2px;">${i + 1}</td>
                      <td class="text-center font-mono font-bold" style="font-size: 12.5px; padding: 5.5px 2px;">${item.headNo || '-'}</td>
                      <td style="font-size: 12.5px; font-weight: 600; padding: 5.5px 5px;">${item.titleGu}</td>
                      <td class="text-right font-mono font-bold" style="font-size: 13px; padding: 5.5px 10px 5.5px 5px;">${item.amount > 0 ? formatIndianInteger(item.amount) : '0'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="display: flex; justify-content: space-between; padding: 6px 10px 6px 8px; background: #f3f4f6; border-top: 1px solid #000; border-bottom: 2px solid #000; font-weight: bold; font-size: 13.5px;">
                <span>બ. કુલ કપાત (બ)</span>
                <span class="font-mono" style="font-size: 14.5px;">${formatIndianInteger(gujTotals.totalB)}</span>
              </div>
            </div>

            <div style="border-bottom: 2px solid #000;">
              <div class="bg-gray-100 font-bold" style="padding: 5px 8px; font-size: 12.5px; border-bottom: 1px solid #000;">અન્ય આવક (Other Income)</div>
              <table>
                ${record.gujaratiOtherIncomes.map((item, i) => `
                  <tr style="height: 32px;">
                    <td class="text-center font-mono" style="width: 26px; font-size: 12px; padding: 6px 2px;">${i + 1}</td>
                    <td class="text-center font-mono font-bold" style="width: 54px; font-size: 12.5px; padding: 6px 2px;">${item.headNo || '-'}</td>
                    <td style="font-size: 12.5px; font-weight: 600; padding: 6px 5px;">${item.titleGu}</td>
                    <td class="text-right font-mono font-bold" style="width: 82px; font-size: 13px; padding: 6px 10px 6px 5px;">${item.amount || '0'}</td>
                  </tr>
                `).join('')}
              </table>
              <div style="display: flex; justify-content: space-between; padding: 6px 10px 6px 8px; background: #f3f4f6; font-weight: bold; font-size: 13px; border-top: 1px solid #000;">
                <span>ક. કુલ અન્ય આવક (ક)</span>
                <span class="font-mono" style="font-size: 14px;">${formatIndianInteger(gujTotals.totalC)}</span>
              </div>
            </div>

            <div style="padding: 12px 12px; background: #fef3c7; border-bottom: 2px solid #000;">
              <div style="font-weight: 800; font-size: 12.5px; line-height: 1.35;">બેંકમાં જમાં કરાવેલ ડી.સી.સી. તથા ડી.આર.એમ. ની આવક (અ - બ + ક)</div>
              <div style="text-align: right; font-size: 23px; font-weight: 900; color: #991b1b; margin-top: 3px;" class="font-mono">
                ₹ ${formatIndianInteger(gujTotals.netBankRemittance)}
              </div>
            </div>
          </div>

          <div style="padding: 10px 12px;">
            <div style="border: 2px solid #000; border-radius: 6px; padding: 10px 14px; max-width: 290px; width: 100%; margin-left: auto; background: #f9fafb; font-size: 12.5px; line-height: 1.6;">
              <div style="text-align: center; font-weight: bold; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 5px; font-size: 13px;">
                ડી.આર.એમ. સ્લિપ તાળો (DRM Slip)
              </div>
              <div style="display: flex; justify-content: space-between;"><span>P.O.S</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.pos)}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>DRM</span><span class="font-mono font-bold">${record.drmSlip.drm ? formatIndianInteger(record.drmSlip.drm) : ''}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>G12</span><span class="font-mono font-bold">${record.drmSlip.g12 || 0}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>CC DIPODIT</span><span class="font-mono font-bold">${record.drmSlip.ccDeposit || 0}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>DIWALI EXT</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.diwaliExt || 0)}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>CC REFUND</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.ccRefund || 0)}</span></div>
              <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #000; margin-top: 5px; padding-top: 4px; font-weight: bold; color: #991b1b; font-size: 13px;">
                <span>TOTAL</span><span class="font-mono">${formatIndianInteger(record.drmSlip.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 16px 14px 10px 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; font-weight: bold; font-size: 11.5px;">
        <div>
          <div style="height: 36px;"></div>
          <div style="border-top: 1px dashed #000; padding-top: 4px;">
            <p style="margin: 0;">કેશીયર</p>
            <p style="margin: 0; font-size: 10px; color: #475569;">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>
        </div>
        <div>
          <div style="height: 36px;"></div>
          <div style="border-top: 1px dashed #000; padding-top: 4px;">
            <p style="margin: 0;">ટ્રાફિક સુપરવાઈઝર</p>
            <p style="margin: 0; font-size: 10px; color: #475569;">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>
        </div>
        <div>
          <div style="height: 36px;"></div>
          <div style="border-top: 1px dashed #000; padding-top: 4px;">
            <p style="margin: 0;">સિનિ. ડેપો મેનેજર 'એ'</p>
            <p style="margin: 0; font-size: 10px; color: #475569;">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // 3. DRM Memo SBI Sheet (Word Form A508 Layout)
  const drmWordsText = words.startsWith('RS:-') ? words : `RS:- ${words}`;
  const drmExtraRows: Array<{ label: string; amountText: string; isNeg?: boolean }> = [];
  if (holidayDrmAmount > 0) drmExtraRows.push({ label: 'PREVIOUS HOLIDAY DRM', amountText: `${formatIndianInteger(holidayDrmAmount)}/-` });
  if ((record.urbanIncome || 0) > 0) drmExtraRows.push({ label: 'URBAN / LOCAL INCOME', amountText: `${formatIndianInteger(record.urbanIncome)}/-` });
  if (ccDepAmt > 0) drmExtraRows.push({ label: 'CC DEPOSIT (+)', amountText: `${formatIndianInteger(ccDepAmt)}/-` });
  if (diwaliExtAmt > 0) drmExtraRows.push({ label: 'DIWALI EXTRA (+)', amountText: `${formatIndianInteger(diwaliExtAmt)}/-` });
  if (ccRefAmt > 0) drmExtraRows.push({ label: 'LESS: CC / DIWALI REFUND (-)', amountText: `- ${formatIndianInteger(ccRefAmt)}/-`, isNeg: true });
  if (g12Amt > 0 || (record.g12Number && record.g12Number.trim())) {
    drmExtraRows.push({
      label: `G-12 ${record.g12Number ? '(' + record.g12Number + ')' : ''}`.trim(),
      amountText: g12Amt > 0 ? `${formatIndianInteger(g12Amt)}/-` : '',
    });
  }
  const drmBlankThreeCol = Math.max(0, 4 - (1 + drmExtraRows.length));

  const drmHtml = `
    <div class="page drm-page-clean" style="border: none; padding: 14px 20px 12px 18px;">
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Top Logo - DAILY REVENUE MEMO - Logo Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; margin-bottom: 10px; border-bottom: 2px solid #000;">
            <img src="${GSRTC_LOGO_BASE64}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: contain; border: 2px solid #000; padding: 2px; background: #fff;" alt="GSRTC Logo" />
            <div style="flex: 1; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">
                DAILY REVENUE MEMO
              </h2>
            </div>
            <img src="${GSRTC_LOGO_BASE64}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: contain; border: 2px solid #000; padding: 2px; background: #fff;" alt="GSRTC Logo" />
          </div>

          <!-- Top Official Header -->
          <div style="font-weight: 900; font-size: 13.5px; text-transform: uppercase; letter-spacing: 0.3px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div>STATE TRANSPORT GUJARAT</div>
                <div style="padding-left: 34px; margin-top: 2px;">${record.division}</div>
              </div>
              <div style="text-align: right;">${record.depotCode}</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
              <div style="display: flex; align-items: center; gap: 18px; padding-left: 12px;">
                <span>${record.depotCityNum}</span>
                <div style="width: 175px; height: 28px; border: 1.5px solid #000; background: #fff;"></div>
              </div>
              <div style="padding-right: 22px;">
                <span>DATE- </span>
                <span class="font-mono" style="font-size: 15.5px; font-weight: 900;">${record.date}</span>
              </div>
            </div>
          </div>

          <!-- Addressed To & Remittance Text -->
          <div style="margin-top: 14px; font-weight: 900; font-size: 12.5px; text-transform: uppercase; line-height: 1.45;">
            <div style="text-align: right; padding-right: 28px; margin-bottom: 5px;">${record.auditorTitle}</div>
            <div style="padding-left: 56px;">
              THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO ${record.bankName} ON
              <span class="font-mono" style="text-decoration: underline; font-size: 14.5px; font-weight: 900;">${getNextDayDateString(record.date)}</span>
              <span style="text-decoration: underline;"> NET CASH RECEIPTS ON PASSENGER BUS SERVICE.</span> VIDE COL.
            </div>
          </div>

          <!-- Table 1: Upper Income & Total Table -->
          <table style="width: 86%; margin-top: 14px; border: 1.5px solid #000; border-collapse: collapse;">
            <colgroup>
              <col style="width: 24%;" />
              <col style="width: 40%;" />
              <col style="width: 36%;" />
            </colgroup>
            <tbody>
              <tr style="height: 32px;">
                <td style="border: 1px solid #000;"></td>
                <td style="border: 1px solid #000; font-weight: 900; font-size: 14px; padding: 6px 10px; text-transform: uppercase;">RURAL INCOME</td>
                <td style="border: 1px solid #000; text-align: center; font-weight: 900; font-size: 15px; padding: 6px 10px;" class="font-mono">${formatIndianInteger(record.ruralIncome)}/-</td>
              </tr>
              ${drmExtraRows.map(r => `
                <tr style="height: 32px;">
                  <td style="border: 1px solid #000;"></td>
                  <td style="border: 1px solid #000; font-weight: 900; font-size: 13px; padding: 5px 10px; text-transform: uppercase; ${r.isNeg ? 'color: #9f1239;' : ''}">${r.label}</td>
                  <td style="border: 1px solid #000; text-align: center; font-weight: 900; font-size: 15px; padding: 5px 10px; ${r.isNeg ? 'color: #9f1239;' : ''}" class="font-mono">${r.amountText}</td>
                </tr>
              `).join('')}
              ${Array.from({ length: drmBlankThreeCol }).map(() => `
                <tr style="height: 30px;">
                  <td style="border: 1px solid #000;"></td>
                  <td style="border: 1px solid #000;"></td>
                  <td style="border: 1px solid #000;"></td>
                </tr>
              `).join('')}
              <tr style="height: 32px;"><td colspan="2" style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td></tr>
              <tr style="height: 30px;"><td colspan="2" style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td></tr>
              <tr style="height: 30px;"><td colspan="2" style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td></tr>
              <tr style="height: 36px;">
                <td colspan="2" style="border: 1.5px solid #000; text-align: center; font-weight: 900; font-size: 16px; letter-spacing: 2px;">TOTAL</td>
                <td style="border: 1.5px solid #000; text-align: center; font-weight: 900; font-size: 16px;" class="font-mono">${formatIndianInteger(drmTotalAmount)}/-</td>
              </tr>
            </tbody>
          </table>

          <!-- RS:- Amount in Words Box -->
          <div style="border: 1.5px solid #000; margin-top: -1.5px; padding: 6px 10px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.3px;">
            ${drmWordsText}
          </div>

          <!-- Middle 2-cell stub + 6x3 endorsement grid -->
          <table style="width: 100%; border-collapse: collapse;">
            <colgroup>
              <col style="width: 24%;" />
              <col style="width: 34%;" />
              <col style="width: 18%;" />
              <col style="width: 24%;" />
            </colgroup>
            <tbody>
              <tr style="height: 32px;">
                <td colspan="2" style="border-top: none; border-left: 1.5px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
                <td style="border-top: none; border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
                <td style="border-top: none; border-right: none; border-bottom: 1px solid #000;"></td>
              </tr>
              ${[0, 1, 2, 3, 4, 5].map(() => `
                <tr style="height: 29px;">
                  <td style="border-left: 1.5px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
                  <td colspan="2" style="border-right: 1px solid #000; border-bottom: 1px solid #000;"></td>
                  <td style="border-right: 1.5px solid #000; border-bottom: 1px solid #000;"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Bottom Large Signature Box (Signatures at the very bottom) -->
        <div style="border: 1.5px solid #000; border-top: none; flex: 1; min-height: 115px; display: flex; flex-direction: column; justify-content: flex-end; padding: 40px 28px 12px 28px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; font-weight: 800; font-size: 13.5px;">
            <div>
              <div>${record.cashierName || 'કેશીયર'}</div>
              <div style="font-size: 11px; margin-top: 2px;">એસ.ટી. સુરત સીટી-૨</div>
            </div>
            <div>
              <div>${record.trafficSupervisorName || 'ટ્રાફિક સુપરવાઈઝર'}</div>
              <div style="font-size: 11px; margin-top: 2px;">એસ.ટી. સુરત સીટી-૨</div>
            </div>
            <div>
              <div>${record.seniorDepotManagerName || "સિનિ. ડેપો મેનેજર 'એ'"}</div>
              <div style="font-size: 11px; margin-top: 2px;">એસ.ટી. સુરત સીટી-૨</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let bodyContent = '';
  if (mode === 'dcc-en') bodyContent = englishHtml;
  else if (mode === 'dcc-gu') bodyContent = gujaratiHtml;
  else if (mode === 'drm') bodyContent = drmHtml;
  else if (mode === 'all') bodyContent = `${englishHtml}${gujaratiHtml}${drmHtml}`;
  else bodyContent = gujaratiHtml;

  return `
    <!DOCTYPE html>
    <html lang="gu">
    <head>
      <meta charset="UTF-8">
      <title>GSRTC Official A4 Print - ${record.date}</title>
      <style>${sharedStyles}</style>
    </head>
    <body>
      <div class="print-controls">
        <div style="font-weight: bold; font-size: 13px;">
          🚌 GSRTC સુરત સીટી ડેપો - ${record.date} (A4 Print Ready)
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="window.print()" style="background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
            🖨️ A4 પ્રિન્ટ કરો / PDF તરીકે સેવ કરો
          </button>
          <button onclick="window.close()" style="background: #334155; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            બંધ કરો
          </button>
        </div>
      </div>
      ${bodyContent}
      <script>
        // Auto open print dialog when opened as standalone
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;
}

export function downloadPrintableHtml(record: DCCRecord, mode: PrintMode): void {
  const html = generatePrintableHtml(record, mode);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeDate = (record.date || 'today').replace(/\//g, '-');
  a.download = `GSRTC_${mode.toUpperCase()}_${safeDate}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
