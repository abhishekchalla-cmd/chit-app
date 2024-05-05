const express = require("express");
const app = express();
const path = require("path");
const { v4 } = require("uuid");

const dictRef = { dict: [] };

app.use(express.json());

app.use("/", express.static(path.resolve(__dirname, "./frontend")));

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

app.post("/set-dict", (req, res) => {
  dictRef.dict = req.body;

  /*



  Shuffling words



  */
  for (const _ of dictRef.dict) {
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

  return res.send("OK");
});

app.get("/get-dict-state", (req, res) => {
  return res.json(dictRef.dict);
});

app.listen(3000);
