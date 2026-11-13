import { DCCRecord } from '../types';
import { calculateEnglishTotals, calculateGujaratiTotals } from './defaultData';
import { numberToIndianCurrencyWords, formatIndianInteger, formatIndianNumber } from './numberToWords';
import { GSRTC_LOGO_BASE64 } from './logoBase64';

export type PrintMode = 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination' | 'all';

export function generatePrintableHtml(record: DCCRecord, mode: PrintMode): string {
  const engTotals = calculateEnglishTotals(record);
  const gujTotals = calculateGujaratiTotals(record);
  const holidayDrmAmount = Number(record.drmSlip?.drm) || 0;
  const g12Amt = Number(record.g12Amount) || 0;
  const todayCash = Number(record.ruralIncome) || 0;
  const drmTotalAmount = todayCash + holidayDrmAmount + (record.urbanIncome || 0) + g12Amt;
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
      font-size: 11.5px;
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
      border: 1px solid #000000;
      padding: 4.5px 6px;
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
      body { margin: 0 !important; }
      .page {
        border: 2px solid #000000 !important;
        margin: 0 2mm 0 0 !important;
        width: calc(100% - 2mm) !important;
        max-width: calc(100% - 2mm) !important;
        min-height: 288mm !important;
        height: 288mm !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
    }
  `;

  // 1. English DCC Sheet
  const englishHtml = `
    <div class="page ${mode === 'all' ? 'page-break' : ''}">
      <div style="border-bottom: 2px solid #000; padding: 10px 12px; text-align: center; background: #fff;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
          <img src="${GSRTC_LOGO_BASE64}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: contain; border: 1.5px solid #000; padding: 1px; background: #fff; flex-shrink: 0;" alt="GSRTC Logo" />
          <div>
            <h2 style="margin: 0; font-size: 19px; font-weight: 900; text-transform: uppercase;">Gujarat State Road Transport Corporation</h2>
            <div style="display: flex; justify-content: space-around; font-size: 12px; font-weight: bold; margin-top: 4px; text-transform: uppercase;">
              <span>${record.division}</span>
              <span>${record.depot}</span>
            </div>
          </div>
        </div>
      </div>
      <div style="border-bottom: 2px solid #000; background: #e5e7eb; padding: 5px; text-align: center; font-weight: 900; font-size: 13px; text-transform: uppercase;">
        DAILY CASH COLLECTION SUMMARY
      </div>
      <div style="border-bottom: 2px solid #000; display: flex; justify-content: space-between; padding: 6px 10px; font-weight: bold; font-size: 12px;">
        <span>Collection For the Date : ${record.date}</span>
        <span>Report Generated Time : ${record.reportGeneratedTime || '11/07/2026 01:44:42 am'}</span>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000;">
        <div style="min-width: 0; border-right: 2px solid #000;">
          <table>
            <thead>
              <tr class="bg-gray-200">
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
        <div style="min-width: 0;">
          <table>
            <thead>
              <tr class="bg-gray-200">
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
      <div style="border-bottom: 2px solid #000; padding: 8px 12px; text-align: center; background: #fff;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
          <img src="${GSRTC_LOGO_BASE64}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: contain; border: 1.5px solid #000; padding: 2px; background: #fff; flex-shrink: 0;" alt="GSRTC Logo" />
          <div style="flex: 1; max-width: 650px;">
            <h2 style="margin: 0; font-size: 19px; font-weight: 900; letter-spacing: 0.5px; color: #000;">
              ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ
            </h2>
            <h3 style="margin: 2px 0 0 0; font-size: 14.5px; font-weight: 800; color: #1e293b;">
              ડી.સી.સી. સમરી સુરત સીટી
            </h3>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11.5px; margin-top: 4px; padding: 0 4px;">
              <span>સુરત વિભાગ • સુરત સીટી ડેપો-૨</span>
              <span>તારીખ: <span class="font-mono" style="font-size: 13px; text-decoration: underline;">${record.date}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border-bottom: 2px solid #000; flex: 1;">
        <div style="min-width: 0; border-right: 2px solid #000; display: flex; flex-direction: column;">
          <table style="flex: 1;">
            <thead>
              <tr class="bg-gray-200" style="font-size: 12px;">
                <th style="width: 26px; padding: 5px 2px;">ક્રમ</th>
                <th style="width: 54px; padding: 5px 2px;">હેડ નં.</th>
                <th style="padding: 5px 5px;">વિગત</th>
                <th style="width: 78px; padding: 5px 6px;" class="text-right">રકમ રૂ.</th>
              </tr>
            </thead>
            <tbody>
              ${record.gujaratiIncomes.map((item, i) => `
                <tr style="height: 25.5px;">
                  <td class="text-center font-mono" style="font-size: 11px; padding: 4.5px 2px;">${i + 1}</td>
                  <td class="text-center font-mono font-bold" style="font-size: 11px; padding: 4.5px 2px;">${item.headNo || '-'}</td>
                  <td style="font-size: 11px; font-weight: 600; padding: 4.5px 5px;">${item.titleGu}</td>
                  <td class="text-right font-mono font-bold" style="font-size: 11.5px; padding: 4.5px 6px;">${item.amount > 0 ? formatIndianInteger(item.amount) : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: #e5e7eb; border-top: 2px solid #000; font-weight: 900; font-size: 13px;">
            <span>અ. કુલ આવક (અ)</span>
            <span class="font-mono" style="font-size: 14px;">${formatIndianInteger(gujTotals.totalA)}</span>
          </div>
        </div>

        <div style="min-width: 0; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <div>
            <table>
              <thead>
                <tr class="bg-gray-200" style="font-size: 12px;">
                  <th style="width: 26px; padding: 5px 2px;">ક્રમ</th>
                  <th style="width: 54px; padding: 5px 2px;">હેડ નં.</th>
                  <th style="padding: 5px 5px;">વિગત</th>
                  <th style="width: 80px; padding: 5px 10px 5px 5px;" class="text-right">રકમ રૂ.</th>
                </tr>
              </thead>
              <tbody>
                ${record.gujaratiDeductions.map((item, i) => `
                  <tr style="height: 25.5px;">
                    <td class="text-center font-mono" style="font-size: 11px; padding: 4.5px 2px;">${i + 1}</td>
                    <td class="text-center font-mono font-bold" style="font-size: 11px; padding: 4.5px 2px;">${item.headNo || '-'}</td>
                    <td style="font-size: 11px; font-weight: 600; padding: 4.5px 5px;">${item.titleGu}</td>
                    <td class="text-right font-mono font-bold" style="font-size: 11.5px; padding: 4.5px 10px 4.5px 5px;">${item.amount > 0 ? formatIndianInteger(item.amount) : '0'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="display: flex; justify-content: space-between; padding: 5px 10px 5px 8px; background: #f3f4f6; border-top: 1px solid #000; border-bottom: 2px solid #000; font-weight: bold; font-size: 12px;">
              <span>બ. કુલ કપાત (બ)</span>
              <span class="font-mono" style="font-size: 13px;">${formatIndianInteger(gujTotals.totalB)}</span>
            </div>

            <div style="border-bottom: 2px solid #000;">
              <div class="bg-gray-100 font-bold" style="padding: 4px 8px; font-size: 12px; border-bottom: 1px solid #000;">અન્ય આવક (Other Income)</div>
              <table>
                ${record.gujaratiOtherIncomes.map((item, i) => `
                  <tr style="height: 25.5px;">
                    <td class="text-center font-mono" style="width: 26px; font-size: 11px; padding: 4.5px 2px;">${i + 1}</td>
                    <td class="text-center font-mono font-bold" style="width: 54px; font-size: 11px; padding: 4.5px 2px;">${item.headNo || '-'}</td>
                    <td style="font-size: 11px; font-weight: 600; padding: 4.5px 5px;">${item.titleGu}</td>
                    <td class="text-right font-mono font-bold" style="width: 80px; font-size: 11.5px; padding: 4.5px 10px 4.5px 5px;">${item.amount || '0'}</td>
                  </tr>
                `).join('')}
              </table>
              <div style="display: flex; justify-content: space-between; padding: 4px 10px 4px 8px; background: #f3f4f6; font-weight: bold; font-size: 12px; border-top: 1px solid #000;">
                <span>ક. કુલ અન્ય આવક (ક)</span>
                <span class="font-mono" style="font-size: 13px;">${formatIndianInteger(gujTotals.totalC)}</span>
              </div>
            </div>

            <div style="padding: 10px 12px; background: #fef3c7; border-bottom: 2px solid #000;">
              <div style="font-weight: 800; font-size: 12px; line-height: 1.3;">બેંકમાં જમાં કરાવેલ ડી.સી.સી. તથા ડી.આર.એમ. ની આવક (અ - બ + ક)</div>
              <div style="text-align: right; font-size: 21px; font-weight: 900; color: #991b1b; margin-top: 2px;" class="font-mono">
                ₹ ${formatIndianInteger(gujTotals.netBankRemittance)}
              </div>
            </div>
          </div>

          <div style="padding: 8px 12px 8px 10px;">
            <div style="border: 2px solid #000; border-radius: 6px; padding: 8px 12px; max-width: 245px; margin-left: auto; background: #f9fafb; font-size: 11px; line-height: 1.5;">
              <div style="text-align: center; font-weight: bold; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 4px; font-size: 11.5px;">
                ડી.આર.એમ. સ્લિપ તાળો (DRM Slip)
              </div>
              <div style="display: flex; justify-content: space-between;"><span>P.O.S</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.pos)}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>DRM</span><span class="font-mono font-bold">${record.drmSlip.drm ? formatIndianInteger(record.drmSlip.drm) : ''}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>G12</span><span class="font-mono font-bold">${record.drmSlip.g12 || 0}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>CC DIPODIT</span><span class="font-mono font-bold">${record.drmSlip.ccDeposit || 0}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>DIWALI EXT</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.diwaliExt || 0)}</span></div>
              <div style="display: flex; justify-content: space-between;"><span>CC REFUND</span><span class="font-mono font-bold">${formatIndianInteger(record.drmSlip.ccRefund || 0)}</span></div>
              <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #000; margin-top: 4px; padding-top: 3px; font-weight: bold; color: #991b1b; font-size: 12px;">
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

  // 3. DRM Memo SBI Sheet
  const drmHtml = `
    <div class="page">
      <div style="padding: 12px 16px; border-bottom: 2px solid #000; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <img src="${GSRTC_LOGO_BASE64}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: contain; border: 1.5px solid #000; padding: 1px; background: #fff;" alt="GSRTC Logo" />
          <div style="flex: 1; text-align: center;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
              DAILY REVENUE MEMO
            </h2>
            <div style="display: flex; justify-content: space-around; font-weight: bold; font-size: 12px; margin-top: 6px; text-transform: uppercase;">
              <div>STATE TRANSPORT GUJARAT • ${record.division}</div>
              <div>${record.depotCode}</div>
            </div>
          </div>
          <img src="${GSRTC_LOGO_BASE64}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: contain; border: 1.5px solid #000; padding: 1px; background: #fff;" alt="GSRTC Logo" />
        </div>
      </div>

      <div style="padding: 14px 22px 14px 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 12px; font-size: 12.5px;">
            <span>${record.depotCityNum}</span>
            <span>DATE- <span class="font-mono" style="text-decoration: underline; font-size: 13.5px;">${record.date}</span></span>
          </div>

          <div style="font-weight: bold; font-size: 11.5px; line-height: 1.45; margin-bottom: 14px; text-transform: uppercase;">
            <div style="text-align: right; margin-bottom: 6px;">${record.auditorTitle}</div>
            <div>
              THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO ${record.bankName} ON
              <span class="font-mono" style="text-decoration: underline;">${record.date}</span> NET CASH RECEIPTS ON
              PASSENGER BUS SERVICE, VIDE COL.
            </div>
          </div>

          <table style="border: 2px solid #000; margin-bottom: 14px;">
            <tbody>
              <tr>
                <td style="width: 68%; padding: 9px 12px; font-weight: bold; text-transform: uppercase; border-right: 2px solid #000;">RURAL INCOME</td>
                <td style="width: 32%; padding: 9px 14px 9px 10px; text-align: right; font-weight: bold; font-size: 15px;" class="font-mono">${formatIndianInteger(record.ruralIncome)}/-</td>
              </tr>
              ${record.drmSlip.drm ? `
                <tr style="background: #fef3c7;">
                  <td style="padding: 7px 12px; font-weight: bold; border-right: 2px solid #000;">PREVIOUS HOLIDAY DRM / રજાનું બાકી DRM</td>
                  <td style="padding: 7px 14px 7px 10px; text-align: right; font-weight: bold; font-size: 14px;" class="font-mono">${formatIndianInteger(record.drmSlip.drm)}/-</td>
                </tr>
              ` : ''}
              ${record.urbanIncome > 0 ? `
                <tr>
                  <td style="padding: 7px 12px; font-weight: bold; border-right: 2px solid #000;">URBAN / LOCAL INCOME</td>
                  <td style="padding: 7px 14px 7px 10px; text-align: right; font-weight: bold; font-size: 14px;" class="font-mono">${formatIndianInteger(record.urbanIncome)}/-</td>
                </tr>
              ` : ''}
              <tr style="background: #eff6ff;">
                <td style="width: 68%; padding: 9px 12px; font-weight: bold; text-transform: uppercase; border-right: 2px solid #000;">
                  G-12 REMITTANCE ${record.g12Number ? '(VIDE NO. ' + record.g12Number + ')' : '(VIDE NO. ____________)'}
                </td>
                <td style="padding: 9px 14px 9px 10px; text-align: right; font-weight: bold; font-size: 15px;" class="font-mono">
                  ${record.g12Amount > 0 ? formatIndianInteger(record.g12Amount) + '/-' : '          /-'}
                </td>
              </tr>
              <tr style="height: 34px;"><td style="border: 1px solid #000; border-right: 2px solid #000;"></td><td style="border: 1px solid #000; text-align: right; padding-right: 14px; font-size: 14px;" class="font-mono font-bold">/-</td></tr>
              <tr style="height: 34px;"><td style="border: 1px solid #000; border-right: 2px solid #000;"></td><td style="border: 1px solid #000; text-align: right; padding-right: 14px; font-size: 14px;" class="font-mono font-bold">/-</td></tr>
              <tr style="height: 34px;"><td style="border: 1px solid #000; border-right: 2px solid #000;"></td><td style="border: 1px solid #000; text-align: right; padding-right: 14px; font-size: 14px;" class="font-mono font-bold">/-</td></tr>
              <tr style="height: 34px;"><td style="border: 1px solid #000; border-right: 2px solid #000;"></td><td style="border: 1px solid #000; text-align: right; padding-right: 14px; font-size: 14px;" class="font-mono font-bold">/-</td></tr>
              <tr class="bg-gray-100" style="border-top: 2px solid #000; font-weight: 900; font-size: 15px;">
                <td style="padding: 10px 12px; text-align: center; letter-spacing: 2px; border-right: 2px solid #000;">TOTAL</td>
                <td style="padding: 10px 14px 10px 10px; text-align: right; color: #991b1b;" class="font-mono font-bold">
                  ${formatIndianInteger(drmTotalAmount)}/-
                </td>
              </tr>
            </tbody>
          </table>

          <div style="border: 1.5px solid #000; background: #f9fafb; padding: 10px 12px; border-radius: 4px; font-weight: 800; font-size: 11.5px; margin-bottom: 20px; text-transform: uppercase; line-height: 1.4;">
            ${words}
          </div>
        </div>

        <div>
          <div style="border: 1.5px solid #000; margin-bottom: 28px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid #000; background: #f3f4f6; text-align: center; font-weight: bold; font-size: 11px; padding: 6px;">
              <div>CASHIER</div>
              <div>TRAFFIC CONTROLLER</div>
              <div>DEPOT MANAGER</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; height: 42px; text-align: center;">
              <div style="display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-style: italic; color: #1e3a8a; font-weight: bold;">${record.cashierName}</div>
              <div style="display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-style: italic; color: #1e3a8a; font-weight: bold;">${record.trafficSupervisorName}</div>
              <div style="display: flex; align-items: flex-end; justify-content: center; padding-bottom: 4px; font-style: italic; color: #1e3a8a; font-weight: bold;">${record.seniorDepotManagerName}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; text-align: center; font-weight: bold; font-size: 12px; padding-top: 10px;">
            <div>
              <div style="color: #1e3a8a; font-style: italic; font-size: 13px;">એસ.ટી. કેશીયર</div>
              <div style="border-top: 1px solid #000; padding-top: 4px; margin-top: 10px; min-width: 150px;">એસ.ટી. સુરત સીટી-ડેપો-૨</div>
            </div>
            <div>
              <div style="color: #1e3a8a; font-style: italic; font-size: 13px;">સિનિ. ડેપો મેનેજર 'એ'</div>
              <div style="border-top: 1px solid #000; padding-top: 4px; margin-top: 10px; min-width: 150px;">એસ.ટી. સુરત સીટી ડેપો-૨</div>
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
