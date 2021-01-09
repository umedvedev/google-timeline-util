//@ts-check
const { promises: fs } = require("fs");
const path = require("path");

const ACTIVITY_TYPES = [
  "WALKING",
  "CYCLING",
  "STILL",
  "IN_PASSENGER_VEHICLE",
  "RUNNING",
  "IN_BUS",
  "IN_FERRY",
  "IN_TRAM",
  "MOTORCYCLING",
  "SKIING",
  "IN_TRAIN",
  "IN_SUBWAY",
  "SAILING",
  "FLYING",
  "IN_VEHICLE",
];

const sumFunc = (a, b) => a + b;

const activityFilter = (activity) => {
  return (to) => to?.activitySegment?.activityType === activity;
};

const getFilesNames = async (dirPath) => {
  const files = await fs.readdir(dirPath);
  if (files.length > 0) {
    return files.map((f) => path.join(dirPath, f));
  }
  throw new Error("Folder is empty");
};

async function main() {
  const args = process.argv;
  if (args.length !== 4) {
    console.log(
      `incorrect input. please follow next pattern:
node google-timeline-util.js "C:\\...\\takeout-20200107T151100Z-001\\Takeout\\История местоположений\\Semantic Location History\\2020" IN_TRAM
activityTypes might be one of ${ACTIVITY_TYPES.join(" | ")}`
    );
    return;
  }
  const dir = args[2];
  const year = path.basename(dir);
  console.log("year is " + year);
  const activity = args[3];

  if (!ACTIVITY_TYPES.includes(activity)) {
    console.log("activityTypes should be one of " + ACTIVITY_TYPES.join(" | "));
    return;
  }

  const monthsPaths = await getFilesNames(dir);
  const map = {};
  let totalSum = 0;
  for (let mp of monthsPaths) {
    const content = await fs.readFile(mp, "utf-8");
    const p = JSON.parse(content);
    const sum =
      p.timelineObjects
        .filter(activityFilter(activity))
        .map((to) => to.activitySegment.distance)
        .reduce(sumFunc, 0) || 0;
    const currentMonth = path.basename(mp).replace(/[^A-Z]+/g, "");
    console.log(currentMonth, sum);
    totalSum += sum;
    map[currentMonth] = sum;
  }
  console.log(map);
  console.log("Total for " + year + ": " + totalSum);
}

main();
