import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Import from firebase-config.js
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import './UserPortal.css';

const UserPortal = () => {
  const [complaint, setComplaint] = useState(""); // Complaint input state
  const [status, setStatus] = useState(""); // Status of complaint submission
  const [email, setEmail] = useState(""); // User email from Firebase Auth
  const [userComplaints, setUserComplaints] = useState([]); // Store user's complaints

  // Get user email from Firebase Auth (if logged in)
  useEffect(() => {
    if (auth.currentUser) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  // Fetch complaints for the logged-in user
  useEffect(() => {
    const fetchComplaints = async () => {
      if (email) {
        try {
          const q = query(collection(db, "complaints"), where("userEmail", "==", email));
          const querySnapshot = await getDocs(q);
          const complaints = querySnapshot.docs.map((doc) => doc.data());
          setUserComplaints(complaints);
        } catch (error) {
          console.error("Error fetching complaints: ", error);
        }
      }
    };
    fetchComplaints();
  }, [email]);

  // Handle complaint submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (!complaint.trim()) {
      setStatus("Please enter a valid complaint.");
      return;
    }

    try {
      const complaintData = {
        complaint,
        userEmail: email,
        status: "pending", // Default status
        reply: null, // Initially no reply
      };

      await addDoc(collection(db, "complaints"), complaintData);
      setComplaint(""); // Clear input field
      setStatus("Complaint submitted successfully!");

      // Fetch updated list of complaints
      const q = query(collection(db, "complaints"), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const complaints = querySnapshot.docs.map((doc) => doc.data());
      setUserComplaints(complaints);
    } catch (error) {
      console.error("Error adding complaint: ", error);
      setStatus("Error submitting complaint.");
    }
  };

  return (
    <div className="user-portal">
      <header className="user-portal-header">
        <h1>User Portal</h1>
      </header>
      <main>
        <section className="complaint-form-section">
          <h2>Raise a Complaint</h2>
          <form onSubmit={handleSubmitComplaint} className="complaint-form">
            <textarea
              placeholder="Describe your complaint..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows="4"
            />
            <button type="submit">Submit Complaint</button>
          </form>
          {status && <p className="status-message">{status}</p>}
        </section>
        <section className="complaint-list-section">
          <h2>Your Complaints</h2>
          {userComplaints.length === 0 ? (
            <p>No complaints raised yet.</p>
          ) : (
            userComplaints.map((complaint, index) => (
              <div key={index} className="complaint-card">
                <p>
                  <strong>Complaint:</strong> {complaint.complaint}
                </p>
                <p>
                  <strong>Status:</strong> {complaint.status}
                </p>
                <p>
                  <strong>Reply:</strong> {complaint.reply || "No reply yet."}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default UserPortal;
