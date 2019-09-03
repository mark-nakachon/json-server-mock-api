const faker = require('faker');

var database = { data: [] };

for (var i=1; i<=5; i++) {
  database.data.push({
    id: i,
    orderno: faker.random.alphaNumeric(number=10),
    itemno:faker.random.alphaNumeric(number=5),
    devices:[]
  });
}
for(var i=1;i<=5;++i){
    var x = database.data;
for (var j=1; j<=5; j++) {
    /*x[j].devices.push({
    deviceStatus:'configured',
    device: `Structure ${j} compartment name`,
    deviceIssue:`An issue reported`,
    configuredBy:faker.internet.userName(),
    configFileBy:faker.internet.userName()
  });*/
  console.log(x[j])
}
}

console.log(JSON.stringify(database));
