const puppeteer = require("puppeteer");

module.exports = async (res, data, from, to) => {

    try {

        const browser = await puppeteer.launch({
            headless: "new", 
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        const html = `
<html>

<head>

<meta charset="UTF-8">

<style>

body{
  font-family: Arial, sans-serif;
  font-size:10px;
  padding:20px;
  color:#333;
}

.title{
  text-align:center;
  font-weight:bold;
  font-size:14px;
  color:#4b3fb3;
}

.subtitle{
  text-align:center;
  font-weight:bold;
  margin-bottom:15px;
  font-size:11px;
}

/* 🔥 prevent family split */
.family-block{
  margin-top:12px;
}

.family-head{
  background:#8378FF;
  color:white;
  padding:5px;
  font-weight:bold;
  font-size:10px;

  page-break-after: avoid;   /* 🔥 KEY FIX */
}

table{
  width:100%;
  border-collapse:collapse;
  margin-bottom:10px;
}

/* 🔥 repeat header */
thead{
  display:table-header-group;
}

th{
  background:#d6dbe1;
  padding:5px;
  text-align:center;
  font-weight:bold;
  border:1px solid #999;
  font-size:10px;
}

td{
  padding:4px;
  border:1px solid #ccc;
  font-size:10px;
}

.member{
  background:#e6edf3;
  font-weight:bold;
  text-align:left;
}

.date{
  text-align:center;
  width:25%;
}

.amount{
  text-align:right;
  width:25%;
}

.category{
  text-align:left;
}

.total{
  text-align:right;
  font-weight:bold;
  padding:6px;
  font-size:11px;
}


</style>

</head>

<body>

<div class="title">
CSI CHURCH VYRAKUDI
</div>

<div class="subtitle">
Overall Family Bill (${from} to ${to})
</div>

${(data || []).map((fam, index) => `

<div class="family-block ">

<div class="family-head">
Family Head : ${fam.family_id} 
${fam.head_name} (${fam.head_tamil}) - ${fam.head_member_id}
</div>

<table>

<thead>
<tr>
<th>Date</th>
<th>Amount (₹)</th>
<th>Category</th>
</tr>
</thead>

<tbody>

${(fam.members || []).map(m => `

<tr class="member" style="page-break-inside: avoid;">
<td colspan="3">
${m.member_name} (${m.member_tamil_name}) - ${m.member_id} 
(${m.relation === "Husband" ? "Father" :
    m.relation === "Wife" ? "Mother" :
    m.relation || ""
})
</td>
</tr>

${(m.offerings || [])
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(o => `

<tr style="page-break-inside: avoid;">
<td class="date">
${o.date ? new Date(o.date).toLocaleDateString("en-GB") : "-"}
</td>

<td class="amount">
₹ ${Number(o.amount || 0).toLocaleString()}
</td>

<td class="category" style="
  color: ${(o.type || o.category)?.includes("Santha") ? "#2e7d32" : "#000"};
  font-weight: ${(o.type || o.category)?.includes("Santha") ? "bold" : "normal"};
">
${o.type || o.category || ""}
</td>

</tr>

`).join("")}

`).join("")}

<tr>
<td colspan="3" class="total">
Grand Total for this Family (₹) : ₹ ${Number(fam.total || 0).toLocaleString()}
</td>
</tr>

</tbody>

</table>

</div>

`).join("")}

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
              <div style="width:100%; font-size:9px; text-align:center;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
              </div>
            `,

            margin: {
                top: "30px",
                bottom: "40px",
                left: "20px",
                right: "20px"
            }
        });

        await browser.close();

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=overall-bills-\${from}-to-\${to}.pdf`
        );

        res.end(pdfBuffer);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "PDF generation failed"
        });

    }

};