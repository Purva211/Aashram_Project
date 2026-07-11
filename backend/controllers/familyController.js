const Devotee = require("../models/Devotee");
const Sequence = require("../models/Sequence");
const mongoose = require("mongoose");

// Helper: trace relation to Family Head
const getRelationToHead = async (devotee, root) => {
  if (!devotee || !root) return "";
  if (devotee._id.toString() === root._id.toString()) return "Family Head";
  
  // Check spouse of root
  if (root.spouseId && root.spouseId.toString() === devotee._id.toString()) {
    return root.gender === "Male" ? "Wife" : "Husband";
  }
  if (devotee.spouseId && devotee.spouseId.toString() === root._id.toString()) {
    return devotee.gender === "Male" ? "Husband" : "Wife";
  }

  // Trace up to root
  let current = devotee;
  let path = [];
  while (current && current._id.toString() !== root._id.toString()) {
    path.push(current);
    if (current.fatherId) {
      current = await Devotee.findById(current.fatherId);
    } else if (current.motherId) {
      current = await Devotee.findById(current.motherId);
    } else {
      break;
    }
  }

  if (current && current._id.toString() === root._id.toString()) {
    const depth = path.length;
    if (depth === 1) {
      return devotee.gender === "Female" ? "Daughter" : "Son";
    } else if (depth === 2) {
      return devotee.gender === "Female" ? "Granddaughter" : "Grandson";
    } else if (depth === 3) {
      return devotee.gender === "Female" ? "Great-Granddaughter" : "Great-Grandson";
    } else {
      return `Descendant (Gen ${depth + 1})`;
    }
  }

  // Check if married to a descendant
  if (devotee.spouseId) {
    const spouse = await Devotee.findById(devotee.spouseId);
    if (spouse) {
      const spouseRelation = await getRelationToHead(spouse, root);
      if (spouseRelation === "Family Head") {
        return devotee.gender === "Male" ? "Husband" : "Wife";
      }
      if (spouseRelation === "Son") return "Daughter-in-Law";
      if (spouseRelation === "Daughter") return "Son-in-Law";
      if (spouseRelation === "Grandson") return "Granddaughter-in-Law";
      if (spouseRelation === "Granddaughter") return "Grandson-in-Law";
      return `${spouseRelation}'s Spouse`;
    }
  }

  return "Family Member";
};

// GET /api/family/search
exports.searchFamilies = async (req, res) => {
  try {
    const {
      q, state, district, city, taluka, village, branchId, surname,
      familyHead, minMembers, maxMembers, generationCount, sortBy, sortOrder,
      page = 1, limit = 20, showAll
    } = req.query;

    const matchCriteria = { isDeleted: { $ne: true } };

    // Role-based restrictions
    if (req.user.role === 'BranchManager') {
      matchCriteria.branch = req.user.branch;
    } else if (req.user.role === 'Devotee') {
      matchCriteria.familyRootId = req.user.familyRootId;
    }

    // Direct filter mapping
    if (state) matchCriteria.normalizedState = state.toLowerCase().trim();
    if (city) matchCriteria.normalizedCity = city.toLowerCase().trim();
    if (village) matchCriteria.normalizedVillage = village.toLowerCase().trim();
    if (district) matchCriteria.district = { $regex: new RegExp(`^${district.trim()}$`, "i") };
    if (taluka) matchCriteria.taluka = { $regex: new RegExp(`^${taluka.trim()}$`, "i") };
    if (branchId) matchCriteria.branch = new mongoose.Types.ObjectId(branchId);
    if (surname) matchCriteria.normalizedSurname = surname.toLowerCase().trim();

    // Global query mapping
    if (q) {
      const searchTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (searchTokens.length > 0) {
        matchCriteria.searchTokens = { $all: searchTokens };
      }
    }

    // Define base filter for family head (or families)
    const familyHeadCriteria = { ...matchCriteria };
    
    // Default to searching family heads unless querying for raw devotees
    if (familyHead === "true" || showAll === "true" || !q) {
      familyHeadCriteria.isFamilyHead = true;
    }

    // Aggregation pipeline for families
    const familiesPipeline = [
      { $match: familyHeadCriteria },
      {
        $lookup: {
          from: 'devotees',
          localField: 'familyRootId',
          foreignField: 'familyRootId',
          as: 'members'
        }
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: '$members',
                as: 'm',
                cond: { $ne: ['$$m.isDeleted', true] }
              }
            }
          },
          generationLevels: {
            $map: {
              input: {
                $filter: {
                  input: '$members',
                  as: 'm',
                  cond: { $ne: ['$$m.isDeleted', true] }
                }
              },
              as: 'm',
              in: '$$m.generationLevel'
            }
          }
        }
      },
      {
        $addFields: {
          generationCount: {
            $cond: {
              if: { $gt: [{ $size: '$generationLevels' }, 0] },
              then: { $max: '$generationLevels' },
              else: 1
            }
          }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchDetails'
        }
      },
      {
        $addFields: {
          branch: { $arrayElemAt: ['$branchDetails', 0] }
        }
      }
    ];

    // Filter by member count and generation count
    const postFilter = {};
    if (minMembers) postFilter.memberCount = { $gte: parseInt(minMembers) };
    if (maxMembers) {
      postFilter.memberCount = postFilter.memberCount || {};
      postFilter.memberCount.$lte = parseInt(maxMembers);
    }
    if (generationCount) postFilter.generationCount = parseInt(generationCount);

    if (Object.keys(postFilter).length > 0) {
      familiesPipeline.push({ $match: postFilter });
    }

    // Sort mappings
    let sortStage = {};
    const order = sortOrder === 'desc' ? -1 : 1;
    if (sortBy === 'memberCount') {
      sortStage.memberCount = order;
    } else if (sortBy === 'generationCount') {
      sortStage.generationCount = order;
    } else if (sortBy === 'familyName') {
      sortStage.normalizedFamilyName = order;
    } else if (sortBy === 'familyHead') {
      sortStage.normalizedFullName = order;
    } else if (sortBy === 'recentlyCreated' || sortBy === 'createdAt') {
      sortStage.createdAt = -1;
    } else if (sortBy === 'oldest') {
      sortStage.createdAt = 1;
    } else if (sortBy === 'recentlyUpdated' || sortBy === 'updatedAt') {
      sortStage.updatedAt = -1;
    } else {
      sortStage.createdAt = -1;
    }
    familiesPipeline.push({ $sort: sortStage });

    // Paginate facet
    const skip = (parseInt(page) - 1) * parseInt(limit);
    familiesPipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: parseInt(limit) }]
      }
    });

    const aggregateResults = await Devotee.aggregate(familiesPipeline);
    const totalFamilies = aggregateResults[0]?.metadata[0]?.total || 0;
    const familiesData = aggregateResults[0]?.data || [];

    // Clean up response arrays
    familiesData.forEach(fam => {
      delete fam.members;
      delete fam.generationLevels;
      delete fam.branchDetails;
      delete fam.password;
      delete fam.aadhaar;
    });

    // Devotees query (only if global search query is active)
    let devotees = [];
    if (q) {
      devotees = await Devotee.find(matchCriteria)
        .populate('branch')
        .select('-password -aadhaar -searchTokens')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.status(200).json({
      success: true,
      data: familiesData,
      families: familiesData,
      devotees,
      pagination: {
        total: totalFamilies,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalFamilies / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/family/by-city
exports.getFamiliesByCity = async (req, res) => {
  try {
    const { state, city } = req.query;
    if (!state || !city) {
      return res.status(400).json({ success: false, message: "State and City are required" });
    }
    
    const matchCriteria = {
      normalizedState: state.toLowerCase().trim(),
      normalizedCity: city.toLowerCase().trim(),
      isFamilyHead: true,
      isDeleted: { $ne: true }
    };
    
    if (req.user.role === 'BranchManager') {
      matchCriteria.branch = req.user.branch;
    }
    
    const pipeline = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'devotees',
          localField: 'familyRootId',
          foreignField: 'familyRootId',
          as: 'members'
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchDetails'
        }
      },
      {
        $addFields: {
          memberCount: { 
            $size: {
              $filter: {
                input: '$members',
                as: 'm',
                cond: { $ne: ['$$m.isDeleted', true] }
              }
            }
          },
          branch: { $arrayElemAt: ['$branchDetails', 0] }
        }
      },
      {
        $project: {
          members: 0,
          branchDetails: 0,
          password: 0,
          aadhaar: 0
        }
      }
    ];
    
    const families = await Devotee.aggregate(pipeline);
    const totalDevotees = families.reduce((acc, f) => acc + f.memberCount, 0);
    
    res.status(200).json({
      success: true,
      totalFamilies: families.length,
      totalDevotees,
      data: families
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Dropdown Dynamic Filters endpoints
exports.getStates = async (req, res) => {
  try {
    const match = { isDeleted: { $ne: true }, state: { $ne: null, $ne: "" } };
    if (req.user.role === 'BranchManager') match.branch = req.user.branch;
    const states = await Devotee.distinct("state", match);
    res.status(200).json({ success: true, data: states.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    const match = { isDeleted: { $ne: true }, district: { $ne: null, $ne: "" } };
    if (state) match.normalizedState = state.toLowerCase().trim();
    if (req.user.role === 'BranchManager') match.branch = req.user.branch;
    const districts = await Devotee.distinct("district", match);
    res.status(200).json({ success: true, data: districts.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { state, district } = req.query;
    const match = { isDeleted: { $ne: true }, city: { $ne: null, $ne: "" } };
    if (state) match.normalizedState = state.toLowerCase().trim();
    if (district) match.district = district.trim();
    if (req.user.role === 'BranchManager') match.branch = req.user.branch;
    const cities = await Devotee.distinct("city", match);
    res.status(200).json({ success: true, data: cities.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVillages = async (req, res) => {
  try {
    const { state, city } = req.query;
    const match = { isDeleted: { $ne: true }, village: { $ne: null, $ne: "" } };
    if (state) match.normalizedState = state.toLowerCase().trim();
    if (city) match.normalizedCity = city.toLowerCase().trim();
    if (req.user.role === 'BranchManager') match.branch = req.user.branch;
    const villages = await Devotee.distinct("village", match);
    res.status(200).json({ success: true, data: villages.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/family/search-suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    const searchTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const matchCriteria = {
      isDeleted: { $ne: true },
      searchTokens: { $all: searchTokens }
    };
    
    if (req.user.role === 'BranchManager') {
      matchCriteria.branch = req.user.branch;
    }
    
    const devotees = await Devotee.find(matchCriteria)
      .select('name devoteeId familyId isFamilyHead state city village')
      .limit(10);
      
    res.status(200).json({ success: true, data: devotees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/family/tree/:rootId
exports.getFamilyTree = async (req, res) => {
  try {
    const { rootId } = req.params;
    
    if (req.user.role === 'Devotee') {
      if (req.user.familyRootId && req.user.familyRootId.toString() !== rootId) {
        return res.status(403).json({ success: false, message: "Access denied. You can only view your own family tree." });
      }
    }
    
    const members = await Devotee.find({
      familyRootId: rootId,
      isDeleted: { $ne: true }
    }).populate('branch');
    
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/family/member/:devoteeId
exports.getMemberDetails = async (req, res) => {
  try {
    const { devoteeId } = req.params;
    
    const devotee = await Devotee.findById(devoteeId).populate('branch');
    if (!devotee) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    
    if (req.user.role === 'Devotee') {
      if (req.user.familyRootId && devotee.familyRootId && req.user.familyRootId.toString() !== devotee.familyRootId.toString()) {
        return res.status(403).json({ success: false, message: "Access denied. You can only view members of your own family." });
      }
    }
    
    const father = devotee.fatherId ? await Devotee.findById(devotee.fatherId) : null;
    const mother = devotee.motherId ? await Devotee.findById(devotee.motherId) : null;
    const spouse = devotee.spouseId ? await Devotee.findById(devotee.spouseId) : null;
    
    let brothers = [];
    let sisters = [];
    if (devotee.fatherId || devotee.motherId) {
      const sibQuery = {
        _id: { $ne: devotee._id },
        isDeleted: { $ne: true }
      };
      if (devotee.fatherId) sibQuery.fatherId = devotee.fatherId;
      else sibQuery.motherId = devotee.motherId;
      
      const siblings = await Devotee.find(sibQuery);
      brothers = siblings.filter(s => s.gender === 'Male');
      sisters = siblings.filter(s => s.gender === 'Female');
    }
    
    const children = await Devotee.find({
      $or: [{ fatherId: devotee._id }, { motherId: devotee._id }],
      isDeleted: { $ne: true }
    });
    
    let grandchildren = [];
    if (children.length > 0) {
      const childIds = children.map(c => c._id);
      grandchildren = await Devotee.find({
        $or: [
          { fatherId: { $in: childIds } },
          { motherId: { $in: childIds } }
        ],
        isDeleted: { $ne: true }
      });
    }
    
    let relationToHead = "Family Member";
    if (devotee.familyRootId) {
      const root = await Devotee.findById(devotee.familyRootId);
      if (root) {
        relationToHead = await getRelationToHead(devotee, root);
      }
    }
    
    const Donation = require("../models/Donation");
    const Annadaan = require("../models/Annadaan");
    
    const donationQuery = {
      $or: [
        { userId: devotee._id }
      ]
    };
    if (devotee.email) donationQuery.$or.push({ email: devotee.email.trim().toLowerCase() });
    if (devotee.mobile) donationQuery.$or.push({ phone: devotee.mobile.trim() });
    
    const donations = await Donation.find(donationQuery).sort({ createdAt: -1 });
    
    const annadaanQuery = {
      $or: [
        { userId: devotee._id }
      ]
    };
    if (devotee.email) annadaanQuery.$or.push({ email: devotee.email.trim().toLowerCase() });
    if (devotee.mobile) annadaanQuery.$or.push({ phone: devotee.mobile.trim() });
    
    const annadaan = await Annadaan.find(annadaanQuery).sort({ date: -1 });
    
    const devoteeObj = devotee.toObject();
    if (req.user.role !== 'Admin' && req.user.role !== 'Trustee' && req.user._id.toString() !== devotee._id.toString()) {
      if (devoteeObj.aadhaar) {
        devoteeObj.aadhaar = devoteeObj.aadhaar.replace(/.(?=.{4})/g, 'X');
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        devotee: devoteeObj,
        relationships: {
          father,
          mother,
          spouse,
          brothers,
          sisters,
          children,
          grandchildren,
          relationToHead
        },
        donations,
        annadaan
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/family/create
exports.createFamily = async (req, res) => {
  try {
    const data = { ...req.body };
    data.isFamilyHead = true;
    
    if (req.user.role === 'BranchManager') {
      data.branch = req.user.branch;
    }
    
    const newHead = new Devotee(data);
    await newHead.save();
    
    res.status(201).json({ success: true, data: newHead });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/family/create-self-root
exports.createSelfRoot = async (req, res) => {
  try {
    if (req.user.familyRootId) {
      return res.status(400).json({ success: false, message: "Devotee already belongs to a family tree" });
    }
    
    const devotee = await Devotee.findById(req.user._id);
    if (!devotee) {
      return res.status(404).json({ success: false, message: "Devotee not found" });
    }
    
    devotee.isFamilyHead = true;
    devotee.gotra = req.body.gotra;
    devotee.kuldevta = req.body.kuldevta;
    devotee.village = req.body.village;
    devotee.taluka = req.body.taluka;
    devotee.district = req.body.district;
    devotee.state = req.body.state;
    devotee.generationLevel = 1;
    
    await devotee.save();
    res.status(200).json({ success: true, data: devotee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/family/join-self
exports.joinSelf = async (req, res) => {
  try {
    const { relativeId, relationshipType } = req.body;
    if (req.user.familyRootId) {
      return res.status(400).json({ success: false, message: "Devotee already belongs to a family tree" });
    }
    
    const relative = await Devotee.findById(relativeId);
    if (!relative) {
      return res.status(404).json({ success: false, message: "Relative member not found" });
    }
    
    const devotee = await Devotee.findById(req.user._id);
    if (!devotee) {
      return res.status(404).json({ success: false, message: "Devotee not found" });
    }
    
    devotee.familyId = relative.familyId;
    devotee.familyRootId = relative.familyRootId;
    
    const relLevel = relative.generationLevel || 1;
    if (relationshipType === "Son" || relationshipType === "Daughter") {
      devotee.generationLevel = relLevel + 1;
      if (relative.gender === "Male") {
        devotee.fatherId = relative._id;
        if (relative.spouseId) devotee.motherId = relative.spouseId;
      } else {
        devotee.motherId = relative._id;
        if (relative.spouseId) devotee.fatherId = relative.spouseId;
      }
    } else if (relationshipType === "Spouse") {
      devotee.generationLevel = relLevel;
      devotee.spouseId = relative._id;
      relative.spouseId = devotee._id;
      await relative.save();
    } else if (relationshipType === "Father") {
      devotee.generationLevel = Math.max(1, relLevel - 1);
      relative.fatherId = devotee._id;
      await relative.save();
    } else if (relationshipType === "Mother") {
      devotee.generationLevel = Math.max(1, relLevel - 1);
      relative.motherId = devotee._id;
      await relative.save();
    }
    
    await devotee.save();
    res.status(200).json({ success: true, data: devotee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/family/add-member
exports.addMember = async (req, res) => {
  try {
    const { devoteeData, relationshipType, relativeId } = req.body;
    const relative = await Devotee.findById(relativeId);
    if (!relative) {
      return res.status(404).json({ success: false, message: "Relative member not found" });
    }
    
    if (req.user.role === 'BranchManager') {
      devoteeData.branch = req.user.branch;
    }
    
    devoteeData.familyId = relative.familyId;
    devoteeData.familyRootId = relative.familyRootId;
    
    const relLevel = relative.generationLevel || 1;
    let newLevel = relLevel;

    if (relationshipType === "Son" || relationshipType === "Daughter") {
      newLevel = relLevel + 1;
      if (relative.gender === "Male") {
        devoteeData.fatherId = relative._id;
        if (relative.spouseId) devoteeData.motherId = relative.spouseId;
      } else {
        devoteeData.motherId = relative._id;
        if (relative.spouseId) devoteeData.fatherId = relative.spouseId;
      }
    } else if (relationshipType === "Father") {
      newLevel = Math.max(1, relLevel - 1);
      devoteeData.gender = "Male";
    } else if (relationshipType === "Mother") {
      newLevel = Math.max(1, relLevel - 1);
      devoteeData.gender = "Female";
    } else if (relationshipType === "Spouse") {
      newLevel = relLevel;
      devoteeData.spouseId = relative._id;
      if (devoteeData.gender === relative.gender) {
        devoteeData.gender = relative.gender === "Male" ? "Female" : "Male";
      }
    } else if (relationshipType === "Brother" || relationshipType === "Sister") {
      newLevel = relLevel;
      devoteeData.fatherId = relative.fatherId;
      devoteeData.motherId = relative.motherId;
    }
    
    devoteeData.generationLevel = newLevel;
    const newMember = new Devotee(devoteeData);
    await newMember.save();
    
    let relativeModified = false;
    if (relationshipType === "Father") {
      relative.fatherId = newMember._id;
      relativeModified = true;
    } else if (relationshipType === "Mother") {
      relative.motherId = newMember._id;
      relativeModified = true;
    } else if (relationshipType === "Spouse") {
      relative.spouseId = newMember._id;
      relativeModified = true;
    }
    
    if (relativeModified) {
      await relative.save();
    }
    
    res.status(201).json({ success: true, data: newMember });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/family/reports/data
exports.getFamilyReportsData = async (req, res) => {
  try {
    const branchMatch = {};
    if (req.user.role === 'BranchManager') {
      branchMatch.branch = req.user.branch;
    }
    
    const totalFamilies = await Devotee.countDocuments({
      isFamilyHead: true,
      isDeleted: { $ne: true },
      ...branchMatch
    });
    
    const totalDevotees = await Devotee.countDocuments({
      isDeleted: { $ne: true },
      ...branchMatch
    });
    
    const genderAggregation = await Devotee.aggregate([
      { $match: { isDeleted: { $ne: true }, ...branchMatch } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);
    const genderBreakdown = { Male: 0, Female: 0, Other: 0 };
    genderAggregation.forEach(g => {
      if (g._id) genderBreakdown[g._id] = g.count;
    });

    // Calculate generationCounts
    const generationAggregation = await Devotee.aggregate([
      { $match: { isDeleted: { $ne: true }, ...branchMatch } },
      { $group: { _id: "$generationLevel", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const generationCounts = {};
    generationAggregation.forEach(g => {
      const level = g._id ? `Level ${g._id}` : "Level 1";
      generationCounts[level] = g.count;
    });
    
    const familyCounts = await Devotee.aggregate([
      { $match: { isDeleted: { $ne: true }, familyId: { $exists: true, $ne: null, $ne: "" }, ...branchMatch } },
      {
        $group: {
          _id: "$familyId",
          memberCount: { $sum: 1 },
          familyRootId: { $first: "$familyRootId" }
        }
      },
      { $sort: { memberCount: -1 } }
    ]);
    
    let largestFamilySize = 0;
    let largestFamilyName = "N/A";
    const largestFamiliesList = [];
    
    if (familyCounts.length > 0) {
      largestFamilySize = familyCounts[0].memberCount;
      
      const topFamilyRootIds = familyCounts.slice(0, 10).map(f => f.familyRootId);
      const heads = await Devotee.find({ _id: { $in: topFamilyRootIds } }).populate('branch');
      const headsMap = {};
      heads.forEach(h => {
        headsMap[h._id.toString()] = h;
      });
      
      const firstHead = headsMap[familyCounts[0].familyRootId?.toString()];
      if (firstHead) largestFamilyName = firstHead.name;
      
      familyCounts.slice(0, 10).forEach(fc => {
        const head = headsMap[fc.familyRootId?.toString()];
        if (head) {
          largestFamiliesList.push({
            familyId: fc._id,
            headName: head.name,
            memberCount: fc.memberCount,
            size: fc.memberCount,
            gotra: head.gotra || "N/A",
            state: head.state || "N/A",
            city: head.city || "N/A",
            branch: head.branch?.name || "Main Trust",
            branchName: head.branch?.name || "Main Trust"
          });
        }
      });
    }
    
    const branchAggregation = await Devotee.aggregate([
      { $match: { isDeleted: { $ne: true }, ...branchMatch } },
      {
        $group: {
          _id: "$branch",
          memberCount: { $sum: 1 },
          familyCount: {
            $sum: { $cond: [{ $eq: ["$isFamilyHead", true] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "branches",
          localField: "_id",
          foreignField: "_id",
          as: "branchDetails"
        }
      },
      {
        $addFields: {
          branchName: {
            $ifNull: [{ $arrayElemAt: ["$branchDetails.name", 0] }, "Main Trust"]
          }
        }
      },
      { $project: { branchDetails: 0 } },
      { $sort: { memberCount: -1 } }
    ]);

    const branchCounts = {};
    branchAggregation.forEach(b => {
      branchCounts[b.branchName] = b.memberCount;
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalFamilies,
        totalDevotees,
        largestFamilySize,
        largestFamilyName,
        genderBreakdown,
        generationCounts,
        branchCounts
      },
      largestFamiliesList,
      branchSummaries: branchAggregation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
