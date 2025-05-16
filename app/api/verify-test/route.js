export async function GET(req) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Discord Interaction Test</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
      button { padding: 10px 15px; background: #5865F2; color: white; border: none; border-radius: 5px; cursor: pointer; }
      button:hover { background: #4752C4; }
      .result { margin-top: 20px; }
    </style>
  </head>
  <body>
    <h1>Discord Interaction Test</h1>
    <p>This page helps test your Discord interaction endpoints.</p>
    
    <h2>Test Endpoints</h2>
    <button onclick="testEndpoint('/api/discord-interactions')">Test /api/discord-interactions</button>
    <button onclick="testEndpoint('/api/discord-test')">Test /api/discord-test</button>
    
    <div class="result">
      <h3>Result:</h3>
      <pre id="result">Click a button to test an endpoint</pre>
    </div>
    
    <h2>Environment Variables</h2>
    <pre id="env">Loading...</pre>
    
    <script>
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
      
      // Check environment variables
      async function checkEnv() {
        const envEl = document.getElementById('env');
        
        try {
          const response = await fetch('/api/test');
          const data = await response.json();
          envEl.textContent = JSON.stringify(data.environment, null, 2);
        } catch (error) {
          envEl.textContent = 'Error: ' + error.message;
        }
      }
      
      // Run on page load
      checkEnv();
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
