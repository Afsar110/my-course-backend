const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPerfectVideoLink } = require('./videoController');
const { prompt } = require('../prompts/config');
const vectorDB = require('../db/vectorDB');
const { sendError } = require('../utils/responseTemplates');
require('dotenv').config();



const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const  GEMENI_MODEL_FOR_COURSE = process.env.GEMENI_MODEL_FOR_VIDEO;


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generates a course JSON structure using the Gemini API.
 * @param {string} courseTitle - The title of the course.
 * @param {string} courseOverview - A brief overview of the course.
 * @returns {Promise<Object>} - A promise that resolves with the generated JSON structure.
 */
async function generateCourseJson(courseTitle, courseOverview=courseTitle) {
    const model = genAI.getGenerativeModel({ model: GEMENI_MODEL_FOR_COURSE });
  const coursePrompt = prompt.coursePrompt.replace('{{courseTitle}}', courseTitle).replace('{{courseOverview}}', courseOverview);


try {
    const result = await model.generateContent(coursePrompt);
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
    // Assume the API returns the generated JSON structure in response.data
    return response.data;
  } catch (error) {
    console.error('Error generating course JSON:', error);
    throw error;
  }
}


/**
 * Iterates through each day in the course JSON and updates the supplementaryVideo field
 * by calling the external YouTube-link generator API.
 * @param {Object} courseJson - The course JSON structure.
 * @returns {Promise<Object>} - A promise that resolves with the updated course JSON.
 */
async function updateCourseJsonWithVideos(courseJson) {
  for (const week of courseJson.weeks) {
    for (const day of week.days) {
      const { topic, description } = day;
      const newVideoLink = await getPerfectVideoLink(topic, description);
      day.supplementaryVideo = newVideoLink;
    }
  }
  console.log('Youtube Link attached in course ');
  return courseJson;
}

/**
 * Main function to generate the course JSON and update it with video links.
 * @param {string} courseTitle - The course title.
 * @param {string} courseOverview - The course overview.
 */
async function createCompleteCourse(req, res) {
     const { courseTitle, courseOverview } = req.body;
     if (!courseTitle ) {
        return res.status(400).json({ error: 'Course title and overview are required.' });
    }

  try {
    // Check if the course is available on my vector database or not.

    // console.log('Finding similar course in vector DB');
    //   const similarCourse = await vectorDB.findSimilarCourse(courseTitle, courseOverview);
    //   if (similarCourse) {
    //     return res.json(similarCourse);
    //   }
    // console.log(' similar course not found in vector DB');

    
    console.log('Course Generation Started with AI Model: ', GEMENI_MODEL_FOR_COURSE );
    const generatedCourseJson = await generateCourseJson(courseTitle, courseOverview);
    console.log("Generated Course JSON:", generatedCourseJson);

    // Step 2: Update the generated JSON with video links for each day.
    const updatedCourseJson = await updateCourseJsonWithVideos(generatedCourseJson);
    console.log("Updated Course JSON with Videos:");
    console.log(JSON.stringify(updatedCourseJson, null, 2));
    const newCourse = await Course.create({
      courseTitle: courseTitle,
      courseOverview: courseOverview,
      courseStructure: updatedCourseJson,
    });
    console.log("Course successfully saved to the database:", newCourse.id);
  
    // Send the saved course data back to the client
    return sendResponse(res, newCourse);
  // ) res.json(newCourse);
    
  } catch (error) {
    console.error("Error creating complete course JSON:", error);
    
    return  sendError(res, error);
  }
}

module.exports = {
    createCompleteCourse
  };
  