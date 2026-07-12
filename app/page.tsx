"use client";

import { useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formElement = e.currentTarget;

    setLoading(true);
    setStatus("");
    setSuccess(false);

    const form = new FormData(formElement);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.ok) {
        setStatus("Application sent. HR will contact you.");
        setSuccess(true);
        formElement.reset();
      } else {
        setStatus("Submission failed. Try again.");
      }
    } catch (err) {
      setStatus("Network error. Try again.");
    }

    setLoading(false);
  }

  return (
    <main className="page">
      <div className="card">

        <header className="header">
          <img src="/logo.png" className="logo" />
        </header>

        <form onSubmit={submit} className="form">

          {/* Honeypot anti-spam */}
          <input name="website" style={{ display: "none" }} />

          <input name="name" placeholder="Full name" required />
          <input name="email" placeholder="Email" required />
          <input name="phone" placeholder="Phone" required />
         <input
           name="dob"
           type="text"
           placeholder="Date of Birth  MM/DD/YYYY"
           pattern="\d{2}/\d{2}/\d{4}"
           title="Use MM/DD/YYYY format"
            required
           />

          <input name="address" placeholder=" Full Home Address" required />

<select name="employmentType" required>
  <option value="">Select employment type</option>
  <option value="Part Time">Part Time</option>
  <option value="Full Time">Full Time</option>
</select>


        

          <select name="position" required>
            <option value="">Select position</option>
            <option>Remote Payroll Assistant</option>
             <option>Remote Business Manager</option>
            <option>Remote Accountant</option>
            <option>Remote Sales Associate</option>
            <option>Remote Marketing Specialist</option>
             <option>Remote Payroll Manager</option>
            <option>Remote General Manager</option>
            <option>Remote E-commerce Assistant</option>
            <option>Remote Hiring Manager</option>
            <option>Remote agronomist</option>
            <option>Remote grant writer</option>
            <option>Remote content creator</option>
            <option>Quality assurance coordinator </option>
            <option>Remote Virtual Assistant</option>
            <option>Remote Customer Service Representative</option>
            <option>Remote Data Entry Specialist</option>
            <option>Farm Worker</option>
            <option>Warehouse</option>
            <option>Office Assistant</option>
            <option>Janitor</option>
            <option>Front-desk Position</option>
           <option>Others</option>
          
          </select>

          <textarea name="experience" placeholder="Experience"></textarea>

          <label className="upload">
            Upload Resume
            <input type="file" name="resume" />
          </label>

          <button disabled={loading}>
            {loading ? "Sending..." : "Submit Application"}
          </button>

         {status && success && (
  <div className="successBox">
    <div className="checkmark">
      <svg viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" fill="none" />
        <path fill="none" d="M14 27l7 7 16-16" />
      </svg>
    </div>
    <p>{status}</p>
  </div>
)}

{status && !success && (
  <p className="error">{status}</p>
          )}
        </form>

      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
          padding: 20px;
          font-family: Arial;
        }

        .card {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          animation: fadeIn 0.6s ease;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo {
          width: 110px;
          margin-bottom: 10px;
        }

        h1 {
          margin: 0;
          font-size: 22px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        input, select, textarea {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-size: 14px;
          transition: 0.2s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #2e7d32;
          outline: none;
          box-shadow: 0 0 0 2px rgba(46,125,50,0.15);
        }

        button {
          background: #2e7d32;
          color: white;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.2s;
        }

        button:hover:not(:disabled) {
          background: #1b5e20;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success {
          color: #2e7d32;
          font-weight: bold;
          text-align: center;
        }

        .error {
          color: red;
          text-align: center;
        }

        .animate {
          animation: pop 0.3s ease;
        }

        @keyframes pop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .card {
            padding: 20px;
          }
        }
          .successBox {
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  animation: fadeIn 0.4s ease;
}

.checkmark {
  width: 60px;
  margin: 10px auto;
}

.checkmark circle {
  stroke: #2e7d32;
  stroke-width: 3;
  stroke-dasharray: 157;
  stroke-dashoffset: 157;
  animation: circle 0.6s ease forwards;
}

.checkmark path {
  stroke: #2e7d32;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: check 0.4s 0.6s ease forwards;
}

@keyframes circle {
  to { stroke-dashoffset: 0; }
}

@keyframes check {
  to { stroke-dashoffset: 0; }
}
      `}</style>
    </main>
  );
}