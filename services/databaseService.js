const AtlasDataAPI = require('../utils/atlasAPI');

class DatabaseService {
  constructor() {
    this.useAtlasAPI = process.env.USE_ATLAS_API === 'true';
    if (this.useAtlasAPI) {
      this.api = new AtlasDataAPI();
    }
  }

  // User operations
  async findUser(filter) {
    if (this.useAtlasAPI) {
      return await this.api.findOne('users', filter);
    } else {
      const User = require('../models/User');
      return await User.findOne(filter);
    }
  }

  async createUser(userData) {
    if (this.useAtlasAPI) {
      const id = await this.api.insertOne('users', userData);
      return { _id: id, ...userData };
    } else {
      const User = require('../models/User');
      const user = new User(userData);
      return await user.save();
    }
  }

  // Survey operations
  async findSurveys(filter = {}) {
    if (this.useAtlasAPI) {
      return await this.api.find('surveys', filter);
    } else {
      const Survey = require('../models/Survey');
      return await Survey.find(filter).populate('createdBy', 'username').sort({ createdAt: -1 });
    }
  }

  async findSurvey(filter) {
    if (this.useAtlasAPI) {
      return await this.api.findOne('surveys', filter);
    } else {
      const Survey = require('../models/Survey');
      return await Survey.findOne(filter);
    }
  }

  async findSurveyById(id) {
    if (this.useAtlasAPI) {
      return await this.api.findOne('surveys', { _id: { $oid: id } });
    } else {
      const Survey = require('../models/Survey');
      return await Survey.findById(id);
    }
  }

  async createSurvey(surveyData) {
    if (this.useAtlasAPI) {
      const id = await this.api.insertOne('surveys', {
        ...surveyData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { _id: id, ...surveyData };
    } else {
      const Survey = require('../models/Survey');
      const survey = new Survey(surveyData);
      return await survey.save();
    }
  }

  async updateSurvey(id, updateData) {
    if (this.useAtlasAPI) {
      return await this.api.updateOne(
        'surveys', 
        { _id: { $oid: id } }, 
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } else {
      const Survey = require('../models/Survey');
      return await Survey.findByIdAndUpdate(id, updateData, { new: true });
    }
  }

  // Response operations
  async createResponse(responseData) {
    if (this.useAtlasAPI) {
      const id = await this.api.insertOne('responses', {
        ...responseData,
        submittedAt: new Date()
      });
      return { _id: id, ...responseData };
    } else {
      const Response = require('../models/Response');
      const response = new Response(responseData);
      return await response.save();
    }
  }

  async findResponses(filter) {
    if (this.useAtlasAPI) {
      return await this.api.find('responses', filter);
    } else {
      const Response = require('../models/Response');
      return await Response.find(filter);
    }
  }

  // Cleanup operations
  async clearSurveys() {
    if (this.useAtlasAPI) {
      return await this.api.deleteMany('surveys');
    } else {
      const Survey = require('../models/Survey');
      return await Survey.deleteMany({});
    }
  }

  async clearResponses() {
    if (this.useAtlasAPI) {
      return await this.api.deleteMany('responses');
    } else {
      const Response = require('../models/Response');
      return await Response.deleteMany({});
    }
  }
}

module.exports = new DatabaseService();