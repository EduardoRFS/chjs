'use strict';

const md5 = require('md5');
const SERVER_PREFIX = 's';

const _chatangoTagserver = {
    "sw": {
        "sv10": 110,
        "sv12": 116,
        "w12": 75,
        "sv8": 101,
        "sv6": 104,
        "sv4": 110,
        "sv2": 95
    },
    "ex": {
        "b55279b3166dd5d30767d68b50c333ab": 21,
        "0a249c2a3a3dcb7e40dcfac36bec194f": 21,
        "3ae9453fa1557dc71316701777c5ee42": 51,
        "ebcd66fd5b868f249c1952af02a91cb3": 5,
        "4913527f3dd834ec1bb3e1eb886b6d62": 56,
        "7a067398784395c6208091bc6c3f3aac": 22,
        "ce7b7bc84a4e8184edb432085883ae04": 51,
        "fe8d11abb9c391d5f2494d48bb89221b": 8,
        "2d14c18e510a550f0d13eac7685ba496": 8,
        "3e772eba0dfbf48d47b4c02d5a3beac9": 56,
        "eff4fd30f3fa53a4a1cb3442a951ad03": 54,
        "082baeccd5eabe581cba35bd777b93ef": 56,
        "e21569f6966d79cfc1b911681182f71f": 34,
        "0b18ed3fb935c9607cb01cc537ec854a": 10,
        "20e46ddc5e273713109edf7623d89e7a": 22,
        "72432e25656d6b7dab98148fbd411435": 70,
        "bb02562ba45ca77e62538e6c5db7c8ae": 10,
        "d78524504941b97ec555ef43c4fd9d3c": 21,
        "2db735f3815eec18b4326bed35337441": 56,
        "63ff05c1d26064b8fe609e40d6693126": 56,
        "ec580e6cbdc2977e09e01eb6a6c62218": 69,
        "246894b6a72e704e8e88afc67e8c7ea9": 20,
        "028a31683e35c51862adedc316f9d07b": 51,
        "2b2e3e5ff1550560502ddd282c025996": 27,
        "e0d3ff2ad4d2bedc7603159cb79501d7": 67,
        "726a56c70721704493191f8b93fe94a3": 21
    },
    "sm": [
        ["5", "w12"],
        ["6", "w12"],
        ["7", "w12"],
        ["8", "w12"],
        ["16", "w12"],
        ["17", "w12"],
        ["18", "w12"],
        ["9", "sv2"],
        ["11", "sv2"],
        ["12", "sv2"],
        ["13", "sv2"],
        ["14", "sv2"],
        ["15", "sv2"],
        ["19", "sv4"],
        ["23", "sv4"],
        ["24", "sv4"],
        ["25", "sv4"],
        ["26", "sv4"],
        ["28", "sv6"],
        ["29", "sv6"],
        ["30", "sv6"],
        ["31", "sv6"],
        ["32", "sv6"],
        ["33", "sv6"],
        ["35", "sv8"],
        ["36", "sv8"],
        ["37", "sv8"],
        ["38", "sv8"],
        ["39", "sv8"],
        ["40", "sv8"],
        ["41", "sv8"],
        ["42", "sv8"],
        ["43", "sv8"],
        ["44", "sv8"],
        ["45", "sv8"],
        ["46", "sv8"],
        ["47", "sv8"],
        ["48", "sv8"],
        ["49", "sv8"],
        ["50", "sv8"],
        ["52", "sv10"],
        ["53", "sv10"],
        ["55", "sv10"],
        ["57", "sv10"],
        ["58", "sv10"],
        ["59", "sv10"],
        ["60", "sv10"],
        ["61", "sv10"],
        ["62", "sv10"],
        ["63", "sv10"],
        ["64", "sv10"],
        ["65", "sv10"],
        ["66", "sv10"],
        ["68", "sv2"],
        ["71", "sv12"],
        ["72", "sv12"],
        ["73", "sv12"],
        ["74", "sv12"],
        ["75", "sv12"],
        ["76", "sv12"],
        ["77", "sv12"],
        ["78", "sv12"],
        ["79", "sv12"],
        ["80", "sv12"],
        ["81", "sv12"],
        ["82", "sv12"],
        ["83", "sv12"],
        ["84", "sv12"]
    ]
};

const serverMap = _chatangoTagserver.sm;
const getServerWeight = serverId => _chatangoTagserver.sw[serverId];
const isSpecial = name => _chatangoTagserver.ex[md5(name)];

// extracted from chatango source
function getSNumber (name) {
	name = name.split("_").join("q");
  name = name.split("-").join("q");

  let len = Math.min(5, name.length);
  let gnum = parseInt(name.substr(0, len), 36);
  let modStr = name.substr(6, Math.min(3, name.length - 5));
  let mod = parseInt(modStr, 36);
  mod = isNaN(mod) || mod <= 1E3 || mod === undefined ? 1E3 : mod;
  let position = gnum % mod / mod;
  let servers = serverMap;
  let totalWeights = 0;
  for (let i = 0; i < servers.length; i++) {
    totalWeights += getServerWeight(servers[i][1]);
  }
  let baseNum = 0;
  let normWeights = {};
  for (let i = 0; i < servers.length; i++) {
    baseNum += getServerWeight(servers[i][1]) / totalWeights;
    normWeights[servers[i][0]] = baseNum;
  }
  for (let i = 0; i < servers.length; i++) {
    if (position <= normWeights[servers[i][0]]) {
      return servers[i][0];
    }
  }
}

module.exports = function (domain) {
    return name => `${SERVER_PREFIX}${isSpecial(name) || getSNumber(name)}.${domain}`;
};
