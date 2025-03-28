module.exports = {
    prompt: {
        coursePrompt: `with a course title: {{courseTitle}} and a course overview: {{courseOverview}}. Using these inputs, create a well-structured JSON that represents the course. The JSON should include the following keys:

1. "courseTitle": A string representing the course title (use the provided title).
2. "courseOverview": A string that gives a brief description of the course (use the provided overview).
3. "weeks": An array of week objects. Each week object must include( create this course for 1 month, so it will have 4 week in a month):
   - "weekNumber": An integer representing the sequential number of the week(each week will have at most 5 days in it).
   - "weekTitle": A string describing the title or main focus of that week.
   - "days": An array of day objects. Each day object should include:
     - "day": An integer indicating the day number within the week.
     - "topic": A string that briefly states the topic for the day.
     - "description": A string providing a short explanation of the day's content.
     - "supplementaryVideo": A string URL (e.g., a YouTube link) for a video relevant to the day's topic (you may use placeholder URLs if necessary).
     - "status": A string that indicates the progress status (e.g., "Will Do").
     - "quiz": An object containing:
         - "question": A string with a quiz question relevant to the day's topic.
         - "options": An array of strings representing multiple-choice answers.
         - "correctOption": An integer representing the index (starting at 0) of the correct answer in the options array.

keep in mind that, assume the course is organized into 4 weeks with each week containing 5 days (monday to friday). Make sure to full the data in all week and all day object The topics, video URLs, and quiz details can be generated using content relevant to the that days topic. Ensure the JSON is properly formatted and valid.
please generate FUll code.
Generate the JSON structure based on these guidelines.
`
    }
  
};
