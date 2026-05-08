const puppeteer = require("puppeteer"); 
const path = require("path");
const fs = require("fs");
const Member = require("../Schema/memberSchema");

const v = (val) =>
  val === undefined || val === null || val === "" ? "-" : val;


exports.downloadMembersPDF = async (req, res) => {
  let browser;

  try {
    const { type = "list", status = "All", search = "" } = req.query;

    /* ---------------- FETCH MEMBERS ---------------- */
    const filter = {};

    if (status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { member_name: new RegExp(search, "i") },
        { member_id: new RegExp(search, "i") },
        { member_tamil_name: new RegExp(search, "i") },
      ];
    }

    const members = await Member.find(filter).sort({ member_id: 1 });

    /* ---------------- LOAD TEMPLATE ---------------- */
    const templatePath =
      type === "detailed"
        ? path.join(__dirname, "../templates/memberDetailed.html")
        : path.join(__dirname, "../templates/memberList.html");

    let html = fs.readFileSync(templatePath, "utf8");

    /* ---------------- INJECT DATA ---------------- */
    if (type === "list") {
      const rows = members
        .map(
            (m, index) => `
          <tr>
        <td>${index + 1}</td>
        <td>${m.member_id || "-"}</td>
        <td>${m.member_name || "-"}</td>
        <td>${m.member_tamil_name || "-"}</td>
        <td>${m.status || "-"}</td>
      </tr>
        `
        )
        .join("");

      html = html.replace("<!--ROWS-->", rows);
    }

else if (type === "detailed") {
  const pages = members.map(m => `
    <div class="page">

      <!-- HEADER -->
      <div class="header">
        <div class="church-name">CSI CHRIST CHURCH</div>
        <div class="church-address">
          1588, TRICHY ROAD, COIMBATORE - 641018
        </div>
        <div class="bio-title">BIO-DATA</div>
      </div>

      <hr/>

      <!-- PHOTO -->
      <div class="photo">
        ${
          m.photo
            ? `<img src="${process.env.BASE_URL}${m.photo}" />`
            : "PHOTO"
        }
      </div>

      <!-- CONTENT (CRITICAL WRAPPER) -->
      <div class="content">

        <div class="row">
          <div class="label">Member No and Name</div>
          <div class="value">${v(m.member_id)} - ${v(m.member_title)} ${v(m.member_name)}</div>
        </div>

        <div class="row">
          <div class="label">Head of the Family</div>
          <div class="value">${v(m.head_name)}</div>
        </div>

        <div class="two-col">
          <div class="row">
            <div class="label">Father's Name</div>
            <div class="value">${v(m.father_name)}</div>
          </div>
          <div class="row">
            <div class="label">Mother's Name</div>
            <div class="value">${v(m.mother_name)}</div>
          </div>
        </div>

        <hr/>

        <div class="row">
          <div class="label">Residential Address</div>
          <div class="value">${v(m.present_address)}</div>
        </div>

        <div class="row">
          <div class="label">Contact Nos</div>
          <div class="value">${v((m.contact_numbers || []).join(", "))}</div>
        </div>

        <div class="row">
          <div class="label">E-Mail</div>
          <div class="value">${v(m.email)}</div>
        </div>

        <div class="row">
          <div class="label">Official Address</div>
          <div class="value">${v(m.official_address)}</div>
        </div>

        <div class="row">
          <div class="label">Official Contact Nos</div>
          <div class="value">${v(m.office_contact)}</div>
        </div>

        <hr/>

        <div class="row">
          <div class="label">Permanent Address</div>
          <div class="value">${v(m.permanent_address)}</div>
        </div>

        <div class="row">
          <div class="label">Home Church</div>
          <div class="value">${v(m.home_church)}</div>
        </div>

        <hr/>

        <div class="two-col">
          <div class="row">
            <div class="label">Date of Birth</div>
            <div class="value">${v(m.dob ? new Date(m.dob).toLocaleDateString() : "")}</div>
          </div>
          <div class="row">
            <div class="label">Place of Birth</div>
            <div class="value">${v(m.place_of_birth)}</div>
          </div>
        </div>

        <div class="two-col">
          <div class="row">
            <div class="label">Sex</div>
            <div class="value">${v(m.gender)}</div>
          </div>
          <div class="row">
            <div class="label">Marital Status</div>
            <div class="value">${v(m.marital_status)}</div>
          </div>
        </div>

        <div class="two-col">
          <div class="row">
            <div class="label">Blood Group</div>
            <div class="value">${v(m.blood_group)}</div>
          </div>
          <div class="row">
            <div class="label">Qualification</div>
            <div class="value">${v(m.qualification)}</div>
          </div>
        </div>

        <div class="row">
          <div class="label">Profession</div>
          <div class="value">${v(m.occupation)}</div>
        </div>

        <hr/>

        <div class="two-col">
          <div class="row">
            <div class="label">Confirmation Date</div>
            <div class="value">${v(m.confirmation_date)}</div>
          </div>
          <div class="row">
            <div class="label">Confirmation Place</div>
            <div class="value">${v(m.confirmation_place)}</div>
          </div>
        </div>

        <div class="two-col">
          <div class="row">
            <div class="label">Baptism Date</div>
            <div class="value">${v(m.baptism_date)}</div>
          </div>
          <div class="row">
            <div class="label">Baptism Place</div>
            <div class="value">${v(m.baptism_place)}</div>
          </div>
        </div>

        <div class="row">
          <div class="label">Marriage Date & Place</div>
          <div class="value">${v(m.marriage_date)} , ${v(m.marriage_place)}</div>
        </div>

        <hr/>

        <div class="row">
          <div class="label">Membership From</div>
          <div class="value">${v(m.membership_from)}</div>
        </div>

        <div class="row">
          <div class="label">Membership Status</div>
          <div class="value">${v(m.status)} - Membership</div>
        </div>

        <div class="row">
          <div class="label">Category</div>
          <div class="value">${v(m.member_type)}</div>
        </div>

      </div> <!-- END CONTENT -->

    </div>
  `).join("");

  html = html.replace("<!--MEMBER_PAGES-->", pages);
}




    /* ---------------- PUPPETEER ---------------- */
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: "networkidle0" });
    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    /* ---------------- SEND PDF ---------------- */
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `inline; filename=members-${type}.pdf`,
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
