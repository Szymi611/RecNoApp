require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const VideoProcessor = require("./VideoProcessor");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
   
        const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, WebM and OGG video files are allowed.'));
        }
    },
    limits: {
        fileSize: 1000 * 1024 * 1024 // 500MB limit
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

(async () => {
  try {
    await fs.mkdir("uploads", { recursive: true });
    await fs.mkdir("output", { recursive: true });
    await fs.mkdir("temp", { recursive: true }); // Add temp directory for processing
  } catch (error) {
    console.error("Error creating directories:", error);
  }
})();

const processor = new VideoProcessor(process.env.OPENAI_API_KEY);

// Middleware
app.use(express.static("public"));
app.use("/output", express.static("output"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'No video file uploaded' });
    }
    console.log('File received:', req.file);

    console.log('File uploaded:', req.file);
    console.log('File size:', req.file.size);
    
    let outputDir = null;
    
    try {
        outputDir = path.join('output', path.parse(req.file.filename).name);
        console.log('Processing video. Output directory:', outputDir);
        
        // Process the video and get results
        const result = await processor.processVideo(req.file.path, outputDir);
        
        // Verify all required files exist
        const outputFiles = await fs.readdir(outputDir);
        console.log('Files in output directory after processing:', outputFiles);
        
        const videoFile = outputFiles.find(file => file.startsWith('original'));
        if (!videoFile) {
            throw new Error('Video file not found in output directory after processing');
        }

        const pdfFile = outputFiles.find(file => file.endsWith('.pdf'));
        const txtFile = outputFiles.find(file => file.endsWith('.txt'));

        if (!pdfFile || !txtFile) {
            throw new Error('PDF or TXT file missing from output');
        }

        // Only delete the source file after confirming all output files exist
        await fs.unlink(req.file.path).catch(err => {
            console.error('Warning: Could not delete source file:', err);
        });

        // Get the directory name for URLs
        const dirName = path.basename(outputDir);
        
        const response = {
            success: true,
            data: {
                summary: result.summary,
                dialogue: result.dialogue,
                pdfUrl: `/output/${dirName}/${pdfFile}`,
                txtUrl: `/output/${dirName}/${txtFile}`,
                videoUrl: `/output/${dirName}/${videoFile}`
            }
        };

        console.log('Sending success response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('Processing error:', error);
        
        // Clean up in case of error
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(err => 
                console.error('Error deleting uploaded file:', err)
            );
        }
        
        if (outputDir) {
            try {
                const outputFiles = await fs.readdir(outputDir);
                await Promise.all(outputFiles.map(file => 
                    fs.unlink(path.join(outputDir, file)).catch(() => {})
                ));
                await fs.rmdir(outputDir).catch(() => {});
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }

        res.status(500).json({ 
            success: false,
            error: 'Error processing video',
            details: error.message 
        });
    }
});

app.get("/status/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const outputDir = path.join("output", jobId);

    const files = await fs.readdir(outputDir).catch(() => []);
    const isComplete =
      files.includes("transcript.pdf") && files.includes("transcript.txt");

    res.json({
      jobId,
      status: isComplete ? "complete" : "processing",
      files: isComplete
        ? {
            pdf: `/output/${jobId}/transcript.pdf`,
            txt: `/output/${jobId}/transcript.txt`,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error checking status",
      details: error.message,
    });
  }
});

app.use((error, req, res, next) => {
  console.error("Error:", error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          error: "File size is too large. Maximum size is 500MB",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          error: "Unexpected field in form upload",
        });
      default:
        return res.status(400).json({
          success: false,
          error: "Error uploading file",
          details: error.message,
        });
    }
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: error.message,
  });
});

app.get("/status/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const outputDir = path.join("output", jobId);

    const files = await fs.readdir(outputDir).catch(() => []);
    const isComplete =
      files.includes("transcript.pdf") &&
      files.includes("transcript.txt") &&
      files.some((file) => file.startsWith("original")); // Check for video file

    if (isComplete) {
      const videoFile = files.find((file) => file.startsWith("original"));
      res.json({
        jobId,
        status: "complete",
        files: {
          pdf: `/output/${jobId}/transcript.pdf`,
          txt: `/output/${jobId}/transcript.txt`,
          video: `/output/${jobId}/${videoFile}`,
        },
      });
    } else {
      res.json({
        jobId,
        status: "processing",
        files: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error checking status",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Performing graceful shutdown...");
  process.exit(0);
});
