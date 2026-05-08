

module.exports = (data = [], fromDate, toDate) => {

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getMonthShort = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", { month: "short" });
  };

  let sNo = 1;

  const rows = data.map((item, index) => {

    const currentDate = formatDate(item.date);

    // ✅ PREVIOUS ITEM (FOR GROUP CHECK)
    const prev = data[index - 1];

    // const isNewGroup =
    //   !prev ||
    //   prev.transId !== item.transId ||
    //   formatDate(prev.date) !== currentDate;


    const isNewGroup =
  !prev ||
  formatDate(prev.date) !== currentDate;

    const next = data[index + 1];

    // ✅ LAST ROW CHECK
    const isLast =
      !next ||
      next.transId !== item.transId ||
      formatDate(next.date) !== currentDate;

    const groupItems = data.filter(d =>
      d.transId === item.transId &&
      formatDate(d.date) === currentDate
    );

    const total = groupItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    const showTotal = isLast && groupItems.length > 1;

    let mainDetails = "";
    let subDetails = "";

    if (item.type === "Bag") {
      mainDetails = item.subCategory || "-";
    } else {
      mainDetails = `${item.member_name || "-"}`;

      if (item.type === "Cover") {
        subDetails = `
          ${item.member_id || "-"} |
          ${item.offertoryType || ""}
          ${item.month ? "| " + item.month : ""}
        `.replace(/\s+/g, " ").trim();
      }

      else if (item.type === "Santha") {
        subDetails = `
          ${item.member_id || "-"} |
          Santha${item.month ? ` (${item.month})` : ""}
        `.replace(/\s+/g, " ").trim();
      }
    }

    return `
      <tr class="${isNewGroup ? "group-gap" : ""}">
        <td class="center-col">${sNo++}</td>
        <td class="center-col">${currentDate}</td>
        <td class="center-col">${item.transId}</td>

      <td class="left">
  <div class="name">${mainDetails}</div>
  <div class="sub">
    ${subDetails || "&nbsp;"}
  </div>
</td>

        <td class="amount">
          <div class="amt-row">
            <span>${item.amount}</span>
            ${showTotal ? `<span class="total-inline">${total}</span>` : ""}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  return `
  <html>
    <head>
      <style>

        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 0;
        }

        table {
          width: 100%;
          border-collapse: collapse; /* ✅ IMPORTANT */
          border: 1px solid #e0e0e0;
          table-layout: fixed;
        }

        thead th {
          border-bottom: 1px solid #e0e0e0;
          padding: 3px;
          font-size: 12px;
        }

        tbody td {
          border: none;
          padding: 1px 3px; /* ✅ TIGHT ROWS */
          vertical-align: top;
          font-size: 10px;
        }

        /* ✅ ONLY GAP BETWEEN GROUPS */
        .group-gap td {
          padding-top: 6px;
        }

        .left {
          text-align: left;
        }

  .name {
  font-size: 12px;
  line-height: 1.1;
}

.sub {
  margin-left: 0;      
  font-size: 10px;
  
  line-height: 1.2;
}

        .amount {
          text-align: right;
          white-space: nowrap;
          font-size: 12px;
        }

        .amt-row {
          display: flex;
          justify-content: space-between;
        }

        .total-inline {
          font-weight: bold;
        }

        .center-col {
          text-align: center;
          font-size: 12px;
        }

        thead th:nth-child(1),
        tbody td:nth-child(1) { width: 30px; }

        thead th:nth-child(2),
        tbody td:nth-child(2) { width: 70px; }

        thead th:nth-child(3),
        tbody td:nth-child(3) { width: 60px; }

        thead th:nth-child(5),
        tbody td:nth-child(5) { width: 90px; }

        thead th:nth-child(4) {
          text-align: left;
        }

        .report-header {
          text-align: center;
          margin-bottom: 6px;
        }

        .title {
          font-size: 16px;
          font-weight: bold;
        }

        .subtitle {
          font-size: 13px;
          font-weight: bold;
        }

        .date-range {
          font-size: 13px;
          font-weight: bold;
        }

      </style>
    </head>

    <body>

      <div class="report-header">
        <div class="title">CSI Church - Vyrakudy</div>
        <div class="subtitle">Income Report</div>
        <div class="date-range">
          Period : ${getMonthShort(fromDate)} to ${getMonthShort(toDate)} 
          (${formatDate(fromDate)} To ${formatDate(toDate)})
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Trans ID</th>
            <th class="left">Details</th>
            <th class="left">Amount</th>
          </tr>
        </thead>

        <tbody>
          ${rows || `<tr><td colspan="5">No Data</td></tr>`}
        </tbody>

      </table>

    </body>
  </html>
  `;
};


// module.exports = (data = [], fromDate, toDate) => {

//   const formatDate = (date) => {
//     const d = new Date(date);
//     return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
//   };



//   const getMonthShort = (date) => {
//     const d = new Date(date);
//     return d.toLocaleString("en-US", { month: "short" });
//   };

//   let sNo = 1;

//   const rows = data.map((item, index) => {

//     const currentDate = formatDate(item.date);
//     const next = data[index + 1];

//     // ✅ detect last row of same transId + date
//     const isLast =
//       !next ||
//       next.transId !== item.transId ||
//       formatDate(next.date) !== currentDate;

//     const groupItems = data.filter(d =>
//       d.transId === item.transId &&
//       formatDate(d.date) === currentDate
//     );

//     const total = groupItems.reduce((sum, i) => sum + (i.amount || 0), 0);

//     const showTotal = isLast && groupItems.length > 1;

//     let mainDetails = "";
//     let subDetails = "";

//     if (item.type === "Bag") {
//       mainDetails = item.subCategory || "-";
//     } else {
//       mainDetails = `${item.member_name || "-"}`;

//       if (item.type === "Cover") {
//         subDetails = `
//       ${item.member_id || "-"} |
//       ${item.offertoryType || ""}
//       ${item.month ? "| " + item.month : ""}
//     `.replace(/\s+/g, " ").trim();
//       }

//       else if (item.type === "Santha") {
//         subDetails = `
//       ${item.member_id || "-"} |
//       Santha${item.month ? ` (${item.month})` : ""}
//     `.replace(/\s+/g, " ").trim();
//       }
//     }

//     return `
//       <tr>
//         <td class="center-col">${sNo++}</td>
//         <td class="center-col">${currentDate}</td>
//         <td class="center-col">${item.transId}</td>

//         <td class="left">
//           <div class="name">${mainDetails}</div>
//           ${subDetails ? `<div class="sub">${subDetails}</div>` : ""}
//         </td>

//         <td class="amount">
//           <div class="amt-row">
//             <span>${item.amount}</span>
//             ${showTotal ? `<span class="total-inline">${total}</span>` : ""}
//           </div>
//         </td>
//       </tr>
//     `;
//   }).join("");


  

//   return `
//   <html>
//     <head>
//       <style>

//         @page {
//           size: A4 portrait;
//           margin: 10mm;
//         }

//         body {
//           font-family: Arial, sans-serif;
//           font-size: 12px;
//           margin: 0;
//           padding: 0;
//         }

//         h3 {
//           text-align: center;
//           margin: 5px 0;
//         }
// table {
//   width: 100%;
// border-collapse: collapse;   /* ✅ remove all row gaps */
//   border: 1px solid #e0e0e0;
//   table-layout: fixed;
// }

//         thead th {
//           border-bottom: 1px solid #e0e0e0;
//           padding: 3px;
//           font-size: 12px;
//         }

//         thead {
//           display: table-header-group;
//         }

//         tfoot {
//           display: table-footer-group;
//         }





//         tbody td {
//           border: none;
//           padding: 3px;
//           vertical-align: top;
//           font-size: 10px;
//         }

//         .left {
//           text-align: left;
//         }

//         .name {
//           font-size: 12px;
//         }

//         .sub {
//           padding-left: 12px;
//           font-size: 10px;
//           line-height: 1.2;
//         }

//         .amount {
//           text-align: right;
//           white-space: nowrap;
//           font-size: 12px;
//         }

//         .amt-row {
//           display: flex;
//           justify-content: space-between;
//         }

//         .total-inline {
//           font-weight: bold;
//         }

//         tr {
//           page-break-inside: avoid;
//         }

//         .report-header {
//           text-align: center;
//           line-height: 1.4;
//           margin-bottom: 6px;
//         }

//         .title {
//           font-size: 16px;
//           font-weight: bold;
//         }

//         .subtitle {
//           font-size: 13px;
//           font-weight: bold;
//         }

//         .date-range {
//           font-size: 13px;
//           font-weight: bold;
//         }

//         /* EXISTING */
//         .center-col {
//           text-align: center;
//           font-size: 12px;
//         }

//         /* 🔥 NEW WIDTH CONTROL */
//         thead th:nth-child(1),
//         tbody td:nth-child(1) {
//           width: 30px;
//         }

//         thead th:nth-child(2),
//         tbody td:nth-child(2) {
//           width: 70px;
//         }

//         thead th:nth-child(3),
//         tbody td:nth-child(3) {
//           width: 60px;
//         }

//         thead th:nth-child(5),
//         tbody td:nth-child(5) {
//           width: 90px;
//         }

//         /* Details heading LEFT */
//         thead th:nth-child(4) {
//           text-align: left;
//         }

//         .footer {
//           position: fixed;
//           bottom: 5mm;
//           left: 0;
//           right: 0;
//           text-align: center;
//           font-size: 5px;
//         }

//       </style>
//     </head>

//     <body>

// <div class="report-header">
//   <div class="title">CSI Church - Vyrakudy</div>
//   <div class="subtitle">Income Report</div>
// <div class="date-range">
//   Period : ${getMonthShort(fromDate)} to ${getMonthShort(toDate)} 
//   (${formatDate(fromDate)} To ${formatDate(toDate)})
// </div>
// </div>

//       <table>
//         <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Date</th>
//             <th>Trans ID</th>
//             <th class="left">Details</th>
//             <th>Amount</th>
//           </tr>
//         </thead>

//         <tbody>
//           ${rows || `<tr><td colspan="5">No Data</td></tr>`}
//         </tbody>

//       </table>

//     </body>
//   </html>
//   `;
// };