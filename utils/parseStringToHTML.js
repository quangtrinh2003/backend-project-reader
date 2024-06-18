function parseStringToHTML(text) {
  text = text.replaceAll(/\r/gm, "");
  const data = text.split("\n").filter(Boolean);
  data[0] = data[0] + '\n';
  let final = "";
  data.forEach((ele) => {
    final += `${ele}`;
  });
  final = `${final}`;
  return [data[0].trim(), final];
}

module.exports = parseStringToHTML;
