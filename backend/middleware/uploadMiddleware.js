const multer = require("multer");
const makeCloudinaryStorage = require("../utils/cloudinaryHelper");

const upload = multer({ storage: makeCloudinaryStorage() });

module.exports = upload;

