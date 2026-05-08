const puppeteer = require("puppeteer");

module.exports = async (res, data, from, to) => {

  try {

    const browser = await puppeteer.launch({
      headless: "new", 
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // format date dd/mm/yyyy
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };


    const safeFormatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

    // calculate grand total
const grandTotal = (data || []).reduce((sum, f) => sum + (f.total || 0), 0);

    const html = `
<html>

<head>

<meta charset="UTF-8">

<style>

body{
font-family:Arial, sans-serif;
font-size:11px;
padding:20px;
color:#333;
}

.title{
text-align:center;
font-weight:bold;
font-size:16px;
color:#4b3fb3;
margin-bottom:4px;
}

.subtitle{
text-align:center;
margin-bottom:20px;
font-size:12px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:10px;
}

thead{
display:table-header-group;
}

th{
background:#f1f3f6;
padding:6px;
border:1px solid #dcdcdc;
text-align:center;
font-weight:600;
font-size:11px;
}

td{
padding:6px;
border:1px solid #e2e2e2;
text-align:center;
font-size:11px;
}

.left{
text-align:left;
}

tr{
page-break-inside:avoid;
}

.total{
font-weight:bold;
}

</style>

</head>

<body>

<div class="title">
CSI CHURCH VYRAKUDI
</div>

<div class="subtitle">
Individual Family Bills (${safeFormatDate(from)} to ${safeFormatDate(to)})
</div>

<div style="margin:10px 0 15px 0; font-weight:bold; font-size:12px;">

Grand Total Amount : ₹ ${grandTotal.toLocaleString()}<br/>

</div>

<table>

<thead>

<tr>
<th>S.No</th>
<th>Family ID</th>
<th class="left">Head Name</th>
<th>Head Member ID</th>
<th>Total (₹)</th>
</tr>

</thead>
<tbody>

${(data || []).length === 0 ? `
<tr>
<td colspan="5" style="text-align:center; padding:10px;">
No data found
</td>
</tr>
` : (data || []).map((f, i) => `

<tr>
<td>${i + 1}</td>
<td>${f.family_id || "-"}</td>

<td class="left">
${f.head_name || "-"} ${f.head_tamil ? `(${f.head_tamil})` : ""}
</td>

<td>${f.head_member_id || "-"}</td>

<td class="total">
₹ ${Number(f.total || 0).toLocaleString()}
</td>

</tr>

`).join("")}

</tbody>
</table>

</body>

</html>
`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,

      displayHeaderFooter: true,

      headerTemplate: `<div></div>`,

      footerTemplate: `
      <div style="width:100%; font-size:9px; padding:0 20px; text-align:center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
      `,

      margin: {
        top: "40px",
        bottom: "60px"
      }

    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=individual-bills-${from}-to-${to}.pdf`
    );

    res.end(pdfBuffer);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "PDF generation failed"
    });

  }

};