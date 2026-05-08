module.exports = (data, from, to) => {

    return `
<!DOCTYPE html>
<html>

<head>

<style>

@page {
  size: A4;
  margin: 40px;
}

body{
  font-family: Arial, Helvetica, sans-serif;
  font-size:12px;
  margin:0;
  color:#000;
}

.header{
  text-align:center;
  font-weight:bold;
  font-size:18px;
  margin-bottom:5px;
}

.sub-title{
  text-align:left;
  font-size:13px;
  margin-bottom:10px;
}

hr{
  border:1px solid #000;
  margin-bottom:10px;
}

table{
  width:100%;
  border-collapse:collapse;
}

thead{
  display: table-header-group;
}

th{
  text-align:left;
  padding:6px;
  border-bottom:2px solid #000;
  border-top:1px solid #000;
  font-size:12px;
}

td{
  padding:6px;
  border-bottom:1px solid #ddd;
  font-size:12px;
}

.center{
  text-align:center;
}

.footer{
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align:center;
  font-size:10px;
}

.pageNumber:before{
  content: "Page " counter(page);
}

.totalPages:before{
  content: counter(pages);
}

</style>

</head>

<body>

<div class="header">
CSI Church Vyrakudy
</div>

<div class="sub-title">
Marriage Report from ${from} to ${to}
</div>

<table>

<thead>
<tr>
<th class="center">Sl.No</th>
<th>Husband Name</th>
<th>Wife Name</th>
<th class="center">Marriage Date</th>
<th class="center">Years</th>
</tr>
</thead>

<tbody>

${data.map((m, i) => {

        const mdate = new Date(m.marriage_date);

        const day = String(mdate.getDate()).padStart(2, '0');
        const month = String(mdate.getMonth() + 1).padStart(2, '0');
        const year = mdate.getFullYear();

        const marriageFormatted = day + "/" + month + "/" + year;

 

        return `
<tr>

<td class="center">${i + 1}</td>

<td>
${m.husband_name}
<br/>
<small>${m.husband_tamil_name || ""}</small>
</td>

<td>
${m.wife_name}
<br/>
<small>${m.wife_tamil_name || ""}</small>
</td>

<td class="center">${marriageFormatted}</td>

<td class="center">${m.years}</td>

</tr>
`;

    }).join("")}

</tbody>

</table>

<div class="footer">
<span class="pageNumber"></span> / <span class="totalPages"></span>
</div>

</body>
</html>
`;
};