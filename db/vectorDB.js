const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');


require('dotenv').config();

class VectorDatabaseService {
  constructor() {
    // Validate required environment variables
    this.validateEnvironmentVariables();

    // Initialize configuration
    this.config = {
      apiKey: process.env.PINECONE_API_KEY,
      // environment: process.env.PINECONE_ENVIRONMENT,
      indexName: process.env.PINECONE_INDEX
    };

    // Initialize Pinecone client
  //   this.pc = new Pinecone({ 
  //     apiKey:  process.env.PINECONE_API_KEY,
  //     controllerHostUrl:  process.env.PINECONE_LOCALHOST_URL || 'http://localhost:5081' 
  // });

  this.pc = new Pinecone({
    apiKey:  process.env.PINECONE_API_KEY,
    controllerHostUrl: 'http://localhost:5081'
  });
  
    // Initialize Google Generative AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  /**
   * Validate required environment variables
   */
  validateEnvironmentVariables() {
    const requiredVars = [
      'PINECONE_API_KEY', 
      'PINECONE_ENVIRONMENT', 
      'PINECONE_INDEX', 
      'GEMINI_API_KEY'
    ];

    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });
  }

  /**
   * Generate embeddings using Gemini
   * @param {string} text - Text to generate embedding for
   * @returns {Promise<number[]>} Embedding vector
   */
  async generateEmbedding(text) {
    const model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
    
    try {
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Initialize Pinecone index
   * @returns {Promise<PineconeIndex>} Pinecone index instance
   */
  async getIndex() {
    const indexName = this.config.indexName;
    
    try {
      // List existing indexes
      const indexes = await this.pc.listIndexes();
      
      // Check if index exists
      const indexExists = indexes.indexes?.some(
        index => index.name === indexName
      );

      if (!indexExists) {
        // Create index if not exists
        await this.pc.createIndex({
          name: denseIndexName,
          vectorType: 'dense',
          dimension: 2,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          },
          deletionProtection: 'disable',
          tags: { environment: 'development' }, 
        });
        
        // console.log('Dense index model:', denseIndexModel);
        
        console.log(`Index ${indexName} created`);
      }

      // Return the index
      return this.pc.index(indexName);
    } catch (error) {
      console.error('Index initialization error:', error);
      throw error;
    }
  }

  /**
   * Upsert embedding to Pinecone
   * @param {string} namespace - Namespace for the embedding
   * @param {Object} embedding - Embedding to upsert
   */
  async upsertEmbedding(namespace, embedding) {
    const index = await this.getIndex();
    
    try {
      await index.namespace(namespace).upsert([embedding]);
      console.log(`Embedding upserted in namespace: ${namespace}`);
    } catch (error) {
      console.error('Upsert embedding error:', error);
      throw error;
    }
  }

  /**
   * Query similar embeddings
   * @param {string} namespace - Namespace to query
   * @param {number[]} queryVector - Query embedding vector
   * @param {number} [topK=3] - Number of top results
   * @returns {Promise<Object[]>} Matched embeddings
   */
  async querySimilarEmbeddings(namespace, queryVector, topK = 3) {
    const index = await this.getIndex();
    
    try {
      const queryResponse = await index.namespace(namespace).query({
        topK,
        vector: queryVector,
        includeMetadata: true
      });

      return queryResponse.matches;
    } catch (error) {
      console.error('Query embeddings error:', error);
      throw error;
    }
  }

  /**
   * Store course data with embedding
   * @param {Object} courseData - Course data to store
   */
  async storeCourse(courseData) {
    const courseText = `${courseData.title} ${courseData.overview}`;
    const embedding = await this.generateEmbedding(courseText);

    const courseEmbedding = {
      id: `course:${Date.now()}`,
      values: embedding,
      metadata: {
        ...courseData,
        type: 'course',
        timestamp: new Date().toISOString()
      }
    };

    await this.upsertEmbedding('courses', courseEmbedding);
  }

  /**
   * Find similar courses
   * @param {string} courseTitle - Course title
   * @param {string} courseOverview - Course overview
   * @returns {Promise<Object|null>} Similar course or null
   */
  async findSimilarCourse(courseTitle, courseOverview) {
    const courseText = `${courseTitle} ${courseOverview}`;
    const embedding = await this.generateEmbedding(courseText);

    const similarCourses = await this.querySimilarEmbeddings('courses', embedding);

    // Check if a similar course exists (you can adjust the threshold)
    if (similarCourses.length > 0 && similarCourses[0].score > 0.8) {
      return similarCourses[0].metadata;
    }

    return null;
  }

  /**
   * Store video with embedding
   * @param {Object} videoData - Video data to store
   */
  async storeVideo(videoData) {
    const videoText = `${videoData.topic} ${videoData.description}`;
    const embedding = await this.generateEmbedding(videoText);

    const videoEmbedding = {
      id: videoData?.videoId || `video:${Date.now()}`,
      values: embedding,
      metadata: {
        ...videoData,
        type: 'video',
        timestamp: new Date().toISOString()
      }
    };

    await this.upsertEmbedding('videos', videoEmbedding);
  }

  /**
   * Find similar videos
   * @param {string} topic - Video topic
   * @param {string} description - Video description
   * @returns {Promise<Object|null>} Similar video or null
   */
  async findSimilarVideo(topic, description) {
    const videoText = `${topic} ${description}`;
    const embedding = await this.generateEmbedding(videoText);

    const similarVideos = await this.querySimilarEmbeddings('videos', embedding);

    // Check if a similar video exists (you can adjust the threshold)
    if (similarVideos.length > 0 && similarVideos[0].score > 0.8) {
      return similarVideos[0].metadata;
    }

    return null;
  }
}

// Export the service as a singleton
module.exports = new VectorDatabaseService();