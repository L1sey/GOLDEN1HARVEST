import nodemailer from "nodemailer";

export const runtime = "nodejs";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req) {
  try {
    const form = await req.formData();

    // Honeypot anti-spam
    const website = String(form.get("website") || "").trim();
  console.log("Honeypot field value:", website);  
    if (website) {
      console.warn("Honeypot triggered");
      return Response.json({ ok: true });
    }

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const dob = String(form.get("dob") || "").trim();
    const address = String(form.get("address") || "").trim();
    const employmentType = String(
      form.get("employmentType") || ""
    ).trim();
    const location = String(form.get("location") || "").trim();
    const position = String(form.get("position") || "").trim();
    const experience = String(form.get("experience") || "").trim();
    const resume = form.get("resume");

    if (!name || !email || !phone || !position) {
      return Response.json(
        {
          ok: false,
          error: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailFrom = process.env.EMAIL_FROM;
    const hrEmail = process.env.HR_EMAIL;

    if (!emailUser || !emailPassword || !emailFrom || !hrEmail) {
      console.error("Missing email environment variables", {
        EMAIL_USER: Boolean(emailUser),
        EMAIL_PASSWORD: Boolean(emailPassword),
        EMAIL_FROM: Boolean(emailFrom),
        HR_EMAIL: Boolean(hrEmail),
      });

      return Response.json(
        {
          ok: false,
          error: "The email service is not configured.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    // This makes SMTP failures easier to identify in Vercel logs
    await transporter.verify();

    const attachments = [];

    if (resume instanceof File && resume.size > 0) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const maximumSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(resume.type)) {
        return Response.json(
          {
            ok: false,
            error: "Resume must be a PDF, DOC, or DOCX file.",
          },
          { status: 400 }
        );
      }

      if (resume.size > maximumSize) {
        return Response.json(
          {
            ok: false,
            error: "Resume must be no larger than 5 MB.",
          },
          { status: 400 }
        );
      }

      attachments.push({
        filename: resume.name,
        content: Buffer.from(await resume.arrayBuffer()),
        contentType: resume.type,
      });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeDob = escapeHtml(dob);
    const safeAddress = escapeHtml(address);
    const safeEmploymentType = escapeHtml(employmentType);
    const safeLocation = escapeHtml(location);
    const safePosition = escapeHtml(position);
    const safeExperience = escapeHtml(experience).replace(/\n/g, "<br />");

    // Email sent to company inbox
    await transporter.sendMail({
      from: emailFrom,
      to: hrEmail,
      replyTo: email,
      subject: `New Job Application – ${position || "Applicant"}`,
      text: `
New Job Application

Name: ${name}
Email: ${email}
Phone: ${phone}
Date of Birth: ${dob}
Address: ${address}
Location: ${location}
Employment Type: ${employmentType}
Position: ${position}

Experience:
${experience}
      `,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f4f7f4;padding:24px;color:#111;">
          <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #d9e5dc;">
            <div style="background:#166534;color:#fff;padding:20px;">
              <h2 style="margin:0;font-size:22px;">New Job Application</h2>
              <p style="margin:6px 0 0;color:#dcfce7;">
                Golden Harvest Grove Careers
              </p>
            </div>

            <div style="padding:22px;">
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${safeEmail}</p>
              <p><strong>Phone:</strong> ${safePhone}</p>
              <p><strong>Date of Birth:</strong> ${safeDob || "Not provided"}</p>
              <p><strong>Address:</strong> ${safeAddress || "Not provided"}</p>
              <p><strong>Location:</strong> ${safeLocation || "Not provided"}</p>
              <p><strong>Employment Type:</strong> ${safeEmploymentType || "Not provided"}</p>
              <p><strong>Position:</strong> ${safePosition}</p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

              <h3 style="color:#166534;margin-bottom:8px;">
                Experience / Skills
              </h3>

              <p style="line-height:1.6;">
                ${safeExperience || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      `,
      attachments,
    });

    // Confirmation email sent to applicant
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: "Application Received – Golden Harvest Grove",
      text: `
Hello ${name},

We have received your application for the ${position} role.

Our Human Resources department will review your information and contact you if you are selected for the next stage.

Thank you,
Golden Harvest Grove Human Resources
      `,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f4f7f4;padding:24px;color:#111;">
          <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #d9e5dc;">
            <div style="background:#166534;color:#fff;padding:20px;">
              <h2 style="margin:0;font-size:22px;">
                Application Received
              </h2>

              <p style="margin:6px 0 0;color:#dcfce7;">
                Golden Harvest Grove Human Resources
              </p>
            </div>

            <div style="padding:22px;">
              <p>Hello <strong>${safeName}</strong>,</p>

              <p style="line-height:1.6;">
                We have received your application for the
                <strong>${safePosition}</strong> role.
              </p>

              <p style="line-height:1.6;">
                Our Human Resources department will review your information
                and contact you if you are selected for the next stage.
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
    console.error("APPLICATION EMAIL ERROR:", err);

    return Response.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "The application email could not be sent.",
      },
      { status: 500 }
    );
  }
}