const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const { v4 } = require("uuid");

const dictRef = { dict: [] };

app.get("/", (req, res) => {
  return res.send(
    fs.readFileSync(path.resolve(__dirname, "./frontend.html"), "utf-8")
  );
});

app.post("/get-token", (req, res) => {
  return res.json({ token: v4() });
});

app.post("/get-word", (req, res) => {
  const token = req.headers.token;
  if (!token)
    return res.status(400).json({ message: "You haven't registered" });

  if (dictRef.dict.length === 0)
    return res.status(500).json({ message: "Dictionary isn't set" });

  const assigned = dictRef.dict.find((e) => e.assignedTo === token);
  if (!assigned) {
    const unassigned = dictRef.dict.find((e) => !e.assignedTo);
    if (!unassigned)
      return res.status(500).json({ message: "No unassigned words left" });
    unassigned.assignedTo = token;
    return res.json(unassigned);
  }
  return res.json(assigned);
});

app.get("/refresh-dict", (req, res) => {
  dictRef.dict = require("./dict.json");

  /*



  Shuffling words



  */
  console.log(
    "Before shuffling",
    JSON.stringify(
      dictRef.dict.map((e) => e.word),
      null,
      2
    )
  );
  for (let i = 0; i < dictRef.dict.length; i++) {
    const indexArray = new Array(dictRef.dict.length)
      .fill("")
      .map((e, index) => index);

    const startIndex = indexArray.splice(
      Math.floor(0.9 * Math.random() * indexArray.length),
      1
    );
    const endIndex = indexArray.splice(
      Math.floor(0.9 * Math.random() * indexArray.length),
      1
    );

    const temp = dictRef.dict[startIndex];
    dictRef.dict[startIndex] = dictRef.dict[endIndex];
    dictRef.dict[endIndex] = temp;
  }

  console.log(
    "After shuffling",
    JSON.stringify(
      dictRef.dict.map((e) => e.word),
      null,
      2
    )
  );

  return res.send("OK");
});

app.get("/get-dict-state", (req, res) => {
  return res.json(dictRef.dict);
});

app.listen(3000);
