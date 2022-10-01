export const random_str = (e = 4) => {
  e = e || 4;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
  for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
};

export const encrypt = (str, _SECRET) => {
  str = Buffer.from(str).toString("base64");
  var prand = "";
  for (var i = 0; i < _SECRET.length; i++) {
    prand += _SECRET.charCodeAt(i).toString();
  }
  var sPos = Math.floor(prand.length / 5);
  var mult = parseInt(
    prand.charAt(sPos) +
      prand.charAt(sPos * 2) +
      prand.charAt(sPos * 3) +
      prand.charAt(sPos * 4) +
      prand.charAt(sPos * 5)
  );
  var incr = Math.ceil(_SECRET.length / 2);
  var modu = Math.pow(2, 31) - 1;
  if (mult < 2) {
    alert("Please choose a more complex or longer password.");
    return null;
  }
  var salt = Math.round(Math.random() * 1000000000) % 100000000;
  prand += salt;
  while (prand.length > 10) {
    prand = (
      parseInt(prand.substring(0, 10)) +
      parseInt(prand.substring(10, prand.length))
    ).toString();
  }
  prand = (mult * prand + incr) % modu;
  var enc_chr = "";
  var enc_str = "";
  for (var i = 0; i < str.length; i++) {
    enc_chr = parseInt(
      str.charCodeAt(i) ^ Math.floor((prand / modu) * 255)
    );
    if (enc_chr < 16) {
      enc_str += "0" + enc_chr.toString(16);
    } else enc_str += enc_chr.toString(16);
    prand = (mult * prand + incr) % modu;
  }
  salt = salt.toString(16);
  while (salt.length < 8) salt = "0" + salt;
  enc_str += salt;
  return enc_str;
};

export const decrypt = (str, _SECRET) => {
  var prand = "";
  for (var i = 0; i < _SECRET.length; i++) {
    prand += _SECRET.charCodeAt(i).toString();
  }
  var sPos = Math.floor(prand.length / 5);
  var mult = parseInt(
    prand.charAt(sPos) +
      prand.charAt(sPos * 2) +
      prand.charAt(sPos * 3) +
      prand.charAt(sPos * 4) +
      prand.charAt(sPos * 5)
  );
  var incr = Math.round(_SECRET.length / 2);
  var modu = Math.pow(2, 31) - 1;
  var salt = parseInt(str.substring(str.length - 8, str.length), 16);
  str = str.substring(0, str.length - 8);
  prand += salt;
  while (prand.length > 10) {
    prand = (
      parseInt(prand.substring(0, 10)) +
      parseInt(prand.substring(10, prand.length))
    ).toString();
  }
  prand = (mult * prand + incr) % modu;
  var enc_chr = "";
  var enc_str = "";
  for (var i = 0; i < str.length; i += 2) {
    enc_chr = parseInt(
      parseInt(str.substring(i, i + 2), 16) ^
        Math.floor((prand / modu) * 255)
    );
    enc_str += String.fromCharCode(enc_chr);
    prand = (mult * prand + incr) % modu;
  }
  return Buffer.from(enc_str, "base64").toString();
};

export const generateRandom = encrypt.bind(null, random_str());
