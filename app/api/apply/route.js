import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const form = await req.formData();

    // Honeypot anti-spam
    if (form.get("website")) {
      return Response.json({ ok: true });
    }

    const name = form.get("name") || "";
    const email = form.get("email") || "";
    const phone = form.get("phone") || "";
    const dob = form.get("dob") || "";
    const address = form.get("address") || "";
    const employmentType = form.get("employmentType") || "";
    const location = form.get("location") || "";
    const position = form.get("position") || "";
    const experience = form.get("experience") || "";
    const resume = form.get("resume");

    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let attachment = null;

    if (resume && resume.size > 0) {
      const buffer = Buffer.from(await resume.arrayBuffer());

      attachment = {
        filename: resume.name,
        content: buffer,
      };
    }

    const safeExperience = String(experience).replace(/\n/g, "<br />");

    // Email to HR
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.HR_EMAIL,
      replyTo: email,
      subject: `New Job Application – ${position || "Applicant"}`,
      text: `
New Job Application

Name: ${name}
Email: ${email}
Phone: ${phone}
Date of Birth: ${dob}
Location: ${address}
Position: ${position}

Experience:
${experience}
      `,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f4f7f4;padding:24px;color:#111;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d9e5dc;">
            
            <div style="background:#166534;color:#ffffff;padding:20px;">
              <h2 style="margin:0;font-size:22px;">New Job Application</h2>
              <p style="margin:6px 0 0;color:#dcfce7;">Golden Harvest Grove Careers</p>
            </div>

            <div style="padding:22px;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Date of Birth:</strong> ${dob}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Employment Type:</strong> ${employmentType}</p>
              <p><strong>Position:</strong> ${position}</p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

              <h3 style="color:#166534;margin-bottom:8px;">Experience / Skills</h3>
              <p style="line-height:1.6;">${safeExperience}</p>

              <p style="margin-top:20px;font-size:13px;color:#555;">
                Resume attachment included if the applicant uploaded one.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: attachment ? [attachment] : [],
    });

    // Confirmation email to applicant
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Application Received – Golden Harvest Grove",
      text: `
Hello ${name},

We have received your application for the ${position} role.

Our HR department will review your information and contact you if selected.

Thank you,
Golden Harvest Grove Human Resources
      `,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f4f7f4;padding:24px;color:#111;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d9e5dc;">
            
            <div style="background:#166534;color:#ffffff;padding:20px;">
              <h2 style="margin:0;font-size:22px;">Application Received</h2>
              <p style="margin:6px 0 0;color:#dcfce7;">Golden Harvest Grove Human Resources</p>
            </div>

            <div style="padding:22px;">
              <p>Hello <strong>${name}</strong>,</p>

              <p style="line-height:1.6;">
                We have received your application for the 
                <strong>${position}</strong> role.
              </p>

              <p style="line-height:1.6;">
                Our HR department will review your information and contact you if selected.
              </p>

              <p style="margin-top:22px;">
                Thank you,<br />
                <strong>Golden Harvest Grove Human Resources</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return Response.json({ ok: true });

  } catch (err) {
    console.error(err);
    return Response.json({ ok: false }, { status: 500 });
  }
}