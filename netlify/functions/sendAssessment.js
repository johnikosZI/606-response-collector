// netlify/functions/sendAssessment.js
const sgMail = require('@sendgrid/mail');

// Make sure to set your SendGrid API key as an environment variable in Netlify
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  // 1. Handle OPTIONS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        // Allow your Squarespace domain or '*' for all
        'Access-Control-Allow-Origin': '*', 
        // Which headers can be sent in the actual request
        'Access-Control-Allow-Headers': 'Content-Type',
        // Which methods are allowed
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'OK'
    };
  }

  // 2. Reject other methods if not POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
 
 // 3. For the actual POST request, also send back the CORS header
  try {
    // Parse the JSON payload from the front-end
    const data = JSON.parse(event.body);
   
    
    // Construct an email message
    const msg = {
      to: data.userEmail,            // Send to the user’s email
      from: 'john@zi.consulting', // Your verified sender email
      subject: 'Your Revenue Recognition Assessment Results',
      html: `
        <h1>Assessment Results</h1>
        <p><strong>Question 1:</strong> ${data.q1 || ''}</p>
        <p><strong>Question 2:</strong> ${data.q2 || ''}</p>
        <!-- Add more questions as needed -->
        <p>Thank you for taking the assessment!</p>
      `,
    };

    // Send the email
    await sgMail.send(msg);

    // Optionally, send yourself a notification too
    // (Just replicate the `msg` structure with your own email address)

    // Return success
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error sending email' }),
    };
  }
};
