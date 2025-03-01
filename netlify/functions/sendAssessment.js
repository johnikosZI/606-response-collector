const sgMail = require('@sendgrid/mail');

// Netlify will inject your environment variable from its UI (Site Settings > Build & Deploy > Environment)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  console.log('sendAssessment function invoked!', event.body);
  // 1. Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        // Allow requests from any domain; replace * with your Squarespace domain if you want stricter rules
        'Access-Control-Allow-Origin': '*',
        // Which headers can be sent
        'Access-Control-Allow-Headers': 'Content-Type',
        // Which methods are allowed
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'OK'
    };
  }

  // 2. Only allow POST requests (reject GET, PUT, etc.)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // 3. Handle the POST request
  try {
    // Parse the JSON body from the Squarespace form
    const data = JSON.parse(event.body);

    // Build your email
    const msg = {
      to: data.userEmail,            // The email address from the form
      from: 'john@zi.consulting', // Must be a verified sender in SendGrid
      subject: 'Your Revenue Recognition Assessment Results',
      html: `
        <h1>Assessment Results</h1>
        <p><strong>Q1:</strong> ${data.q1 || ''}</p>
        <p><strong>Q2:</strong> ${data.q2 || ''}</p>
        <!-- Add more questions here as needed -->
        <hr>
        <p>Thanks, ${data.userName}!</p>
      `,
    };

    // Send the email using SendGrid
    await sgMail.send(msg);

    // Optionally send yourself a copy
    // await sgMail.send({ ...msg, to: 'your-email@domain.com' });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Must include for CORS
      },
      body: JSON.stringify({ message: 'Email sent successfully!' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Must include for CORS
      },
      body: JSON.stringify({ error: 'Error sending email' })
    };
  }
};
