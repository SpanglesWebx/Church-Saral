/**
 * Tamil Unicode Reshaper for jsPDF
 */

const reshapeTamil = (text = "") => {

  const chars = Array.from(text);
  const result = [];

  for (let i = 0; i < chars.length; i++) {

    const char = chars[i];
    const next = chars[i + 1];

    const isConsonant =
      char >= "\u0B95" &&
      char <= "\u0BB9";

    if (isConsonant && next) {

      //ெ ே ை

      if (
        next === "\u0BC6" ||
        next === "\u0BC7" ||
        next === "\u0BC8"
      ) {

        result.push(next);
        result.push(char);

        i++;
        continue;
      }

      //ொ

      if (next === "\u0BCA") {

        result.push("\u0BC6");
        result.push(char);
        result.push("\u0BBE");

        i++;
        continue;
      }

      //ோ

      if (next === "\u0BCB") {

        result.push("\u0BC7");
        result.push(char);
        result.push("\u0BBE");

        i++;
        continue;
      }

      //ௌ

      if (next === "\u0BCC") {

        result.push("\u0BC6");
        result.push(char);
        result.push("\u0BD7");

        i++;
        continue;
      }
    }

    result.push(char);
  }

  return result.join("");
};

module.exports = {
  reshapeTamil,
};