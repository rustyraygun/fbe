const Sequelize = require('sequelize');
const moment = require('moment');
const marked = require('marked');

const sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
    // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
  storage: '.data/database.sqlite'
});

let PostData;

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    PostData = sequelize.define('posts', {
      title: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.STRING
      }
    });
    PostData.sync();
  })
  .catch((err) => {
    console.log('Unable to connect to the database: ', err);
  });

const Posts = {
  all() {
    return PostData.findAll().then(posts => posts.map(post => new Post(post)));
  },
  
  add(postData) {
    return PostData.create(postData);
  },
  
  find(id) {
    return PostData.findById(id).then(post => new Post(post));
  },
  
  update(id, { title, body }) {
    return this.find(id).then(post => {
      post.title = title;
      post.body = body;
      return post.save();
    });
  },
  
  delete(id) {
    return this.find(id).then(post => post.destroy());
  }
};

class Post {
  constructor({ title, body, updatedAt, id }) {
    this.title = title;
    this.body = body;
    this.updatedAt = updatedAt;
    this.id = id;
  }
  
  get updated() {
    return moment(this.updatedAt).format('MMM Do YY');
  }
  
  get formattedBody() {
    return marked(this.body);
  }
  
  get forJson() {
    return {
      id: this.id,
      title: this.title,
      body: this.formattedBody,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Posts;