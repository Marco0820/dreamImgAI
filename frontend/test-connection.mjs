// A simple script to test the connection from Node.js to the backend server.

async function testConnection() {
  const url = 'http://127.0.0.1:8000/api/v1/images/healthcheck/';
  console.log(`Attempting to connect to: ${url}`);

  try {
    // Using the native fetch API available in modern Node.js
    const response = await fetch(url);
    
    console.log(`\n--- SUCCESS ---`);
    console.log(`Status Code: ${response.status}`);
    const data = await response.json();
    console.log('Response Body:', data);
    
    if (response.ok && data.status === 'ok') {
      console.log('\nConclusion: The Node.js environment CAN connect to the backend successfully.');
      console.log('The issue is likely within the Next.js or axios configuration.');
    } else {
      console.error('\nConclusion: The Node.js environment connected, but received an unexpected response.');
    }
  } catch (error) {
    console.error('\n--- CONNECTION FAILED ---');
    console.error('The Node.js environment could NOT connect to the backend.');
    console.error('This is the root cause of the 502 error in your application.');
    console.error('\nFull error details:');
    console.error(error);
  }
}

testConnection(); 