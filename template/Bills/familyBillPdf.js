const puppeteer = require("puppeteer");

module.exports = async (res, data, familyId, from, to) => {

    const browser = await puppeteer.launch({
        headless: "new", 
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    // HEAD FIRST SORT
    data = (data || []).sort((a, b) => {
        if (a.is_head) return -1;
        if (b.is_head) return 1;
        return 0;
    });

    const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");

    let grandTotal = 0;

    const html = `
<html>

<head>

<style>

body{
font-family:Arial, sans-serif;
font-size:10px;
padding:25px;
color:#333;
}

.title{
text-align:center;
font-weight:bold;
font-size:14px;
color:#4b3fb3;
margin-bottom:2px;
}

.subtitle{
text-align:center;
font-size:12px;
font-weight:bold;
margin-bottom:10px;
}

.date{
margin-top:10px;
margin-bottom:15px;
font-size:10px;
}

.member-block{
margin-bottom:18px;
}

.member-name{
font-weight:bold;
margin-bottom:2px;
}

.member-id{
margin-bottom:5px;
font-size:10px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:3px;
font-size:10px;
}

thead{
display:table-header-group;
}

th{
background:#8378FF;
color:white;
padding:4px;
border:1px solid #444;
text-align:center;
font-weight:bold;
}

td{
padding:4px;
border:1px solid #444;
text-align:center;
}

.total-box{
margin-top:20px;
display:flex;
justify-content:flex-end;
}

.total-table{
border-collapse:collapse;
}

.total-table td{
border:1px solid #444;
padding:6px 15px;
font-weight:bold;
}

</style>

</head>

<body>

<div class="title">CSI CHURCH VYRAKUDI</div>

<div class="subtitle">
Family Offerings Bill (${familyId})
</div>

<div class="date">
<b>Dates</b>: <b>From</b> ${formatDate(from)} <b>To</b> ${formatDate(to)}
</div>

${data.map((m, i) => {

        const sortedOfferings = (m.offerings || []).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );



        const rows = sortedOfferings.map((o, k) => {

            grandTotal += Number(o.amount || 0);

            return `
<tr>
<td>${k + 1}</td>
<td style="
  text-align:left;
  color:${(o.category || o.type)?.includes("Santha") ? "#2e7d32" : "#000"};
  font-weight:${(o.category || o.type)?.includes("Santha") ? "bold" : "normal"};
">
${o.category || o.type || ""}
</td>
<td>${o.date ? formatDate(o.date) : "-"}</td>
<td>₹ ${Number(o.amount || 0).toLocaleString()}</td>
</tr>
`;
        }).join("");

        return `

<div class="member-block">

<div class="member-name">
Member Name : ${m.member_name} (${m.member_tamil_name})
</div>

<div class="member-id">
Member ID : ${m.member_id}
</div>

<table>

<thead>
<tr>
<th style="width:60px">Sl. No</th>
<th>Offering Category</th>
<th style="width:120px">Date of Payment</th>
<th style="width:90px">Amount (₹)</th>
</tr>
</thead>

<tbody>

${rows}

</tbody>

</table>

</div>

`;

    }).join("")}

<div class="total-box">

<div style="text-align:right;margin-top:20px;font-weight:bold;font-size:11px;">
Grand Total (₹) : ${grandTotal}
</div>

</div>

</body>

</html>
`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20px",
            bottom: "30px",
            left: "20px",
            right: "20px"
        }
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${familyId}-family-bill.pdf`
    );

    res.end(pdf);

};