// netlify/functions/sendAssessment.js
const sgMail = require('@sendgrid/mail');

// Make sure to set your SendGrid API key as an environment variable in Netlify
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

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
