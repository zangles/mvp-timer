export async function GET(req) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Discord Bot Debug</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
      button { padding: 10px 15px; background: #5865F2; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px; margin-bottom: 10px; }
      button:hover { background: #4752C4; }
      .result { margin-top: 20px; }
      .card { background: #f9f9f9; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
      .warning { color: #e74c3c; }
      .success { color: #2ecc71; }
    </style>
  </head>
  <body>
    <h1>Discord Bot Debug</h1>
    
    <div class="card">
      <h2>Environment Check</h2>
      <div id="env-status">Loading...</div>
    </div>
    
    <div class="card">
      <h2>Public Key Check</h2>
      <div id="key-status">Loading...</div>
      <button onclick="checkPublicKey()">Check Public Key</button>
    </div>
    
    <div class="card">
      <h2>Test Endpoints</h2>
      <button onclick="testEndpoint('/api/discord-minimal')">Test Minimal Endpoint</button>
      <button onclick="testEndpoint('/api/discord-test')">Test Logging Endpoint</button>
      <button onclick="testEndpoint('/api/discord-interactions')">Test Main Endpoint</button>
      
      <div class="result">
        <h3>Result:</h3>
        <pre id="result">Click a button to test an endpoint</pre>
      </div>
    </div>
    
    <div class="card">
      <h2>Discord Setup Instructions</h2>
      <p>Try setting your Discord Interactions Endpoint URL to:</p>
      <pre id="endpoint-url">Loading...</pre>
      <p>After setting the URL, check the Vercel function logs to see what's happening.</p>
    </div>
    
    <script>
      // Check environment variables
      async function checkEnv() {
        const envEl = document.getElementById('env-status');
        
        try {
          const response = await fetch('/api/test');
          const data = await response.json();
          
          let html = '<ul>';
          for (const [key, value] of Object.entries(data.environment)) {
            const status = value ? '<span class="success">✓</span>' : '<span class="warning">✗</span>';
            html += \`<li>\${key}: \${status}\</li>\`;
          }
          html += '</ul>';
          
          envEl.innerHTML = html;
        } catch (error) {
          envEl.textContent = 'Error: ' + error.message;
        }
      }
      
      // Check public key
      async function checkPublicKey() {
        const keyEl = document.getElementById('key-status');
        keyEl.textContent = 'Checking...';
        
        try {
          const response = await fetch('/api/check-key');
          const data = await response.json();
          
          let html = '<ul>';
          html += \`<li>Status: \${data.publicKeyStatus}\</li>\`;
          html += \`<li>Preview: \${data.publicKeyPreview}\</li>\`;
          html += \`<li>Length: \${data.publicKeyLength}\</li>\`;
          html += \`<li>Valid Format: \${data.isValidFormat ? '<span class="success">Yes</span>' : '<span class="warning">No</span>'}\</li>\`;
          html += '</ul>';
          
          if (!data.isValidFormat) {
            html += '<p class="warning">Your public key does not appear to be in the correct format. It should be a 64-character hexadecimal string.</p>';
          }
          
          keyEl.innerHTML = html;
        } catch (error) {
          keyEl.textContent = 'Error: ' + error.message;
        }
      }
      
      // Test an endpoint
      async function testEndpoint(endpoint) {
        const resultEl = document.getElementById('result');
        resultEl.textContent = 'Testing...';
        
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 1 })
          });
          
          const data = await response.json();
          resultEl.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
          resultEl.textContent = 'Error: ' + error.message;
        }
      }
      
      // Set the endpoint URL
      function setEndpointUrl() {
        const urlEl = document.getElementById('endpoint-url');
        urlEl.textContent = window.location.origin + '/api/discord-minimal';
      }
      
      // Run on page load
      checkEnv();
      checkPublicKey();
      setEndpointUrl();
    </script>
  </body>
  </html>
  `

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  })
}
