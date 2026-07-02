const { generateCorrespondencePdf } = require('./utils/correspondenceEngine');

async function run() {
  try {
    const data = {
      letterDate: '2026-07-01',
      subject: 'Test Correspondence Letter',
      recipient: {
        name: 'John Doe',
        organization: 'Example Corp',
        address: '123 Main St',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        email: 'john@example.com',
        mobile: '1234567890'
      },
      content: {
        body: '<p>Hello <strong>John</strong>,</p><p>This is a test correspondence.</p><ul><li>Item 1</li><li>Item 2</li></ul>'
      }
    };
    
    const result = await generateCorrespondencePdf(data, 'CORR-2026-001');
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
