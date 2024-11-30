import express from 'express';
import path from 'node:path';
import { connect } from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Debugging log to confirm server script is running
console.log('Server script starting...');

// Apollo Server setup
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(async () => {
  try {
    await server.start();
    app.use(
      '/graphql',
      cors(),
      bodyParser.json(),
      expressMiddleware(server)
    );

    // Middleware for parsing
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Static files
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
    }

    console.log('Attempting to connect to the database...');
    const connectionString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';

    // Explicitly handle mongoose connection
    await connect(connectionString);
    console.log('✅ MongoDB connected successfully.');

    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
  }
})();
