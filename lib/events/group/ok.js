'use strict';

module.exports = function onOK (bot, group, args) {

  group.owner = args[1];
  group.loginType = args[3];
  group.connectedAs = args[4];
  group.connectedAt = new Date(args[5] * 1e3);
  group.ip = args[6];
  if (args[7])
  group.mods = parseMod(args[7]);
  group.flags = parseInt(args[8]);

  group.send('g_participants');
};

function parseMod (data) {
  if (!data) return [];
  return data
    .split(';')
    .map(Mod);
}
function Mod (item) {
  let args = item.split(',');
  return {
    name: args[0],
    flag: parseInt(args[1])
  }
}