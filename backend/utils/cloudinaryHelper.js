const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const makeCloudinaryStorage = (subfolder = "", filenameGenerator = null) => {
  return {
    _handleFile: function (req, file, cb) {
      // 1. Generate filename using generator or default
      if (filenameGenerator) {
        filenameGenerator(req, file, (err, name) => {
          if (err) return cb(err);
          proceed(name);
        });
      } else {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
        proceed(filename);
      }

      function proceed(filename) {
        const relativeDest = subfolder ? path.join("uploads", subfolder) : "uploads";
        const localPath = path.join(relativeDest, filename);

        // Ensure directory exists
        if (!fs.existsSync(relativeDest)) {
          fs.mkdirSync(relativeDest, { recursive: true });
        }

        // 2. Write file locally
        const outStream = fs.createWriteStream(localPath);
        file.stream.pipe(outStream);
        
        outStream.on("error", cb);
        outStream.on("finish", async () => {
          try {
            // 3. Determine resource type
            let resource_type = "auto";
            if (file.mimetype.startsWith("video/")) {
              resource_type = "video";
            } else if (file.mimetype.startsWith("audio/")) {
              resource_type = "video";
            } else if (file.mimetype === "application/pdf") {
              resource_type = "raw";
            }

            // 4. Upload to Cloudinary
            const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
            const cloudinaryFolder = subfolder ? `aashram_uploads/${subfolder}` : "aashram_uploads";
            const publicId = resource_type === "raw" ? filename : nameWithoutExt;
            
            const result = await cloudinary.uploader.upload(localPath, {
              folder: cloudinaryFolder,
              public_id: publicId,
              resource_type: resource_type,
              use_filename: true,
              unique_filename: false
            });

            // 5. Clean up local temp file
            if (fs.existsSync(localPath)) {
              fs.unlinkSync(localPath);
            }

            // 6. Callback with file info, returning Cloudinary secure URL as path
            cb(null, {
              destination: relativeDest,
              filename: filename,
              path: result.secure_url,
              size: outStream.bytesWritten
            });
          } catch (err) {
            if (fs.existsSync(localPath)) {
              fs.unlinkSync(localPath);
            }
            cb(err);
          }
        });
      }
    },

    _removeFile: function (req, file, cb) {
      fs.unlink(file.path, cb);
    }
  };
};

module.exports = makeCloudinaryStorage;
