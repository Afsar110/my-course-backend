const axios = require('axios');
const vectorDB = require('../db/vectorDB')
require('dotenv').config();


const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const  GEMENI_MODEL_FOR_VIDEO = process.env.GEMENI_MODEL_FOR_VIDEO;
 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function to search YouTube videos
async function searchYouTubeVideos(topic) {
console.log('Calling Youtube API with ',topic);

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 5,
        q: topic,
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });

    console.log('Storing the data on my vector db.');
    const videos = extractVideoDetails(response.data);
    // for (const video of videos) {
    //   await vectorDB.storeVideo(video);
    // }
    
    console.log('Adding 500 millisecond delay.');
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return videos;

  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw new Error('Failed to search YouTube videos');
  }
}

// Function to extract video details from YouTube API response
function extractVideoDetails(youtubeResponse) {
  if (!youtubeResponse.items || youtubeResponse.items.length === 0) {
    return [];
  }

  return youtubeResponse.items.map(item => {
    // Extract video ID from the id object
    const videoId = item.id.videoId;

    // Extract details from the snippet
    const {
      title,
      description,
      publishedAt,
      channelTitle,
      thumbnails
    } = item.snippet;

    // Create a structured video object
    return {
      videoId,
      title,
      description,
      publishedAt,
      channelTitle,
      thumbnailUrl: thumbnails.high.url,
      youtubeLink: `https://www.youtube.com/watch?v=${videoId}`
    };
  });
}

// Function to analyze semantic similarity using Gemini AI
async function analyzeSimilarity(userTopic, userDescription, videos) {
  const model = genAI.getGenerativeModel({ model: GEMENI_MODEL_FOR_VIDEO });

  // Create the prompt for Gemini
  const prompt = `
  I need to find the most relevant YouTube video that matches this topic and description:
  
  TOPIC: ${userTopic}
  DESCRIPTION: ${userDescription}
  
  Here are some YouTube videos. For each one, analyze how well it matches the topic and description above in terms of semantic similarity and contextual relevance.
  
  Rate each video on a scale of 0-100, where 100 is a perfect match.
  
  VIDEOS TO ANALYZE:
  ${videos.map((video, index) => `
  VIDEO ${index + 1}:
  - Title: ${video.title}
  - Description: ${video.description}
  - Channel: ${video.channelTitle}
  `).join('\n')}
  
  Return a JSON object with the following format:
  {
    "rankings": [
      {
        "videoIndex": 0, // zero-based index of the video in the list
        "score": 85, // similarity score (0-100)
        "reasoning": "Brief explanation of why this score was assigned"
      },
      // ...more videos
    ],
    "bestMatch": 0 // zero-based index of the best matching video
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON object from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : '';

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON from Gemini response:', e);
      console.log('Raw response:', text);
      throw new Error('Failed to process AI analysis');
    }
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw new Error('Failed to analyze videos with AI');
  }
}

// Controller function to find the best matching video
const findMatchingVideo = async (req, res) => {
  try {
    const { topic, description } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Search YouTube for videos related to the topic
    const videos = await searchYouTubeVideos(topic);

    if (videos.length === 0) {
      return res.status(404).json({ error: 'No videos found for the given topic' });
    }

    // Analyze videos for semantic similarity
    const analysis = await analyzeSimilarity(topic, description || '', videos);

    // Get the best match
    const bestVideoIndex = analysis.bestMatch;
    const bestVideo = videos[bestVideoIndex];

    // Return the best matching video
    return res.json({
      bestMatch: {
        ...bestVideo,
        score: analysis.rankings.find(r => r.videoIndex === bestVideoIndex)?.score || null,
        reasoning: analysis.rankings.find(r => r.videoIndex === bestVideoIndex)?.reasoning || null
      },
      allVideos: videos.map((video, index) => ({
        ...video,
        score: analysis.rankings.find(r => r.videoIndex === index)?.score || null,
        reasoning: analysis.rankings.find(r => r.videoIndex === index)?.reasoning || null
      }))
    });
  } catch (error) {
    console.error('Error in findMatchingVideo controller:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getPerfectVideoLink = async (topic, description) => {
    try {

  
      if (!topic) {
        throw new Error('Topic is required');
      }
  
      // const similarVideo = await vectorDB.findSimilarVideo(topic, description);
      // if (similarVideo) {
      //   return similarVideo.youtubeLink;
      // }
      // Search YouTube for videos related to the topic
      const videos = await searchYouTubeVideos(topic);
  
      if (videos.length === 0) {
        throw new Error('No videos found for the given topic');
        }
  
    
  
      // Analyze videos for semantic similarity
      const analysis = await analyzeSimilarity(topic, description || '', videos);
  
      // Get the best match
      const bestVideoIndex = analysis.bestMatch;
      const bestVideo = videos[bestVideoIndex];
  
      // Return the best matching video
      return bestVideo.youtubeLink;
    } catch (error) {
      console.error('Error in findMatchingVideo controller:', error);
      throw error;
      // return res.status(500).json({ error: error.message });
    }
  };
  
// Controller function to test extract video details
const testExtract = async(req, res) => {
  try {

    const {topic} = req.body;
    const videos = await searchYouTubeVideos(topic);

    return res.json(videos);
  } catch (error) {
    console.error('Error in testExtract controller:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  findMatchingVideo,
  testExtract,
  getPerfectVideoLink
};
