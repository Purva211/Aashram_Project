const ReceiptArchive = require("../models/ReceiptArchive");
const { issueReceipt } = require("../utils/receiptEngine");

// Create an ad-hoc Notice
exports.generateNotice = async (req, res) => {
  try {
    const { subject, noticeContent, targetBranches, outwardNo, date, to } = req.body;
    
    // In a real application, you might save an `Announcement` model first,
    // but here we just generate a receipt log directly for the notice.
    const dynamicData = {
      subject: subject,
      noticeContent: noticeContent,
      to: to,
      outwardNo: outwardNo || 'NOT-' + Date.now(),
      date: date || new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      authorName: req.user.name || "Admin",
      branchName: req.user.branch ? "Branch" : "Main Trust"
    };

    const archive = await issueReceipt({
      category: 'Notice',
      year: new Date().getFullYear(),
      dynamicData,
      generatedBy: req.user._id,
      generatedByModel: req.user.role || 'Trustee' // Fallback to Trustee if undefined
    });

    res.status(201).json({ success: true, data: archive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all receipts (with role-based filtering)
exports.getReceipts = async (req, res) => {
  try {
    const { category, branchId, search } = req.query;
    
    let query = {};

    // Role Based Filtering
    if (req.user.role === "BranchManager") {
      // Can only see their branch receipts, and only specific categories
      query.branchId = req.user.branch;
      query.category = { $in: ['Branch Donation', 'Annadan', 'Prasad'] };
    } else if (req.user.role === "Accountant") {
      // Can only see financial receipts
      query.category = { $in: ['Payment', 'Expense', 'Donation'] };
    } else if (req.user.role === "Trustee" || req.user.role === "Admin") {
      // Can see most things, Trustee maybe restricted from Expense/Payment
      if (req.user.role === "Trustee") {
        query.category = { $nin: ['Expense', 'Payment'] };
      }
    } else if (req.user.role === "Devotee") {
       // Only their own receipts - assuming we can link via `referenceId` or `dynamicData.donorName`
       // This needs careful implementation. For now, empty list for devotees unless specified
       query.generatedBy = req.user._id; // simplistic
    }

    if (category && category !== "All") {
       query.category = category;
    }
    
    if (branchId && branchId !== "All" && req.user.role !== "BranchManager") {
       query.branchId = branchId;
    }

    if (search) {
       query.receiptNumber = { $regex: search, $options: "i" };
    }

    const receipts = await ReceiptArchive.find(query)
      .populate('generatedBy', 'name fullName displayName')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
