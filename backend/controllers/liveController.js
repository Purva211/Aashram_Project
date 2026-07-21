const LiveStream = require('../models/LiveStream');

// @desc    Get the current active live stream
// @route   GET /api/live/current
// @access  Public
const getCurrentLiveStream = async (req, res) => {
  try {
    const current = await LiveStream.findOne({ isLive: true }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      isLive: !!current,
      data: current || null
    });
  } catch (error) {
    console.error('Error in getCurrentLiveStream:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get live streams history and upcoming events
// @route   GET /api/live/history
// @access  Public
const getLiveStreamsHistory = async (req, res) => {
  try {
    const now = new Date();
    // Historical items (explicitly marked as past videos)
    const history = await LiveStream.find({ isPastVideo: true }).sort({ scheduledAt: -1 });

    res.status(200).json({
      success: true,
      history,
      upcoming: [] // Keep for frontend compatibility if needed
    });
  } catch (error) {
    console.error('Error in getLiveStreamsHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a new live stream event
// @route   POST /api/live
// @access  Public (should be Admin/Editor in production)
const createLiveStream = async (req, res) => {
  try {
    const { title, description, streamUrl, isLive, scheduledAt } = req.body;
    let finalStreamUrl = streamUrl;
    let finalThumbnail = '/event_card.png';
    let finalVideoFile = '';

    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        finalThumbnail = req.files.thumbnail[0].path;
      } else if (req.body.thumbnail) {
        finalThumbnail = req.body.thumbnail;
      }
      
      if (req.files.videoFile && req.files.videoFile[0]) {
        finalVideoFile = req.files.videoFile[0].path;
      }
    } else {
      if (req.body.thumbnail) finalThumbnail = req.body.thumbnail;
    }

    // Convert string 'false'/'true' if it comes from FormData
    const isLiveBool = isLive === 'true' || isLive === true;

    // If new stream is set to live, set all other streams to isLive = false
    if (isLiveBool) {
      await LiveStream.updateMany({ isLive: true }, { isLive: false });
    }

    const newStream = await LiveStream.create({
      title,
      description,
      streamUrl: finalStreamUrl,
      videoFile: finalVideoFile,
      thumbnail: finalThumbnail,
      isLive: isLiveBool,
      isPastVideo: !isLiveBool, // Automatically mark as past video if not live
      scheduledAt: scheduledAt ? new Date(scheduledAt) : Date.now()
    });

    res.status(201).json({
      success: true,
      data: newStream
    });
  } catch (error) {
    console.error('Error in createLiveStream:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const updateLiveStream = async (req, res) => {
  try {
    const { title, description, streamUrl, isLive, scheduledAt } = req.body;
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });

    let isLiveBool = stream.isLive;
    if (isLive !== undefined) {
      isLiveBool = isLive === 'true' || isLive === true;
    }

    if (isLiveBool && !stream.isLive) {
      await LiveStream.updateMany({ isLive: true }, { isLive: false });
    }
    
    if (req.files) {
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        stream.thumbnail = req.files.thumbnail[0].path;
      } else if (req.body.thumbnail) {
        stream.thumbnail = req.body.thumbnail;
      }
      
      if (req.files.videoFile && req.files.videoFile[0]) {
        stream.videoFile = req.files.videoFile[0].path;
      }
    } else {
      if (req.body.thumbnail) stream.thumbnail = req.body.thumbnail;
    }

    stream.title = title || stream.title;
    stream.description = description || stream.description;
    stream.streamUrl = streamUrl !== undefined ? streamUrl : stream.streamUrl;
    stream.isLive = isLiveBool;
    // Don't modify isPastVideo on update to prevent Live streams turning into Past videos automatically
    stream.scheduledAt = scheduledAt ? new Date(scheduledAt) : stream.scheduledAt;

    await stream.save();
    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const deleteLiveStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return res.status(404).json({ success: false, message: 'Stream not found' });
    await stream.deleteOne();
    res.status(200).json({ success: true, message: 'Stream deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getCurrentLiveStream,
  getLiveStreamsHistory,
  createLiveStream,
  updateLiveStream,
  deleteLiveStream
};
