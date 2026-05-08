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
Birthday Report from ${from} to ${to}
</div>



<table>

<thead>
<tr>
<th class="center">Sl.No</th>
<th>Member ID</th>
<th>Name</th>
<th class="center">Date of Birth</th>
<th class="center">Age</th>
</tr>
</thead>

<tbody>

${data.map((m,i)=>{

const dob = new Date(m.dob);

const day = String(dob.getDate()).padStart(2,'0');
const month = String(dob.getMonth()+1).padStart(2,'0');
const year = dob.getFullYear();

const dobFormatted = day + "/" + month + "/" + year;

const age = new Date().getFullYear() - year;

return `
<tr>
<td class="center">${i+1}</td>
<td>${m.member_id}</td>
<td>
${m.member_name}
<br/>
<small>${m.member_tamil_name || ""}</small>
</td>
<td class="center">${dobFormatted}</td>
<td class="center">${age}</td>
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