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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
    // Parse the JSON body from the form submission
    const data = JSON.parse(event.body);

    // Define the recommendation messages for each question
    const recommendations = {
      q1: {
        no: "Develop a formal revenue recognition policy that follows ASC 606's five-step model. This will ensure your team applies the rules consistently across all transactions.",
        yes: "Ensure your written revenue recognition policy is kept up to date and that all relevant team members are trained on it. Refresh the policy when new guidance is issued or when your business model changes."
      },
      q2: {
        no: "Review your contracts and identify every distinct product or service you promise to customers. Update your accounting for any performance obligations you may have missed.",
        yes: "Continue to verify new or unusual contracts to ensure no performance obligations are overlooked. Maintain a checklist of typical obligations to ensure consistency."
      },
      q3: {
        no: "Adjust your revenue recognition timing so that revenue is recorded only when the customer has actually received the goods or services. Record any advance payments as deferred revenue until you fulfill the obligation.",
        yes: "Maintain this practice and implement additional checks at period-end to ensure all revenue is recorded in the correct period (avoiding any early or late cut-off issues)."
      },
      q4: {
        no: "Implement a process to organize and save all relevant documents for each sale. Proper documentation is crucial – auditors will review contracts, purchase orders, and delivery records.",
        yes: "Ensure these records remain easily accessible and consistently filed to streamline the audit process and substantiate your revenue recognition decisions."
      },
      q5: {
        no: "Update your process to separately value each distinct component of bundled sales (using standalone selling prices) and allocate revenue to each component as required by GAAP.",
        yes: "Continue applying this approach and periodically review your allocations to ensure your methods for estimating each component's fair value remain accurate and up-to-date.",
        na: "If your business model changes to include bundled products or multi-period deals in the future, establish a process to allocate transaction prices to each component."
      }
    };

    // Determine the recommendation for each question based on the answer (convert answer to lowercase in case)
    const recQ1 = recommendations.q1[(data.q1 || '').toLowerCase()] || '';
    const recQ2 = recommendations.q2[(data.q2 || '').toLowerCase()] || '';
    const recQ3 = recommendations.q3[(data.q3 || '').toLowerCase()] || '';
    const recQ4 = recommendations.q4[(data.q4 || '').toLowerCase()] || '';
    const recQ5 = recommendations.q5[(data.q5 || '').toLowerCase()] || '';

    // Build the HTML email with inline CSS styling
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 15px; border: 1px solid #eee; border-radius: 8px; background-color: #fff; }
            h1 { color: #2c3e50; }
            .question { margin-bottom: 20px; }
            .question-text { font-weight: 600; margin-bottom: 5px; }
            .answer, .recommendation { margin-left: 15px; }
            .recommendation { border-left: 3px solid #3498db; padding-left: 10px; margin-top: 5px; }
            .footer { margin-top: 20px; font-size: 14px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Revenue Recognition Assessment Results</h1>
            <p>Dear ${data.userName},</p>
            <p>Thank you for completing the ASC 606 Self-Assessment. Below are your responses along with our tailored recommendations:</p>
            
            <div class="question">
              <div class="question-text">1. Do you have a written revenue recognition policy aligned with US GAAP (ASC 606)?</div>
              <div class="answer"><strong>Your Answer:</strong> ${data.q1}</div>
              <div class="recommendation"><strong>Recommendation:</strong> ${recQ1}</div>
            </div>
            
            <div class="question">
              <div class="question-text">2. Have you identified all distinct performance obligations in each customer contract?</div>
              <div class="answer"><strong>Your Answer:</strong> ${data.q2}</div>
              <div class="recommendation"><strong>Recommendation:</strong> ${recQ2}</div>
            </div>
            
            <div class="question">
              <div class="question-text">3. Do you only recognize revenue after fulfilling the performance obligation (e.g., after delivering the product or service)?</div>
              <div class="answer"><strong>Your Answer:</strong> ${data.q3}</div>
              <div class="recommendation"><strong>Recommendation:</strong> ${recQ3}</div>
            </div>
            
            <div class="question">
              <div class="question-text">4. Do you maintain clear documentation for each revenue transaction?</div>
              <div class="answer"><strong>Your Answer:</strong> ${data.q4}</div>
              <div class="recommendation"><strong>Recommendation:</strong> ${recQ4}</div>
            </div>
            
            <div class="question">
              <div class="question-text">5. If you bundle products/services or have multi-period deals, do you allocate the transaction price appropriately?</div>
              <div class="answer"><strong>Your Answer:</strong> ${data.q5}</div>
              <div class="recommendation"><strong>Recommendation:</strong> ${recQ5}</div>
            </div>
            
            <p class="footer">Thanks, <br>The ASC 606 Self-Assessment Team</p>
          </div>
        </body>
      </html>
    `;

    // Build your email message
    const msg = {
      to: data.userEmail, // The email address from the form
      from: 'john@zi.consulting', // Must be a verified sender in SendGrid
      subject: 'Your Revenue Recognition Assessment Results',
      html: htmlContent,
    };

    // Send the email using SendGrid
    await sgMail.send(msg);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Email sent successfully!' })
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Error sending email' })
    };
  }
};
