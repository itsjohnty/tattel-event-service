const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080; // Use the environment variable for the port

const config = {
  user: "tattel_server_admin",
  password: "Sql@1234",
  server: "tattel-2.database.windows.net",
  port: 1433,
  database: "tattel_2.0",
  options: {
    encrypt: true, // Use encryption (required for Azure SQL)
    trustServerCertificate: false, // Change to true for development only
  },
};

// Connect to the database
sql.connect(config, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database");
  }
});

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Fetch Events Endpoint
app.get("/fetch-events", (req, res) => {
  const query = "SELECT * FROM events";

  const request = new sql.Request();
  request.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Failed to fetch events" });
    } else {
      res.json(result.recordset);
    }
  });
});

// Post Event Endpoint
app.post("/post-event", (req, res) => {
  const {
    created_by_email,
    event_name,
    event_date,
    start_time,
    end_time,
    event_description,
    event_poster,
    zoom_link,
  } = req.body;

  const insertQuery =
    "INSERT INTO events (created_by_email, event_name, event_date, start_time, end_time, event_description, event_poster, zoom_link) VALUES (@created_by_email, @event_name, @event_date, @start_time, @end_time, @event_description, @event_poster, @zoom_link)";

  const request = new sql.Request();
  request.input("created_by_email", sql.NVarChar, created_by_email);
  request.input("event_name", sql.NVarChar, event_name);
  request.input("event_date", sql.Date, event_date);
  request.input("start_time", sql.Time, start_time);
  request.input("end_time", sql.Time, end_time);
  request.input("event_description", sql.NVarChar, event_description);
  request.input("event_poster", sql.NVarChar, event_poster);
  request.input("zoom_link", sql.NVarChar, zoom_link);

  request.query(insertQuery, (err, result) => {
    if (err) {
      console.error("Error inserting event:", err);
      res.status(500).json({ error: "Failed to insert event" });
    } else {
      res.status(201).json({ message: "Event created successfully" });
    }
  });
});

// Delete Event Endpoint
app.delete("/delete-event/:eventId", (req, res) => {
  const eventId = req.params.eventId;

  const deleteQuery = "DELETE FROM events WHERE event_id = @eventId";

  const request = new sql.Request();
  request.input("eventId", sql.Int, eventId);

  request.query(deleteQuery, (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Failed to delete event" });
    } else if (result.rowsAffected[0] === 0) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json({ message: "Event deleted successfully" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
