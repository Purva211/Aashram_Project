const ReceiptArchive = require("../models/ReceiptArchive");
const Donation = require("../models/Donation");
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
      // Trustee and Admin can see everything natively (or filter as they choose)
    } else if (req.user.role === "Devotee") {
       // Only their own receipts
       query.generatedBy = req.user._id; 
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

    // Prevent fetching duplicates from ReceiptArchive since we fetch Donations natively
    let receipts = [];
    if (query.category !== "Donation") {
      let archiveQuery = { ...query };
      
      // Deep clone category object if it exists to avoid mutating the original query object
      if (archiveQuery.category && typeof archiveQuery.category === 'object') {
        archiveQuery.category = { ...archiveQuery.category };
      }
      
      if (!archiveQuery.category) {
        archiveQuery.category = { $ne: 'Donation' };
      } else if (archiveQuery.category.$in) {
        archiveQuery.category.$in = archiveQuery.category.$in.filter(c => c !== 'Donation');
      } else if (archiveQuery.category.$nin) {
        archiveQuery.category.$nin = [...archiveQuery.category.$nin, 'Donation'];
      }
      
      receipts = await ReceiptArchive.find(archiveQuery)
        .populate('generatedBy', 'name fullName displayName')
        .populate('branchId', 'name')
        .sort({ createdAt: -1 })
        .lean();
    }

    let mergedReceipts = [...receipts];

    // Fetch approved donations if Category filter allows it
    const effectiveCategory = query.category || category;
    if (!effectiveCategory || effectiveCategory === "All" || effectiveCategory === "Donation" || (effectiveCategory.$in && effectiveCategory.$in.includes("Donation"))) {
      const donationQuery = { status: "APPROVED", receiptNumber: { $exists: true } };
      
      if (req.user.role === "BranchManager") {
        donationQuery.branchId = req.user.branch;
      } else if (branchId && branchId !== "All") {
        donationQuery.branchId = branchId;
      }

      if (search) {
        donationQuery.$or = [
          { receiptNumber: { $regex: search, $options: "i" } },
          { donorName: { $regex: search, $options: "i" } }
        ];
      }

      const donations = await Donation.find(donationQuery)
        .populate('approvedBy', 'name fullName displayName')
        .populate('branchId', 'name')
        .sort({ approvalDate: -1 })
        .lean();

      const mappedDonations = donations.map(d => ({
        _id: d._id,
        receiptNumber: d.receiptNumber,
        category: "Donation",
        branchId: d.branchId,
        generatedBy: d.approvedBy,
        createdAt: d.createdAt,
        approvalDate: d.approvalDate,
        lastReceiptDownloadedAt: d.lastReceiptDownloadedAt,
        pdfUrl: `/api/donations/${d._id}/receipt`,
        dynamicData: {
          donorName: d.donorName,
          amount: d.amount,
          donationReference: d.donationReference
        }
      }));

      mergedReceipts = [...mergedReceipts, ...mappedDonations];
      
      // Sort combined array by most recent date (createdAt or approvalDate)
      mergedReceipts.sort((a, b) => {
        const dateA = new Date(a.approvalDate || a.createdAt);
        const dateB = new Date(b.approvalDate || b.createdAt);
        return dateB - dateA;
      });
    }

    res.status(200).json({ success: true, data: mergedReceipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
