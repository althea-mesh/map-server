const firebaseExport = require("./firebase-export.json");
const countryCodes = require("./country-codes.json");
const alreadyEmailed = require("./already-emailed.json");
const base = require("airtable").base("app10GFwKz0Ipn7TW");

function extractRecords(countries) {
  const records = [];
  Object.keys(countries).forEach(key => {
    const country = countries[key];
    Object.keys(country).forEach(key => {
      const record = country[key];
      records.push(record);
    });
  });

  return records;
}

function createAirtableRecords(countries) {
  const firebaseRecords = extractRecords(countries);

  return firebaseRecords.map(record => {
    return {
      Email: record.User_Information.Email,
      City: record.User_Location.City,
      Country: countryCodes[record.User_Location.Country],
      Contacted: !!alreadyEmailed[record.User_Information.Email],
      "Postal Code": record.User_Location.Zip_Postal_Code,
      "Date Added to Firebase": new Date(
        record.Metadata.Timestamp
      ).toISOString()
    };
  });
}

function uploadAirtableRecords(records) {
  records.forEach(record => {
    base("Requested Deployments").create(record, function(err, record) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(record.getId());
    });
  });
}

uploadAirtableRecords(createAirtableRecords(firebaseExport.Country));
