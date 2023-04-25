// Code from James Trimble on placing labels from https://github.com/jtrim-ons/labelplacer


function positionLabels(data, bounds, targetYFn, heightFn) {
	data = data.map(d => ({
		targetY: targetYFn(d),
		y: targetYFn(d),
		height: heightFn(d),
		datum: d
	}));
	data.sort((a, b) => a.targetY - b.targetY);
	const result = [];
	for (const datum of data) {
		const batch = {data: [datum]};
		positionBatch(batch, bounds);
		result.push(batch);
		while (
			result.length > 1 &&
            result[result.length - 2].hi > result[result.length - 1].lo
		) {
			const removedBatch = result.pop();
			const lastBatch = result[result.length - 1];
			lastBatch.data.push(...removedBatch.data);
			positionBatch(lastBatch, bounds);
		}
	}

	return result.map(d => d.data).flat();
}

function positionBatch(batch, bounds) {
	const totalHeight = calcTotalHeight(batch.data);

	const middle = findMiddle(batch.data, totalHeight);
	batch.lo = middle - (totalHeight / 2);
	if (batch.lo < bounds[0]) {
		batch.lo = bounds[0];
	} else if (batch.lo > bounds[1] - totalHeight) {
		batch.lo = bounds[1] - totalHeight;
	}

	batch.hi = batch.lo + totalHeight;
	forEachInBlock(batch.data, batch.lo, (d, position) => {
		d.y = position;
	});
}

function findMiddle(data, totalHeight) {
	const targets = [];
	forEachInBlock(data, -totalHeight / 2, (d, position) => {
		targets.push({
			val: d.targetY - position,
			weight: 1 / d.height
		});
	});

	return weightedAverage(targets);
}

function forEachInBlock(data, startPosition, fn) {
	let position = startPosition;
	for (const d of data) {
		position += d.height / 2;
		fn(d, position);
		position += d.height / 2;
	}
}

function calcTotalHeight(data) {
	let totalHeight = 0;
	for (const d of data) {
		totalHeight += d.height;
	}

	return totalHeight;
}

function weightedAverage(items) {
	let sum = 0;
	let weightSum = 0;
	for (const item of items) {
		sum += item.val * item.weight;
		weightSum += item.weight;
	}

	return sum / weightSum;
}
