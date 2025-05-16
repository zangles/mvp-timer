export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Sprinkles - Ragnarok MVP Helper Bot</h1>
      <p style={{ marginBottom: "2rem" }}>A Discord bot to help track MVPs in Ragnarok Online.</p>

      <div style={{ backgroundColor: "#f5f5f5", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Setup Status</h2>
        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#2ecc71" }}>✓</span> Discord verification working
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#2ecc71" }}>✓</span> Commands registered
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#2ecc71" }}>✓</span> Basic commands implemented
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#2ecc71" }}>✓</span> Web dashboard implemented
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <span style={{ color: "#e74c3c" }}>✗</span> Respawn notifications (requires scheduled job)
          </li>
        </ul>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available Commands</h2>
        <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>/ping</strong> - Check if the bot is online
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>/help</strong> - Shows help information
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>/mvp [name]</strong> - Get information about an MVP
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>/track [name] [killer]</strong> - Track an MVP kill
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>/list</strong> - List tracked MVPs
          </li>
        </ul>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Web Dashboard</h2>
        <p style={{ marginBottom: "1rem" }}>You can also use our web dashboard to track MVPs and view respawn times.</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#5865F2",
              color: "white",
              borderRadius: "0.25rem",
              textDecoration: "none",
            }}
          >
            Open Dashboard
          </a>
          <a
            href="/api/debug-trackers"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "0.25rem",
              textDecoration: "none",
            }}
          >
            Debug Trackers
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "1.5rem", borderRadius: "0.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Next Steps</h2>
        <ol style={{ listStyleType: "decimal", paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            Set up a database to store MVP tracking data (currently using file-based storage)
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Set up a scheduled job to check for respawning MVPs and send notifications
          </li>
          <li style={{ marginBottom: "0.5rem" }}>Add more MVPs to the database</li>
          <li style={{ marginBottom: "0.5rem" }}>Add autocomplete for MVP names</li>
        </ol>
      </div>
    </main>
  )
}
