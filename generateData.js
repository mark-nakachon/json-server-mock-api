const faker = require("faker");

var database = { devices: [] };

for (var i = 0; i < 5; ++i) {
  const orderno = faker.random.alphaNumeric((number = 10));
  const itemno = faker.random.alphaNumeric((number = 5));
  for (var j = 1; j <= 5; j++) {
    const messages = ["success", "error"];
    const status = ["configured", "not configured"];
    database.devices.push({
      orderno: orderno,
      itemno: itemno,
      model: faker.random.alphaNumeric((number = 5)),
      deviceId: faker.random.alphaNumeric((number = 5)),
      Family: "Meter",
      location: `Structure ${j} compartment name`,
      devicePhoto: faker.image.imageUrl(),
      styleNo: faker.phone.phoneNumber(),
      configFileName: faker.system.fileName(),
      configuredBy: faker.internet.userName(),
      configFileBy: faker.internet.userName(),
      compartment: "starter",
      status: status[faker.random.number({ min: 0, max: 1 })],
      labelName: faker.system.fileName(),
      Name: faker.commerce.productName(),
      location: `Structure ${j} compartment name`,
      deviceIssue: `An issue reported`,
      CTPrimary: "10000",
      CTSecondary: "10",
      PTPrimary: "10",
      PTSecondary: "1000",
      Wiring: "3 phase 4 phase",
      IpAddress: faker.internet.ip(),
      Subnet: "255.0.0.0",
      deviceconnected: messages[faker.random.number({ min: 0, max: 1 })],
      validatingfirmware: messages[faker.random.number({ min: 0, max: 1 })],
      uploadfile: messages[faker.random.number({ min: 0, max: 1 })],
      rebootdevice: messages[faker.random.number({ min: 0, max: 1 })]
    });
  }
}
console.log(JSON.stringify(database));
