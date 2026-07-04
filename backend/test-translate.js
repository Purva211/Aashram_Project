const translate = require('google-translate-api-x');

async function testTranslation() {
  try {
    const res1 = await translate('Vrushali Patil', { to: 'mr' });
    console.log('Vrushali Patil ->', res1.text);

    const res2 = await translate('Donation for Temple Construction', { to: 'mr' });
    console.log('Donation ->', res2.text);
    
    const res3 = await translate('Anything that be more usefull', { to: 'mr' });
    console.log('Usefull ->', res3.text);
    
  } catch (err) {
    console.error('Translation error:', err);
  }
}

testTranslation();
