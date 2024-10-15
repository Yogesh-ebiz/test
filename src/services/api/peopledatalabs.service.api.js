import PDLJS from 'peopledatalabs';
const fs = require("fs");

const token = "715c6688a16f01e199e82d2a39500abee87d46cfcafbd486588ec666e17d14f6"
const PDLJSClient = new PDLJS({ apiKey: token });

/**
 * Create a new client instance
 */
const searchPeople = async (filter, size) => {

  if(!filter){
    return null;
  }

  // Create an Elasticsearch query
  const esQuery = {
    query: {
      bool: {
        must:[
          {term: {location_country: "mexico"}},
          {term: {job_title_role: "health"}},
          {exists: {field: "phone_numbers"}}
        ]
      }
    }
  }

  // Create a parameters JSON object
  const params = {
    searchQuery: esQuery,
    size: size,
    pretty: true
  }

  return await PDLJSClient.person.search.elastic(params).then((data) => {
    // Write out all profiles found to file
    fs.writeFile("my_pdl_search.jsonl", Buffer.from(JSON.stringify(data.data)), (err) => {
      if (err) throw err;
    });
    console.log(`Successfully grabbed ${data.data.length} records from PDL.`);
    console.log(`${data["total"]} total PDL records exist matching this query.`)
  }).catch((error) => {
    console.log("NOTE: The carrier pigeons lost motivation in flight. See error and try again.")
    console.log(error);
  });

};

/**
 * Base API
 */
module.exports = {
  searchPeople

};
