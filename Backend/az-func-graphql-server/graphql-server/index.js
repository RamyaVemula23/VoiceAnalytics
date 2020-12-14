require('dotenv').config();

const { ApolloServer, gql } = require('apollo-server-azure-functions');
const { schema } =require('./src/schema');
const { formatError } = require('apollo-errors');
//const env = process.env.GRAPHQLENV || 'DEV';
const useCacheControl = process.env.USECACHECONTROL == 'true' ? true : false || false;


function getApolloServerSchemaOpts() {
	const schemaOptions = {
		schema,
		formatError
	};

	schemaOptions.cacheControl = useCacheControl;
	schemaOptions.mockEntireSchema = false;
	return schemaOptions;
}
console.log("Here");
const server = new ApolloServer({...getApolloServerSchemaOpts(),playground:{
	settings:{
		'schema.polling.enable': false
	}
}});

exports.graphqlHandler = server.createHandler();