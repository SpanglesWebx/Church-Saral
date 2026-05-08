// const generateHTML = (members) => {
//   return `
//   <html>
//   <head>
//     <style>

//       body {
//         font-family: Arial, sans-serif;
//         font-size: 11px;
//         margin: 0;
//         padding: 0;
//       }

//       /* HEADER */
//       header {
//         position: fixed;
//         top: 0;
//         left: 0;
//         right: 0;
//         height: 70px;
//         text-align: center;
//         background: #fff;
//       }

//       header h1 {
//         margin: 10px 0 0;
//         font-size: 16px;
//         font-weight: bold;
//       }

//       header h2 {
//         margin: 2px 0;
//         font-size: 12px;
//         font-weight: normal;
//         color: #555;
//       }

//       /* CONTENT */
//       main {
//         margin-top: 90px;
//         padding: 0 15px;
//       }

//       /* TABLE */
//       table {
//         width: 100%;
//         border-collapse: collapse;
//       }

//       thead {
//         display: table-header-group;
//         background-color: #f2f2f2;
//       }

//       th {
//         text-align: left;
//         font-weight: bold;
//         font-size: 11px;
//         padding: 8px;
//         border: 1px solid #ccc;
//       }

//       td {
//         padding: 7px;
//         border: 1px solid #ddd;
//         font-size: 10px;
//       }

//       /* ROW SPACING LOOK */
//       tbody tr:nth-child(even) {
//         background-color: #fafafa;
//       }

//       tr {
//         page-break-inside: avoid;
//       }

//       @page {
//         margin: 0;
//       }

//     </style>
//   </head>

//   <body>

//     <!-- HEADER -->
//     <header>
//       <h1>CSI Church - Vyrakudy</h1>
//       <h2>Member List</h2>
//     </header>

//     <!-- CONTENT -->
//     <main>
//       <table>
//         <thead>
//           <tr>
//             <th>Sl No</th>
//             <th>Member ID</th>
//             <th>Name</th>
//             <th>Family ID</th>
//             <th>Status</th>
//           </tr>
//         </thead>

//         <tbody>
//           ${members.map((m, i) => `
//             <tr>
//               <td>${i + 1}</td>
//               <td>${m.member_id || "-"}</td>
//               <td>${m.member_name || "-"}</td>
//               <td>${m.family_id || "-"}</td>
//               <td style="color:${m.status === "Active" ? "#0a8f2f" : "#d11a2a"}; font-weight:bold;">
//                 ${m.status || "-"}
//               </td>
//             </tr>
//           `).join("")}
//         </tbody>
//       </table>
//     </main>

//   </body>
//   </html>
//   `;
// };

// module.exports = generateHTML;




const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default;

// IMPORT TAMIL FONT
require("../../fonts/NotoSansTamil-Regular.js");

// IMPORT TAMIL RESHAPER
const { reshapeTamil } = require("../../fonts/tamilReshaper");

const generateMembersPDF = (members) => {

  // ================= PDF =================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ================= FONT =================

  doc.setFont("NotoSansTamil-Regular", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ================= TABLE DATA =================

  const tableData = members.map((m, i) => [

    i + 1,

    m.member_id || "-",

    m.member_name || "-",

    reshapeTamil(
      (m.member_tamil_name || "-").normalize("NFC")
    ),

    m.family_id || "-",

    m.status || "-",
  ]);

  // ================= TABLE =================

  autoTable(doc, {

    startY: 28,

    margin: {
      top: 28,
      bottom: 18,
      left: 8,
      right: 8,
    },

    theme: "grid",

    tableWidth: 186,

    // ================= HEADERS =================

    head: [
      [
        "Sl No",
        "Member ID",
        "Name",
        "Tamil Name",
        "Family ID",
        "Status",
      ],
    ],

    // ================= BODY =================

    body: tableData,

    // ================= DEFAULT STYLES =================

    styles: {

      font: "NotoSansTamil-Regular",
      fontStyle: "normal",

      fontSize: 8.5,

      cellPadding: {
        top: 3,
        right: 2,
        bottom: 3,
        left: 2,
      },

      overflow: "linebreak",

      cellWidth: "wrap",

      valign: "middle",

      halign: "left",

      textColor: [0, 0, 0],

      lineColor: [210, 210, 210],

      lineWidth: 0.2,
    },

    // ================= HEADER STYLES =================

    headStyles: {

      font: "NotoSansTamil-Regular",
      fontStyle: "normal",

      fontSize: 8.5,

      fillColor: [245, 245, 245],

      textColor: [0, 0, 0],

      halign: "center",

      valign: "middle",

      lineColor: [200, 200, 200],

      lineWidth: 0.2,
    },

    // ================= ALTERNATE ROW =================

    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },

    // ================= COLUMN WIDTHS =================

    columnStyles: {

      // SL NO
      0: {
        halign: "center",
        cellWidth: 14,
      },

      // MEMBER ID
      1: {
        halign: "left",
        cellWidth: 30,
      },

      // NAME
      2: {
        halign: "left",
        cellWidth: 38,
      },

      // TAMIL NAME
      3: {
        halign: "left",
        cellWidth: 52,
      },

      // FAMILY ID
      4: {
        halign: "left",
        cellWidth: 30,
      },

      // STATUS
      5: {
        halign: "center",
        cellWidth: 22,
      },
    },

    // ================= STATUS COLOR =================

    didParseCell: function (data) {

      if (
        data.section === "body" &&
        data.column.index === 5
      ) {

        const value = data.cell.raw;

        if (value === "Active") {

          data.cell.styles.textColor = [10, 143, 47];

        } else {

          data.cell.styles.textColor = [209, 26, 42];
        }

        data.cell.styles.fontStyle = "normal";
      }
    },

    // ================= HEADER + FOOTER EVERY PAGE =================

    didDrawPage: function () {

      // ================= HEADER =================

      doc.setFont(
        "NotoSansTamil-Regular",
        "normal"
      );

      // CHURCH TITLE

      doc.setFontSize(15);

      doc.text(
        "CSI Church - KK",
        pageWidth / 2,
        12,
        {
          align: "center",
        }
      );

      // REPORT TITLE

      doc.setFontSize(9);

      doc.text(
        "Member List",
        pageWidth / 2,
        18,
        {
          align: "center",
        }
      );

      // ================= FOOTER =================

      const pageNumber =
        doc.internal.getNumberOfPages();

      doc.setFontSize(8);

      doc.text(
        `Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 8,
        {
          align: "center",
        }
      );
    },
  });

  // ================= RETURN PDF =================

  return doc.output("arraybuffer");
};

module.exports = generateMembersPDF;