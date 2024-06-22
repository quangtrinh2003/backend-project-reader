const fsp = require("fs/promises");
const slugify = require("slugify");
const Novel = require("./../models/novelSchema");
const NovelStat = require("./../models/novelStatSchema");
const NovelChaptersInfo = require("./../models/novelChapterSchema");
const User = require("./../models/userSchema");
const catchAsync = require("./../utils/catchAsync");
const parseStringToHTML = require("./../utils/parseStringToHTML");



exports.novelRetrieveRouting = async (req, res, next) => {
  req.params.chapter
    ? await getChapter(req, res, next)
    : await getNovel(req, res, next);
};

exports.createNovelChapter = catchAsync(async function (req, res, next) {
  const path = `${process.env.NOVEL_DIRECTORY_PATH}/${req.params.id}`;
  await fsp.access(path);

  let [chapterName, text] = parseStringToHTML(req.body.data);

  const fileName = await slugifyChapterName(chapterName);

  await createAndWriteXMLFile(req.params.id, fileName, text);
  await Novel.findOneAndUpdate(
    { novelUrl: req.params.id },
    { updateDate: Date.now() },
  );
  await addChapterInfoToDb(chapterName, fileName, req.params.id);
  res.status(200).json({ status: "success" });
});

exports.createNovel = async function (req, res, next) {
  try {
    if (!req.body.title) {
      res.status(200).json({ status: "failed" });
    }
    req.body.novelUrl = await createNovelFolder(req.body.title);
    const novel = await Novel.create(req.body);

    const user = await User.findOne({ username: req.user });

    user.novelInvolved.push(req.body.novelUrl);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ status: "failed" });
  }
};

exports.getNovels = async (req, res, next) => {
  const result = await Novel.aggregate([
    {
      $sort: {
        updateDate: -1,
      },
    },
    { $limit: 10 },
    { $project: { novelUrl: 1, title: 1, imageUrl: 1, _id: 0 } },
  ]);
  res.status(200).json({ data: result });
};

exports.getEditChapter = catchAsync(async (req, res, next) => {
  if (!req.params.id || !req.params.chapter) {
    res.status(404).json({ status: "failed", message: "not found" });
  }

  const path = `${process.env.NOVEL_DIRECTORY_PATH}/${req.params.id}/${req.params.chapter}.txt`;

  const text = await fsp.readFile(path, { encoding: "utf-8" });
  res.status(200).send(text);
});

exports.updateEditChapter = catchAsync(async (req, res, next) => {
  if (!req.params.id || !req.params.chapter) {
    res.status(404).json({ status: "failed", message: "not found" });
  }
  const path = `${process.env.NOVEL_DIRECTORY_PATH}/${req.params.id}/${req.params.chapter}.txt`;
  await fsp.access(path);
  let [chapterName, text] = parseStringToHTML(req.body.data);

  await createAndWriteXMLFile(req.params.id, req.params.chapter, text);

  await NovelChaptersInfo.findOneAndUpdate(
    { fileName: req.params.chapter },
    { chapterName: chapterName },
  );
  await Novel.findOneAndUpdate(
    { novelUrl: req.params.id },
    { updateDate: Date.now() },
  );

  res.status(200).json({ status: "success" });
});

// Functions

async function getNovel(req, res, next) {
  const novelUrl = req.params.id;

  const result = await NovelChaptersInfo.aggregate([
    {
      $match: {
        novelUrl: novelUrl,
      },
    },

    {
      $sort: {
        uploadDate: -1,
      },
    },
    { $limit: 4 },
    {
      $project: { _id: 0, __v: 0, uploadDate: 0 },
    },
  ]);

  res.status(200).json({ status: "success", data: result });
}

async function getChapter(req, res, next) {
  const path = `${process.env.NOVEL_DIRECTORY_PATH}/${req.params.id}/${req.params.chapter}.txt`;
  const text = await fsp.readFile(path, { encoding: "utf-8" });

  res.status(200).send(text);
}

async function checkNovelExist(novelUrl) {
  try {
    await fsp.access(`${process.env.NOVEL_DIRECTORY_PATH}/${novelUrl}`);
    return true;
  } catch (err) {
    return false;
  }
}

async function createNovelFolder(novelName) {
  let novelId = 0;
  while (await checkNovelExist(`${novelId}-${novelName}`)) {
    novelId++;
  }
  await fsp.mkdir(
    `${process.env.NOVEL_DIRECTORY_PATH}/${novelId}-${novelName}`,
  );
  return `${novelId}-${novelName}`;
}

async function createAndWriteXMLFile(folderName, fileName, text) {
  await fsp.writeFile(
    `${process.env.NOVEL_DIRECTORY_PATH}/${folderName}/${fileName}.txt`,
    text,
  );
}

async function slugifyChapterName(chapterName) {
  const total = await NovelStat.findOne();
  await NovelStat.findOneAndUpdate(
    { totalChapter: total.totalChapter },
    { totalChapter: total.totalChapter + 1 },
  );
  return `c${total.totalChapter + 1}-${slugify(chapterName, {
    replacement: "-",
    lower: true,
    strict: true,
    remove: /[^A-Za-z0-9\s]/gm,
  })}`;
}

async function addChapterInfoToDb(chapterName, fileName, novelUrl) {
  await NovelChaptersInfo.create({
    chapterName,
    novelUrl,
    fileName,
    uploadDate: Date.now(),
  });
}
