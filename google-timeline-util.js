const fs = require('fs');
const path = require('path');
const util = require('util');

const ACTIVITY_TYPES = ["WALKING","CYCLING","STILL","IN_PASSENGER_VEHICLE","RUNNING","IN_BUS","IN_FERRY","IN_TRAM","MOTORCYCLING","SKIING","IN_TRAIN","IN_SUBWAY","SAILING","FLYING","IN_VEHICLE"];
        

const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);

const sumFunc = (a,b) => a + b;

const activityFilter = (activity) => {
	return to => to.activitySegment && to.activitySegment.activityType && to.activitySegment.activityType === activity;
}

const getFilesNames = async (path) => {
	const files = await readdir(path);
	if (files.length > 0) {
		return files.map(f => path + "/" + f)
	}
	throw "Folder is empty";
}

(async () => {
	const args = process.argv;
	if (args.length < 3 || args.length > 4) {
		console.log("incorrect input. please follow next pattern: \nnode google-timeline-util.js \"C:\\...\\takeout-20200107T151100Z-001\\Takeout\\История местоположений\\Semantic Location History\\2020\" IN_TRAM\nactivityTypes might be one of " + ACTIVITY_TYPES.reduce((a,b)=> a + "|" + b, ""));
		return;
	}
	const dir = args[2];
	const year = dir.split("\\").reverse()[0];
	console.log("year is " + year);
	const activity = args[3];
	if (!ACTIVITY_TYPES.includes(activity)) {
		console.log("activityTypes should be one of " + ACTIVITY_TYPES.reduce((a,b)=> a + "|" + b, ""));
		return;
	}
	
	const monthsPaths = await getFilesNames(dir);
	const map = {};
	let totalSum = 0;
	for (let mp of monthsPaths) {
		const content = await readfile(mp, 'utf-8');
		const p = JSON.parse(content);
		const sum = p.timelineObjects
			.filter(activityFilter(activity))
			.map(to => to.activitySegment.distance)
			.reduce(sumFunc, 0) || 0;
		const currentMonth = mp.split(year + "_").reverse()[0].split(".json")[0];
		console.log(currentMonth, sum);
		totalSum += sum;
		map[currentMonth] = sum;
	}
	console.log(map);
	console.log("Total for " + year + ": " + totalSum);
})();
