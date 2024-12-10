const crypto = require('crypto');

const verifyPayUHash = (req, res, next) => {
  try {
    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
    } = req.body;

    const salt = process.env.PAYU_SALT;

    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    console.log('Hash Verification:', {
      receivedHash: hash,
      calculatedHash,
      hashString 
    });

    if (hash !== calculatedHash) {
      console.error('Hash verification failed');
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
    }

    next();
  } catch (error) {
    console.error('Hash verification error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
};

module.exports = verifyPayUHash; 