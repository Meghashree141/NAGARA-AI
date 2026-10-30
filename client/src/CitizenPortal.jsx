import { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Search,
  ClipboardList
} from "lucide-react";

import "./CitizenPortal.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CitizenPortal() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location_name: "",
    latitude: "",
    longitude: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Complaint tracking state.
  const [trackingId, setTrackingId] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackedReport, setTrackedReport] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function getLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));

        setError("");
      },
      () => {
        setError(
          "Unable to access location. Please enter coordinates manually."
        );
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/reports`, {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude)
      });

      setResult(response.data);

      // Automatically prepare the new complaint for tracking.
      setTrackingId(response.data.report.id);
      setTrackedReport(response.data.report);

      setForm({
        title: "",
        description: "",
        category: "",
        location_name: "",
        latitude: "",
        longitude: ""
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTrackComplaint(event) {
    event.preventDefault();

    if (!trackingId.trim()) {
      setTrackingError("Please enter your Complaint ID.");
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    setTrackedReport(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/reports/${trackingId.trim()}`
      );

      setTrackedReport(response.data.report);
    } catch (err) {
      setTrackingError(
        err.response?.data?.message ||
        "Complaint not found. Please check your Complaint ID."
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  function formatStatus(status) {
    return status
      ? status.replaceAll("_", " ")
      : "Not available";
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleString();
  }

  return (
    <div className="citizen-page">

      <header className="citizen-header">

        <a href="/" className="citizen-brand">
          <Waves size={27} />
          <span>NAGARA<strong>AI</strong></span>
        </a>

        <a href="/" className="back-link">
          <ArrowLeft size={17} />
          Dashboard
        </a>

      </header>

      <main className="citizen-main">

        <div className="citizen-intro">

          <div className="citizen-eyebrow">
            <ShieldCheck size={16} />
            SMART CIVIC REPORTING
          </div>

          <h1>
            Make Your City <span>Better.</span>
          </h1>

          <p>
            Report civic problems. Help authorities identify issues
            and take action faster.
          </p>

        </div>

        {/* COMPLAINT TRACKING */}

        <section className="citizen-card tracking-card">

          <div className="citizen-card-heading">
            <div>
              <h2>Track Your Complaint</h2>
              <p>Enter your Complaint ID to check its latest status.</p>
            </div>

            <div className="citizen-card-icon">
              <Search size={23} />
            </div>
          </div>

          <form onSubmit={handleTrackComplaint}>

            <div className="form-group">
              <label>Complaint ID</label>

              <input
                type="text"
                placeholder="Enter your Complaint ID"
                value={trackingId}
                onChange={(event) => setTrackingId(event.target.value)}
                required
              />
            </div>

            {trackingError && (
              <div className="citizen-error">
                <AlertTriangle size={18} />
                {trackingError}
              </div>
            )}

            <button
              type="submit"
              className="submit-complaint"
              disabled={trackingLoading}
            >
              <Search size={18} />
              {trackingLoading ? "Checking..." : "Track Complaint"}
            </button>

          </form>

          {trackedReport && (
            <div className="tracking-result">

              <div className="tracking-result-heading">
                <CheckCircle2 size={21} />

                <div>
                  <h3>Complaint Found</h3>
                  <p>Your complaint information is available.</p>
                </div>
              </div>

              <div className="tracking-status">
                <span>Current Status</span>
                <strong>
                  {formatStatus(trackedReport.status)}
                </strong>
              </div>

              <div className="result-details">

                <p>
                  <strong>Complaint ID:</strong>{" "}
                  {trackedReport.id}
                </p>

                <p>
                  <strong>Title:</strong>{" "}
                  {trackedReport.title}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {trackedReport.category}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  {trackedReport.priority}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {trackedReport.department}
                </p>

                <p>
                  <strong>Assigned Officer:</strong>{" "}
                  {trackedReport.assigned_to || "Not assigned yet"}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {trackedReport.location_name}
                </p>

                <p>
                  <strong>Submitted:</strong>{" "}
                  {formatDate(trackedReport.created_at)}
                </p>

                <p>
                  <strong>Last Updated:</strong>{" "}
                  {formatDate(trackedReport.updated_at)}
                </p>

              </div>

            </div>
          )}

        </section>

        {/* COMPLAINT SUBMISSION */}

        <section className="citizen-card">

          <div className="citizen-card-heading">
            <div>
              <h2>Submit a Complaint</h2>
              <p>Provide accurate information about the issue.</p>
            </div>

            <div className="citizen-card-icon">
              <MapPin size={23} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Complaint Title *</label>

              <input
                type="text"
                name="title"
                placeholder="Example: Dangerous pothole near college"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="form-group">
              <label>Complaint Description *</label>

              <textarea
                name="description"
                placeholder="Describe the civic issue in detail..."
                value={form.description}
                onChange={handleChange}
                maxLength={3000}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>Complaint Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Let AI identify the category</option>
                <option value="ROAD_DAMAGE">Road Damage</option>
                <option value="WATERLOGGING">Waterlogging</option>
                <option value="WASTE_MANAGEMENT">Waste Management</option>
                <option value="STREETLIGHT">Streetlight</option>
                <option value="PUBLIC_SAFETY">Public Safety</option>
                <option value="WATER_SUPPLY">Water Supply</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location Name *</label>

              <input
                type="text"
                name="location_name"
                placeholder="Example: College Main Road"
                value={form.location_name}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </div>

            <div className="location-heading">
              <MapPin size={18} />
              Geographic Coordinates
            </div>

            <button
              type="button"
              className="location-button"
              onClick={getLocation}
            >
              <MapPin size={17} />
              Detect My Location
            </button>

            <div className="coordinate-grid">

              <div className="form-group">
                <label>Latitude *</label>

                <input
                  type="number"
                  name="latitude"
                  placeholder="12.3000"
                  value={form.latitude}
                  onChange={handleChange}
                  step="any"
                  min="-90"
                  max="90"
                  required
                />
              </div>

              <div className="form-group">
                <label>Longitude *</label>

                <input
                  type="number"
                  name="longitude"
                  placeholder="76.6000"
                  value={form.longitude}
                  onChange={handleChange}
                  step="any"
                  min="-180"
                  max="180"
                  required
                />
              </div>

            </div>

            {error && (
              <div className="citizen-error">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="submit-complaint"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? "Analyzing Complaint..." : "Submit Complaint"}
            </button>

          </form>

        </section>

        {/* SUBMISSION SUCCESS */}

        {result && (
          <section className="result-card">

            <div className="result-success">
              <CheckCircle2 size={23} />

              <div>
                <h3>Complaint Submitted Successfully!</h3>
                <p>Your complaint has been saved and analyzed.</p>
              </div>
            </div>

            <div className="result-details">

              <p>
                <strong>Complaint ID:</strong>{" "}
                {result.report.id}
              </p>

              <p>
                <strong>AI Category:</strong>{" "}
                {result.report.category}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                {result.report.priority}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {result.report.department}
              </p>

              <p>
                <strong>AI Summary:</strong>{" "}
                {result.report.summary}
              </p>

              <p>
                <strong>Duplicate Detected:</strong>{" "}
                {result.intelligence.duplicateDetected ? "Yes" : "No"}
              </p>

            </div>

            <button
              className="submit-complaint"
              type="button"
              onClick={() => {
                document.querySelector(".tracking-card")?.scrollIntoView({
                  behavior: "smooth"
                });
              }}
            >
              <ClipboardList size={18} />
              View Complaint Tracking
            </button>

            <a href="/" className="dashboard-result-link">
              Return to Dashboard
            </a>

          </section>
        )}

        <div className="citizen-note">
          <ShieldCheck size={17} />
          Your complaint will be analyzed by NAGARA AI's civic
          intelligence engine.
        </div>

      </main>

    </div>
  );
}

export default CitizenPortal;