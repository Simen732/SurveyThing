const axios = require('axios');

class AtlasDataAPI {
  constructor() {
    this.baseURL = 'https://data.mongodb-api.com/app/data-ysyuf/endpoint/data/v1';
    this.apiKey = process.env.ATLAS_API_KEY;
    this.dataSource = 'Cluster0';
    this.database = 'survey-app';
  }

  async findOne(collection, filter = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/action/findOne`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        filter: filter
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data.document;
    } catch (error) {
      console.error('Atlas API findOne error:', error.response?.data || error.message);
      throw error;
    }
  }

  async find(collection, filter = {}, limit = 100) {
    try {
      const response = await axios.post(`${this.baseURL}/action/find`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        filter: filter,
        limit: limit
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data.documents;
    } catch (error) {
      console.error('Atlas API find error:', error.response?.data || error.message);
      throw error;
    }
  }

  async insertOne(collection, document) {
    try {
      const response = await axios.post(`${this.baseURL}/action/insertOne`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        document: document
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data.insertedId;
    } catch (error) {
      console.error('Atlas API insertOne error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateOne(collection, filter, update) {
    try {
      const response = await axios.post(`${this.baseURL}/action/updateOne`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        filter: filter,
        update: update
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Atlas API updateOne error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteMany(collection, filter = {}) {
    try {
      const response = await axios.post(`${this.baseURL}/action/deleteMany`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        filter: filter
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Atlas API deleteMany error:', error.response?.data || error.message);
      throw error;
    }
  }

  async aggregate(collection, pipeline) {
    try {
      const response = await axios.post(`${this.baseURL}/action/aggregate`, {
        dataSource: this.dataSource,
        database: this.database,
        collection: collection,
        pipeline: pipeline
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        }
      });
      return response.data.documents;
    } catch (error) {
      console.error('Atlas API aggregate error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = AtlasDataAPI;