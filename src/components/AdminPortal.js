import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import emailjs from 'emailjs-com'; // Import EmailJS

const AdminPortal = () => {
  const [complaints, setComplaints] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      const db = getFirestore();
      const complaintsCollection = collection(db, 'complaints');
      const querySnapshot = await getDocs(complaintsCollection);

      const complaintsData = [];
      querySnapshot.forEach(doc => {
        complaintsData.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(complaintsData);
    };

    fetchComplaints();
  }, []);

  // Send email using EmailJS
  const sendEmailNotification = (userEmail, complaintText, replyText) => {
    const templateParams = {
      user_email: userEmail,
      complaint_text: complaintText,
      reply_text: replyText,
    };

    emailjs
      .send(
        'service_mu5stsv', // Replace with your EmailJS Service ID
        'template_jdwntym', // Replace with your EmailJS Template ID
        templateParams,
        '0D9UymHOBUzD47oct' // Replace with your EmailJS User ID
      )
      .then(
        (response) => {
          console.log('Email sent successfully:', response.status, response.text);
        },
        (error) => {
          console.error('Failed to send email:', error);
        }
      );
  };

  // Handle reply submission
  const handleReply = async (complaintId, userEmail, complaintText) => {
    const db = getFirestore();
    const complaintRef = doc(db, 'complaints', complaintId);

    try {
      await updateDoc(complaintRef, {
        reply: reply,
        status: 'resolved', // Update status to resolved
      });

      // Send email notification after successfully updating the reply
      sendEmailNotification(userEmail, complaintText, reply);

      setReply(""); // Clear reply input
      alert("Reply submitted successfully, and email notification sent!");
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Error submitting reply!");
    }
  };

  return (
    <div className="admin-panel-container">
      <h2>Complaints</h2>

      {/* Display list of complaints */}
      {complaints.length === 0 && <p>No complaints found.</p>}

      <div className="row">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Complaint: {complaint.complaint}</h5>
                <p className="card-text"><strong>Status:</strong> {complaint.status}</p>
                <p className="card-text"><strong>User Email:</strong> {complaint.userEmail}</p>

                {complaint.reply && (
                  <div>
                    <p><strong>Admin Reply:</strong> {complaint.reply}</p>
                  </div>
                )}

                <button onClick={() => setSelectedComplaintId(complaint.id)}>
                  Reply
                </button>

                {selectedComplaintId === complaint.id && (
                  <div className="mt-3">
                    <textarea
                      className="form-control"
                      placeholder="Write your reply"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <button
                      className="btn btn-success mt-2"
                      onClick={() =>
                        handleReply(complaint.id, complaint.userEmail, complaint.complaint)
                      }
                    >
                      Submit Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortal;
