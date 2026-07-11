const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Devotee = require("../models/Devotee");
const Sequence = require("../models/Sequence");
const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/../.env" });

const runMigration = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for family data migration...");

    // 1. Fetch all devotees
    const devotees = await Devotee.find({});
    console.log(`Found ${devotees.length} devotee records to migrate.`);

    // 2. Perform sequential migration to ensure unique counters
    for (let i = 0; i < devotees.length; i++) {
      const devotee = devotees[i];
      let modified = false;

      // Ensure devoteeId exists and is DEV-xxxxxx
      if (!devotee.devoteeId) {
        const seq = await Sequence.findOneAndUpdate(
          { sequenceName: "devoteeId" },
          { $inc: { currentValue: 1 } },
          { new: true, upsert: true }
        );
        devotee.devoteeId = `DEV-${seq.currentValue.toString().padStart(6, "0")}`;
        modified = true;
      }

      // If devotee is Family Head and has no familyId, generate familyId
      if (devotee.isFamilyHead && !devotee.familyId) {
        const seq = await Sequence.findOneAndUpdate(
          { sequenceName: "familyId" },
          { $inc: { currentValue: 1 } },
          { new: true, upsert: true }
        );
        devotee.familyId = `FAM-${seq.currentValue.toString().padStart(6, "0")}`;
        devotee.familyRootId = devotee._id;
        modified = true;
      }

      // If devotee is not family head but has no familyRootId, set familyRootId to self or resolve it
      if (!devotee.familyRootId) {
        devotee.familyRootId = devotee._id;
        modified = true;
      }
      
      // If devotee has familyRootId but no familyId, assign familyId from root or self
      if (devotee.familyRootId && !devotee.familyId) {
        if (devotee.familyRootId.toString() === devotee._id.toString()) {
          // generate
          const seq = await Sequence.findOneAndUpdate(
            { sequenceName: "familyId" },
            { $inc: { currentValue: 1 } },
            { new: true, upsert: true }
          );
          devotee.familyId = `FAM-${seq.currentValue.toString().padStart(6, "0")}`;
        } else {
          // fetch root
          const rootDev = await Devotee.findById(devotee.familyRootId);
          if (rootDev && rootDev.familyId) {
            devotee.familyId = rootDev.familyId;
          } else {
            // fallback generate
            const seq = await Sequence.findOneAndUpdate(
              { sequenceName: "familyId" },
              { $inc: { currentValue: 1 } },
              { new: true, upsert: true }
            );
            devotee.familyId = `FAM-${seq.currentValue.toString().padStart(6, "0")}`;
          }
        }
        modified = true;
      }

      // Ensure normalized fields are set
      const normalize = (val) => (val ? val.toString().toLowerCase().trim().replace(/\s+/g, " ") : "");
      
      const normName = normalize(devotee.name);
      const nameParts = normName.split(" ");
      const normSurname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : normName;
      const normState = normalize(devotee.state);
      const normCity = normalize(devotee.city);
      const normVillage = normalize(devotee.village);

      if (devotee.normalizedFullName !== normName) {
        devotee.normalizedFullName = normName;
        modified = true;
      }
      if (devotee.normalizedSurname !== normSurname) {
        devotee.normalizedSurname = normSurname;
        devotee.normalizedFamilyName = normSurname;
        modified = true;
      }
      if (devotee.normalizedState !== normState) {
        devotee.normalizedState = normState;
        modified = true;
      }
      if (devotee.normalizedCity !== normCity) {
        devotee.normalizedCity = normCity;
        modified = true;
      }
      if (devotee.normalizedVillage !== normVillage) {
        devotee.normalizedVillage = normVillage;
        modified = true;
      }

      // Generate searchTokens
      const tokens = new Set();
      const rawWords = [];
      
      if (devotee.name) rawWords.push(...devotee.name.toLowerCase().split(/\s+/));
      if (devotee.mobile) rawWords.push(devotee.mobile);
      if (devotee.email) rawWords.push(devotee.email.toLowerCase());
      if (devotee.devoteeId) rawWords.push(devotee.devoteeId.toLowerCase());
      if (devotee.familyId) rawWords.push(devotee.familyId.toLowerCase());
      if (devotee.city) rawWords.push(devotee.city.toLowerCase());
      if (devotee.village) rawWords.push(devotee.village.toLowerCase());
      if (devotee.taluka) rawWords.push(devotee.taluka.toLowerCase());
      if (devotee.district) rawWords.push(devotee.district.toLowerCase());
      if (devotee.state) rawWords.push(devotee.state.toLowerCase());
      if (devotee.gotra) rawWords.push(devotee.gotra.toLowerCase());

      rawWords.forEach(word => {
        if (!word) return;
        tokens.add(word);
        for (let i = 2; i <= word.length; i++) {
          tokens.add(word.substring(0, i));
        }
      });

      const tokenArray = Array.from(tokens);
      if (JSON.stringify(devotee.searchTokens) !== JSON.stringify(tokenArray)) {
        devotee.searchTokens = tokenArray;
        modified = true;
      }

      if (modified) {
        await devotee.save();
        console.log(`Migrated: ${devotee.name} (${devotee.devoteeId})`);
      }
    }

    console.log("Data migration successfully completed!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

runMigration();
