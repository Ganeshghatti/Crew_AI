const transactionModel = require("../../models/Transactions");
const userModel = require("../../models/User");

exports.GetTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const transactions = await transactionModel
      .find()
      .populate('userId', 'email username')
      .populate('campaignId', 'title link')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await transactionModel.countDocuments();

    res.status(200).json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.SearchTransactions = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Create search query
    let query = {};
    
    // If searchTerm is a valid email, search by user email
    if (searchTerm.includes('@')) {
      const user = await userModel.findOne({ email: searchTerm });
      if (user) {
        query.userId = user._id;
      }
    } else {
      // Search by txnid or userId
      query = {
        $or: [
          { txnid: { $regex: searchTerm, $options: 'i' } },
          { userId: searchTerm }
        ]
      };
    }

    const transactions = await transactionModel
      .find(query)
      .populate('userId', 'email username')
      .populate('campaignId', 'title link')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await transactionModel.countDocuments(query);

    res.status(200).json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total
    });
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
