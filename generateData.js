const faker = require ('faker');

var database = {data: [],devices:[]};

for (var i = 1; i <= 5; i++) {
  database.data.push ({
    id: i,
    orderno: faker.random.alphaNumeric ((number = 10)),
    itemno: faker.random.alphaNumeric ((number = 5)),
    devices: [],
  });
}
for (var i = 0; i < 5; ++i) {
  for (var j = 1; j <= 5; j++) {
    const model = faker.random.alphaNumeric ((number = 5));
    const id = faker.random.alphaNumeric((number = 5));
    database.data[i].devices.push ({
      deviceId:id,
      deviceStatus: 'configured',
      model:model,
      location: `Structure ${j} compartment name`,
      deviceIssue: `An issue reported`,
      configuredBy: faker.internet.userName (),
      configFileBy: faker.internet.userName (),
    });
    database.devices.push({
      model:model,
      deviceId:id,
      Family:'Meter',
      model:model,
      styleNo:faker.phone.phoneNumber(),
      configFileName:faker.system.fileName(),
      compartment:'starter',
      status:'configured',
      labelName:faker.system.fileName(),
      Name:faker.commerce.productName(),
      CTPrimary:'10000',
      CTSecondary:'10'
    })

  }
}
console.log (JSON.stringify (database));
