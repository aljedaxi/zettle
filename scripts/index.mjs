#!/bin/env zx

import dateFns from 'date-fns/fp/index.js'
const { 
	format, 
	eachDayOfInterval, 
	lastDayOfISOWeek, 
	addMonths, 
	getMonth,
	getWeek,
	isLastDayOfMonth, 
	parseISO,
	isSunday,
	addDays,
	formatDistance,
	startOfISOWeek,
	nextMonday,
	startOfMonth,
	differenceInCalendarDays,
	formatISO,
} = dateFns
import sanctuary from 'sanctuary';
import {env as flutureEnv} from 'fluture-sanctuary-types'
import {parallel, fork} from 'fluture'
// const {parallel, fork} = Future
const {
	insert,
	Nothing,
	even,
	mapLeft,
	I,
	fromPairs,
	fromMaybe,
	pairs,
	join,
	snd,
	prop,
	fst,
	swap,
	concat,
	pipe,
	get,
	K,
	T,
	flip,
	map,
	range,
	reduce,
	append,
	last,
	chain,
	Just,
	justs,
	Maybe,
	sequence,
	tail,
	filter,
	test,
	splitOn,
	joinWith,
	ap,
	gets,
} = sanctuary.create ({checkTypes: true, env: sanctuary.env.concat (flutureEnv)});
import {writeFile, readFileSync} from 'fs'
import {readdir, readFile} from 'fs/promises'
import yaml from 'js-yaml'
const trace = s => {console.log(s); return s;};

const formatTask = timestamp => task => `## TODO ${task}
:PROPERTIES:
:todo: ${timestamp}
:END:`;

// new Date (2021, 3, 14) => Mar 14th, 2021
const titleFormatting = format ('MMM do, yyyy');
// new Date (2021, 3, 14) => 2021_03_14
const fileNameFormatting = format ('yyyy_MM_dd');
const meta = pipe([
	titleFormatting,
	t => `---\ntitle: ${t}\n---`,
]);
const getTimestamp = () => format ('T') (new Date ());

const dir = '.';
const makeFile = tasks => day => ({
	fileName: `${dir}/journals/${fileNameFormatting (day)}.md`,
	fileText: [
		meta (day),
		tasks.map(formatTask (getTimestamp ())).join('\n'),
	].join('\n\n'),
});

const writeFileType = ({fileName, fileText}) => new Promise((res, rej) =>
	writeFile(fileName, fileText, {flag: 'a'}, res)
);

// {fileName, fileText} -> Future
const writeFileFuture = ({fileName, fileText}) => Future((res, rej) => {
	writeFile(fileName, fileText, {flag: 'a'}, _ => res(`wrote ${fileName}`))
	return () => 'lol'
});

const getThisManyMonths = firstMonth => pipe([
	range (0),
	(getSecondMonths) ([Just (firstMonth)]),
	sequence (Maybe),
	chain (tail),
])

const genParallelFutures = pipe([
	map (writeFileFuture),
	parallel (9000),
])

const fix = _ => {
	const folder = '.';
	const newFileName = pipe([
		splitOn ('_'),
		([dir, ...filename]) => `${folder}/${dir}/${joinWith ('_') (filename)}`,
	])
	const main = pipe([
		filter (test (/md$/)),
		map (oldName => `mv ${folder}/${oldName} ${newFileName (oldName)}`),
	]);
	readdir(folder)
		.then(main)
		.then(x => x.forEach(y => console.log(y)));
};

const toString = s => s.toString()
const mapToFunc = o => p => prop (p) (o)
const ordsToCards = { second: 2, single: 1, fourth: 4 }
const ordToCard = mapToFunc (ordsToCards)
const getFreqs = pipe([ snd, pairs, map (mapLeft (pipe([ordToCard, toString]))), fromPairs ])

const generateTaskFiles = pipe([ pairs, map (getFreqs) ])

const isMultipleOf = n => m => m % n === 0
const isLastDayOf = {month: isLastDayOfMonth, week: isSunday}
const getUnit = {month: getMonth, week: getWeek}
const epic = ord => unit => date =>
	isLastDayOf[unit] (date) && isMultipleOf (ordToCard (ord)) (getUnit[unit] (date))

const everysToTasks = {
	single: {
		day: K (true),
		week: isSunday,
		month: isLastDayOfMonth,
	},
	second: {
		month: epic ('second') ('month'),
		week: epic ('second') ('week'),
	},
	fourth: {
		week: epic ('fourth') ('week'),
	},
}
const isObject = o => typeof (o) === 'object' && o !== null
const propertyPath = 
	o => isObject (o) 
		? pipe([ 
				Object.entries, 
				ps => ps.length === 1 
					? [ps [0][0], ...propertyPath (ps [0][1])] 
					: [],
			]) (o) 
		: [o]

const getTaskFor = o => gets (K (true)) (propertyPath (o)) (everysToTasks)

const shouldYouDoThisTaskThisDay = day => ({every}) => 
	fromMaybe (false) (ap (getTaskFor (every)) (Just (day)))

const hasTasks = K (true)
const attachTasksToDays = tasks => chain (pipe ([
	day => map ((task) => 
		shouldYouDoThisTaskThisDay (day) (task)
			? Just ({ day, task: task.do })
			: Nothing
	) (tasks),
	justs,
]))
const lodashGroupBy = f => reduce (acc => v =>
	insert (f (v)) ([...(acc[f (v)] ?? []), v]) (acc)
) ({})
	
// const attachTasksToDays = tasks => map (i => map (tasks 
// Interval -> 
const processDates = tasks => pipe([ 
	attachTasksToDays (tasks), 
	map (({day, ...rest}) => ({day: formatISO (day), ...rest})),
	lodashGroupBy (prop ('day')),
	map (map (prop ('task'))),
])

const oneMonthFromNow = addMonths (1) (new Date())
const dates = map (n => addDays (n) (new Date ())) (range (0) (differenceInCalendarDays (new Date()) (oneMonthFromNow)))
const taskFileMain = pipe ([
	readFileSync,
	yaml.load,
	tasks => processDates (tasks) (dates),
	Object.entries,
	map (([day, tasks]) => makeFile (tasks) (parseISO (day))),
])

const allFilePromises = taskFileMain (process.argv.pop()).map(
	({fileName, fileText}) => $`echo ${fileText} >> ${fileName}`
)
Promise.all(allFilePromises)
